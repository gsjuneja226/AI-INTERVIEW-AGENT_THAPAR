import os
import sys
import json
import git
from pathlib import Path

import urllib.request

def get_repos_for_user(username):
    url = f"https://api.github.com/users/{username}/repos?per_page=100&sort=updated"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return data
    except Exception as e:
        print(f"Error fetching repos for user {username}: {e}")
        return []

def match_projects_to_repos(project_names, repos):
    matched_urls = []
    project_names_lower = [p.lower() for p in project_names]
    for repo in repos:
        repo_name = repo.get("name", "").lower()
        # Substring match: if the repo name is in the project string or vice versa
        for proj in project_names_lower:
            clean_proj = proj.replace(" ", "").replace("-", "")
            clean_repo = repo_name.replace("-", "").replace("_", "")
            if clean_repo in clean_proj or clean_proj in clean_repo:
                matched_urls.append((repo["name"], repo["clone_url"]))
                break
    return matched_urls

def clone_repo(github_urls, project_names, base_dir="cloned_repos"):
    """
    Clones repositories from a list of GitHub URLs.
    Supports a single string, a list of strings, or a JSON-string of URLs.
    """
    if not github_urls or github_urls == "null":
        print("No GitHub URLs provided.")
        return []

    # Parse github_urls if it's a JSON string
    if isinstance(github_urls, str):
        try:
            github_urls = json.loads(github_urls)
            if not isinstance(github_urls, list):
                github_urls = [github_urls]
        except:
            github_urls = [github_urls]

    os.makedirs(base_dir, exist_ok=True)
    repos_to_clone = []

    for github_url in github_urls:
        github_url = github_url.rstrip("/")
        if "github.com/" not in github_url:
            print(f"Invalid GitHub URL format: {github_url}")
            continue
            
        parts = github_url.split("github.com/")
        path_parts = parts[1].split("/")
        
        if len(path_parts) == 1:
            # It's a profile URL
            username = path_parts[0]
            print(f"Detected profile URL. Fetching repos for {username}...")
            repos = get_repos_for_user(username)
            matched = match_projects_to_repos(project_names, repos)
            if not matched:
                print(f"No matching repositories found for projects: {project_names} in user {username}")
                # Fallback: clone the most recently updated repo if none match exactly
                if repos:
                    print(f"Fallback: cloning the most recently updated repository '{repos[0]['name']}'.")
                    repos_to_clone.append((repos[0]['name'], repos[0]['clone_url']))
            else:
                for name, clone_url in matched:
                    repos_to_clone.append((name, clone_url))
        else:
            # It's a direct repo URL
            repo_name = path_parts[1]
            if repo_name.endswith(".git"):
                repo_name = repo_name[:-4]
            repos_to_clone.append((repo_name, github_url))
    
    cloned_paths = []
    for repo_name, clone_url in repos_to_clone:
        target_path = os.path.join(base_dir, repo_name)
        
        if os.path.exists(target_path):
            print(f"Repository {repo_name} already exists at {target_path}. Skipping clone.")
            cloned_paths.append(target_path)
            continue
        
        try:
            print(f"Cloning {clone_url} into {target_path}...")
            git.Repo.clone_from(clone_url, target_path)
            print("Clone successful.")
            cloned_paths.append(target_path)
        except Exception as e:
            print(f"Error cloning repository {repo_name}: {e}")

    return cloned_paths

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python cloner.py <github_url> <project_names_json>")
        sys.exit(1)
    
    url = sys.argv[1]
    try:
        projects = json.loads(sys.argv[2])
    except:
        projects = []
        
    cloned_paths = clone_repo(url, projects)
    print(json.dumps({"cloned_paths": cloned_paths}))
