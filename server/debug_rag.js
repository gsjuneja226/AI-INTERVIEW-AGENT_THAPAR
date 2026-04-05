import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function debugRag() {
    const ragServiceDir = path.resolve(process.cwd(), "..", "rag_service-open", "rag_service");
    // Hardcode absolutePdfPath to the local test pdf
    const absolutePdfPath = path.resolve(ragServiceDir, "test resume.pdf");
    
    const venvPythonExe = path.resolve(ragServiceDir, "..", ".venv", "Scripts", "python.exe");
    const pythonExe = fs.existsSync(venvPythonExe) ? venvPythonExe : 'python';

    console.log("Running python: ", pythonExe);
    console.log("PDF: ", absolutePdfPath);

    const pythonProcess = spawn(pythonExe, ['test_rag_pipeline.py', absolutePdfPath, "technical", "test_session_123"], {
        cwd: ragServiceDir
    });

    let stdoutData = '';
    pythonProcess.stdout.on('data', (data) => {
        const text = data.toString();
        stdoutData += text;
        process.stdout.write(text);
    });

    let stderrData = '';
    pythonProcess.stderr.on('data', (data) => {
        const text = data.toString();
        stderrData += text;
        process.stderr.write(text);
    });

    pythonProcess.on('close', (code) => {
        console.log(`\n\n--- Node Output Captured ---`);
        console.log(`Python process exited with code ${code}`);
        const match = stdoutData.match(/===RAG_START===([\s\S]*?)===RAG_END===/);
        if (match && match[1]) {
            try {
                const parsed = JSON.parse(match[1].trim());
                console.log("SUCCESSFULLY PARSED JSON:", parsed);
            } catch (e) {
                console.error("FAIL PARSING JSON:", e);
                console.log("RAW STRING:", match[1].trim());
            }
        } else {
            console.log("===RAG_START=== block was NOT FOUND in stdout!");
        }
    });
}

debugRag();
