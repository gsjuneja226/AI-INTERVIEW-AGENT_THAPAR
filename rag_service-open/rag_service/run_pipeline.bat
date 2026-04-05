@echo off
cd %~dp0
call ..\.venv\Scripts\activate.bat
python test_rag_pipeline.py "test resume.pdf"
pause
