import os
import json
import chromadb
from llama_index.core import (
    VectorStoreIndex,
    StorageContext,
    Document,
    SimpleDirectoryReader,
    Settings
)
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import HierarchicalNodeParser, SentenceSplitter
from dotenv import load_dotenv

try:
    from llama_index.llms.openrouter import OpenRouter
except ImportError as exc:
    raise RuntimeError(
        "Missing OpenRouter integration. Install dependencies with "
        "`pip install -r requirements.txt` (requires `llama-index-llms-openrouter`)."
    ) from exc

load_dotenv()

def run_indexing(resume_text, cloned_repo_paths, collection_name="interview_rag"):
    """
    Indexes both the resume text and the cloned codebase into a unified ChromaDB vector store.
    Supports a list of paths or a JSON-string of paths.
    """
    # Parse cloned_repo_paths if it's a JSON string
    if isinstance(cloned_repo_paths, str):
        try:
            cloned_repo_paths = json.loads(cloned_repo_paths)
        except:
            # Fallback if it's just a single path string
            cloned_repo_paths = [cloned_repo_paths]

    # Setup OpenRouter as LLM
    api_key = os.getenv("OPENROUTER_API_KEY")
    Settings.llm = OpenRouter(
        api_key=api_key, 
        model="google/gemini-2.0-flash-001"
    )
    
    # Setup local embeddings
    Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

    # Setup ChromaDB
    db = chromadb.PersistentClient(path="./chroma_db")
    chroma_collection = db.get_or_create_collection(collection_name)
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    # 1. Index Resume Text
    resume_doc = Document(text=resume_text, metadata={"type": "resume"})
    
    # 2. Index Cloned Codebase(s)
    code_docs = []
    for repo_path in cloned_repo_paths:
        if repo_path and os.path.exists(repo_path):
            print(f"Indexing project at: {repo_path}")
            reader = SimpleDirectoryReader(
                input_dir=repo_path,
                recursive=True,
                required_exts=[".py", ".js", ".ts", ".html", ".css", ".go", ".java", ".cpp", ".c"],
            )
            project_docs = reader.load_data()
            project_name = os.path.basename(repo_path.rstrip(os.sep))
            for doc in project_docs:
                full_path = doc.metadata.get("file_path", "")
                rel_path = os.path.relpath(full_path, repo_path) if full_path else "unknown"
                
                doc.metadata["type"] = "code"
                doc.metadata["project_name"] = project_name
                doc.metadata["file_name"] = rel_path
                
                # Explicitly manage what metadata the LLM sees to focus on context
                doc.excluded_llm_metadata_keys = ["project_path", "file_path", "file_type", "file_size", "creation_date", "last_modified_date"]
            code_docs.extend(project_docs)

    # Use SentenceSplitter to reduce number of chunks instead of Hierarchical
    parser = SentenceSplitter(
        chunk_size=1024,
        chunk_overlap=20
    )
    nodes = parser.get_nodes_from_documents(code_docs + [resume_doc])

    # Create Index
    index = VectorStoreIndex(
        nodes,
        storage_context=storage_context,
    )
    
    print(json.dumps({"status": "success", "nodes_indexed": len(nodes), "collection": collection_name}))
    return index

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python indexer.py <resume_text> <cloned_repo_path>")
        sys.exit(1)
    
    resume_text = sys.argv[1]
    repo_path = sys.argv[2]
    
    run_indexing(resume_text, repo_path)
