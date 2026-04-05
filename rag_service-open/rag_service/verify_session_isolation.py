import os
import shutil
from indexer import run_indexing
from query_engine import query_rag_questions

def verify_sessions():
    session_a = "session_111"
    session_b = "session_222"
    
    # Cleanup previous tests
    if os.path.exists("./chroma_db"):
        pass # Better not delete the whole DB if user is using it
    
    print(f"--- Session A ({session_a}) ---")
    run_indexing("Content for Alpha.", [], collection_name=session_a)
    
    print(f"\n--- Session B ({session_b}) ---")
    run_indexing("Content for Beta.", [], collection_name=session_b)
    
    print("\n--- Querying A ---")
    q_a = query_rag_questions(collection_name=session_a)
    print("Questions A:", q_a)
    
    print("\n--- Querying B ---")
    q_b = query_rag_questions(collection_name=session_b)
    print("Questions B:", q_b)
    
    has_alpha_in_a = any("Alpha" in str(q) for q in q_a)
    has_beta_in_a = any("Beta" in str(q) for q in q_a)
    
    has_alpha_in_b = any("Alpha" in str(q) for q in q_b)
    has_beta_in_b = any("Beta" in str(q) for q in q_b)
    
    print(f"Results for A: Has Alpha={has_alpha_in_a}, Has Beta={has_beta_in_a}")
    print(f"Results for B: Has Alpha={has_alpha_in_b}, Has Beta={has_beta_in_b}")
    
    if has_alpha_in_a and not has_beta_in_a and has_beta_in_b and not has_alpha_in_b:
        print("\nSUCCESS: Sessions are perfectly isolated.")
    else:
        print("\nFAILURE: Session data leaked.")

if __name__ == "__main__":
    verify_sessions()
