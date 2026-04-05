import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("No GEMINI_API_KEY found.")
    exit(1)

genai.configure(api_key=api_key)

print("Available Models:")
for m in genai.list_models():
    if "embedContent" in m.supported_generation_methods:
        print(f"Embedding model: {m.name}")
    elif "generateContent" in m.supported_generation_methods:
        print(f"Generation model: {m.name}")
    else:
        print(f"Other model: {m.name} -> {m.supported_generation_methods}")
