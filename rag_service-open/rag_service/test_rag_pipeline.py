import os
import sys
import json
import chromadb
from pypdf import PdfReader
from dotenv import load_dotenv

try:
    from llama_index.llms.openrouter import OpenRouter
except ImportError as exc:
    raise RuntimeError(
        "Missing OpenRouter integration. Install dependencies with "
        "`pip install -r requirements.txt` (requires `llama-index-llms-openrouter`)."
    ) from exc

load_dotenv()

# Add the current directory so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from cloner import clone_repo
from indexer import run_indexing
from query_engine import query_rag_questions

def extract_resume_data(pdf_path):
    if pdf_path == "SESSION_ONLY":
        return "Not available", {"githubUrls": [], "projects": [], "skills": [], "role": "Unknown"}

    print("\n[1] Reading PDF:", pdf_path)
    try:
        reader = PdfReader(pdf_path)
        resume_text = ""
        extracted_links = []
        for page in reader.pages:
            resume_text += page.extract_text() + "\n"
            if "/Annots" in page:
                for annot in page["/Annots"]:
                    annot_obj = annot.get_object()
                    if annot_obj.get("/Subtype") == "/Link":
                        if "/A" in annot_obj and "/URI" in annot_obj["/A"]:
                            extracted_links.append(annot_obj["/A"]["/URI"])
                            
        if extracted_links:
            resume_text += "\n\n--- Extracted Embedded Links ---\n" + "\n".join(extracted_links)
        print(f"--> Extracted {len(resume_text)} characters.")
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return "", {}
    
    print("\n[2] Extracting GitHub and Projects using Gemini 2.0 Flash...")
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("OPENROUTER_API_KEY is missing in .env")
        return resume_text, {}
        
    llm = OpenRouter(model="google/gemini-2.0-flash-001", api_key=api_key)
    
    prompt = f"""
    You are a resume analyzer. Extract the following details from the given resume text in strictly JSON format.
    {{
      "role": "Detected Job Role",
      "experience": "Total Experience",
      "projects": ["Project 1", "Project 2"],
      "skills": ["Skill 1", "Skill 2"],
      "githubUrls": ["List of all GitHub Profile or Repo URLs found"],
      "linkedinUrl": "LinkedIn URL if found, else null"
    }}
    
    Resume Text:
    {resume_text}
    """
    
    response = llm.complete(prompt)
    raw_text = str(response.text if hasattr(response, "text") else response).strip()
    
    try:
        import re
        # Find the JSON block even if it's truncated or wrapped in markdown
        match = re.search(r'\{(.*)\}', raw_text, re.DOTALL)
        if match:
            content = match.group(0)
            try:
                parsed = json.loads(content)
                return resume_text, parsed
            except json.JSONDecodeError:
                # Basic cleanup for common cutoff or trailing comma issues
                cleaned = re.sub(r',\s*\}', '}', content)
                # If it's cut off, try to force close it
                if not cleaned.endswith('}'):
                    cleaned += '"}' 
                try:
                    parsed = json.loads(cleaned)
                    return resume_text, parsed
                except:
                    pass
        
        # If regex/json fails, do a very basic manual extraction
        fallback_data = {
            "role": "Detected Role",
            "experience": "0",
            "projects": [],
            "skills": [],
            "githubUrls": [],
            "linkedinUrl": None
        }
        # Try to find GitHub URLs manually if everything else fails
        github_pattern = r'https?://(?:www\.)?github\.com/[\w\.-]+(?:/[\w\.-]+)?'
        fallback_data["githubUrls"] = list(set(re.findall(github_pattern, resume_text, re.IGNORECASE)))
        
        print(f"Warning: Using fallback data due to parsing failure.")
        return resume_text, fallback_data

    except Exception as e:
        print(f"Failed to parse Gemini output: {e}")
        print(f"--- RAW RESPONSE START ---\n{raw_text}\n--- RAW RESPONSE END ---")
        return resume_text, {}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_rag_pipeline.py <path_to_resume.pdf> [mode] [session_id]")
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    track_mode = sys.argv[2] if len(sys.argv) > 2 else "technical"
    session_id = sys.argv[3] if len(sys.argv) > 3 else "interview_rag"
    
    # Check if session already has indexed data
    db = chromadb.PersistentClient(path="./chroma_db")
    collection_exists = False
    try:
        # Check if collection exists and has documents
        coll = db.get_collection(session_id)
        if coll.count() > 0:
            print(f"--> Found existing collection '{session_id}' with {coll.count()} nodes. Skipping re-indexing.")
            collection_exists = True
    except Exception:
        pass

    if not collection_exists:
        resume_text, parsed_data = extract_resume_data(pdf_path)
        
        github_urls = parsed_data.get("githubUrls", [])
        
        # Regex fallback for GitHub URLs if AI failed or returned nothing
        if not github_urls:
            import re
            github_pattern = r'https?://(?:www\.)?github\.com/[\w\.-]+(?:/[\w\.-]+)?'
            github_urls = list(set(re.findall(github_pattern, resume_text, re.IGNORECASE)))
            if github_urls:
                print(f"--> [DEBUG] Found {len(github_urls)} GitHub URLs via regex fallback.")

        if not github_urls:
            legacy_url = parsed_data.get("githubUrl")
            if legacy_url and legacy_url != "null":
                github_urls = [legacy_url]
                
        if not github_urls:
            print("No GitHub URLs found. RAG pipeline cannot proceed with code analysis.")
            # Even without GitHub, we can still index the resume text itself
            cloned_paths = []
        else:
            projects = parsed_data.get("projects", [])
            print(f"\n[3] Cloning Repository (Session: {session_id})...")
            session_base_dir = os.path.join("cloned_repos", session_id)
            cloned_paths = clone_repo(github_urls, projects, base_dir=session_base_dir)
            
        print("\n[4] Indexing Resume and Code into ChromaDB...")
        index = run_indexing(resume_text, cloned_paths, collection_name=session_id)
        
        if not index:
            print("Indexing failed.")
            sys.exit(1)
    
    print(f"\n[5] Generating Code-Aware Interview Questions for {session_id}...")
    questions = query_rag_questions(track=track_mode, collection_name=session_id)
    
    print("\n==========================================")
    print("      FINAL RAG INTERVIEW QUESTIONS       ")
    print("==========================================")
    if not questions:
        print("No questions were generated.")
    else:
        print("\n===RAG_START===")
        print(json.dumps(questions))
        print("===RAG_END===\n")
        
        for idx, q in enumerate(questions):
            text = q["question"] if isinstance(q, dict) and "question" in q else q
            print(f"{idx+1}. {text}")

