import os
import sys
import json
import logging
import chromadb
from llama_index.core import (
    VectorStoreIndex,
    StorageContext,
    Settings
)
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from dotenv import load_dotenv

try:
    from llama_index.llms.openrouter import OpenRouter
except ImportError as exc:
    raise RuntimeError(
        "Missing OpenRouter integration. Install dependencies with "
        "`pip install -r requirements.txt` (requires `llama-index-llms-openrouter`)."
    ) from exc

# Suppress verbose 'UNEXPECTED' warnings from transformers
logging.getLogger("transformers.modeling_utils").setLevel(logging.ERROR)

load_dotenv()

def query_rag_questions(track="technical", collection_name="interview_rag"):
    """
    Retrieves context from RAG store and generates non-generic interview questions
    based on the specified track ('hr' or 'technical').
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OPENROUTER_API_KEY must be set in the environment.")
        return []
    
    # Setup OpenRouter as LLM
    Settings.llm = OpenRouter(
        api_key=api_key, 
        model="google/gemini-2.0-flash-001"
    )
    
    # Setup local embeddings
    Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

    # Setup ChromaDB
    db = chromadb.PersistentClient(path="./chroma_db")
    try:
        chroma_collection = db.get_collection(collection_name)
    except Exception as e:
        print(f"Error loading collection: {e}")
        return []

    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    index = VectorStoreIndex.from_vector_store(vector_store)

    query_engine = index.as_query_engine(similarity_top_k=10)

    if track.lower() == "hr":
        prompt = """
        You are an expert HR and behavioral interviewer. I will provide you with snippets of the candidate's resume and project codebase as context.
        Your task is NOT to explain what the context code does. Instead, your task is to act as an HR interviewer interviewing the author of this code.
        
        Generate exactly 5 highly specific interview questions. 
        
        Requirements:
        - 3 questions MUST focus on their general resume background and soft skills.
        - 2 questions MUST reference specific choices in their project context from the retrieved files.
        - The questions MUST be easily answerable at a quick pace (e.g., assessing teamwork, decision-making, conflict resolution, or high-level choices).
        - Do NOT ask them to write code or explain low-level line-by-line syntax.
        - Focus heavily on their soft skills, adaptability, handling of real-life situational challenges, and overall impact.
        
        Reference specific real-life situations they might face or reference specific project names/technologies to prove you read their profile.
        
        Return exactly 5 questions as a JSON list of strings. Do not include any other text.
        """
    else:
        prompt = """
        You are an expert technical interviewer. I will provide you with snippets of the candidate's resume and project codebase as context. 
        Each code snippet includes metadata like 'project_name' and 'file_name'.
        
        Your task is NOT to explain what the context code does. Instead, your task is to act as a technical interviewer interviewing the author of this code.
        
        Generate exactly 5 highly specific, in-depth technical interview questions based on the provided context. 

        CRITICAL STRUCTURE RULE (at least 3 questions):
        - Format: "In the project [project_name], specifically in [file_name] (strive for simpler clarity, e.g. instead of 'src/components/MyModule.js', just say 'MyModule.js'), you used [specific logic/pattern], why...?"

        Requirements:
        - 3 questions MUST focus deeply on their project context and codebase decisions using the simplified file naming format above.
        - 2 questions MUST focus on technical scenarios related to their resume skills.
        - The questions MUST focus on real-life technical situations.
        - Reference specific file names, function names, and variable names from the code.
        
        Return exactly 5 questions as a JSON list of strings. Do not include any other text.
        """

    response = query_engine.query(prompt)
    raw_text = str(response.response if hasattr(response, "response") else response).strip()
    
    # Robust JSON extraction
    try:
        import re
        # Look for the last JSON block or array in case there's preceding text
        # Match from the LAST '[' to the LAST ']' to handle potential nested arrays or partial prefixes
        match = re.search(r'\[\s*(.*)\s*\]', raw_text, re.DOTALL)
        if match:
            # We want to be careful here if the LLM has cut off the end
            content = match.group(0)
            
            # Simple repair logic for truncated JSON (limited approach)
            if not content.endswith(']'):
                # Try to find the last complete string or comma if it's cut off
                # But here we search for [ to ] so if it has ], it's not truncated in a simple way
                pass
                
            try:
                questions = json.loads(content)
                if isinstance(questions, list):
                    return [str(q) for q in questions if q][:5]
            except json.JSONDecodeError:
                # If JSON fails, try cleaning up common issues like trailing commas
                cleaned = re.sub(r',\s*\]', ']', content)
                try:
                    questions = json.loads(cleaned)
                    return [str(q) for q in questions if q][:5]
                except:
                    pass

        # Fallback 1: Line by line extraction
        lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
        questions = []
        for line in lines:
            # Clean up markdown bullet points or numbers
            q = re.sub(r'^[\s\d\.\-\*\"\'\[]+|[\s\"\'\]\,]+$', '', line).strip()
            if q and '?' in q:
                questions.append(q)
        
        if questions:
            return questions[:5]
            
        raise ValueError(f"Failed to extract questions from raw response.")
        
    except Exception as e:
        print(f"Error parsing questions from AI: {e}")
        print(f"--- RAW RESPONSE START ---\n{raw_text}\n--- RAW RESPONSE END ---")
        return [
            "Can you explain a challenging technical trade-off you faced in your project context?",
            "How did you ensure code quality and maintainability in your most recent project?",
            "Describe a time when you had to debug a difficult production issue. What was your approach?",
            "How do you prioritize tasks when faced with tight deadlines and changing requirements?",
            "Can you walk me through the architecture of a major feature you built from scratch?"
        ]

if __name__ == "__main__":
    track = sys.argv[1] if len(sys.argv) > 1 else "technical"
    questions = query_rag_questions(track=track)
    print(json.dumps({"questions": questions}))
