import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import { spawn } from "child_process";
import path from "path";

// Helper: extract text from PDF buffer
async function extractPdfText(filepath) {
  const fileBuffer = await fs.promises.readFile(filepath);
  const uint8Array = new Uint8Array(fileBuffer);
  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
  let text = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(" ") + "\n";
  }
  return text.replace(/\s+/g, " ").trim();
}

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    const filepath = req.file.path

    const fileBuffer = await fs.promises.readFile(filepath)
    const uint8Array = new Uint8Array(fileBuffer)

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    }


    resumeText = resumeText
      .replace(/\s+/g, " ")
      .trim();

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON, without any markdown formatting, backticks, or extra text:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`
      },
      {
        role: "user",
        content: resumeText
      }
    ];


    const aiResponse = await askAi(messages)

    let parsed = { role: "", experience: "", projects: [], skills: [] };
    try {
      const cleaned = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.log("AI JSON parsing error in analyzeResume:", e);
    }

    const sessionId = Date.now().toString();

    // Start RAG background process (Indexing + Cloning)
    // We don't await this so the user gets their role/skills instantly
    const ragServiceDir = path.resolve(process.cwd(), "..", "rag_service-open", "rag_service");
    const venvPythonExe = path.resolve(ragServiceDir, "..", ".venv", "Scripts", "pythonw.exe");
    const pythonExe = fs.existsSync(venvPythonExe) ? venvPythonExe : 'pythonw';

    // Spawn Python in background to index the PDF
    const pythonProcess = spawn(pythonExe, ['test_rag_pipeline.py', path.resolve(filepath), "technical", sessionId], {
      cwd: ragServiceDir,
      detached: true, // Allow it to live longer than the request
      stdio: 'ignore'
    });
    pythonProcess.unref();

    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText,
      sessionId
    });

  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ message: error.message });
  }
};


// ──────────────────────────────────────────────
// Validate Resume against a given Designation
// POST /api/interview/validate-resume
// Body: FormData { resume (file), designation (string) }
// No credits consumed.
// ──────────────────────────────────────────────
export const validateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file required." });
    }

    const designation = (req.body.designation || "").trim();
    if (!designation) {
      return res.status(400).json({ message: "Designation is required." });
    }

    const filepath = req.file.path;
    let resumeText = "";
    try {
      resumeText = await extractPdfText(filepath);
    } finally {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }

    const messages = [
      {
        role: "system",
        content: `You are a strict HR screening system.
Your job is to determine if a candidate's resume is suitable for a given job designation.

Analyze the resume content carefully:
- Look at the candidate's listed roles, job titles, skills, experience, and projects.
- Compare them against the target designation.
- Be strict: if core skills or relevant experience for the designation are missing, mark as NOT suitable.
- A software engineer resume is NOT suitable for a Data Scientist role, and vice versa.

Return ONLY valid JSON, no markdown, no backticks, no extra text:
{
  "suitable": true or false,
  "reason": "one sentence explanation (max 20 words)"
}`
      },
      {
        role: "user",
        content: `Target Designation: ${designation}\n\nResume:\n${resumeText.slice(0, 4000)}`
      }
    ];

    const aiResponse = await askAi(messages);

    let result = { suitable: false, reason: "Unable to determine suitability." };
    try {
      const cleaned = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
      result = JSON.parse(cleaned);
    } catch (e) {
      console.log("validateResume JSON parse error:", e.message);
    }

    return res.json(result);
  } catch (error) {
    console.error("validateResume error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: error.message });
  }
};


export const generateQuestion = async (req, res) => {
  try {
    const { role, experience, mode, candidateName, candidateEmail, resumeText, projects, skills, sessionId: clientSessionId } = req.body;

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." });
    }

    const sessionId = clientSessionId || Date.now().toString();
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.credits < 2) {
      return res.status(400).json({ message: "Not enough credits (Minimum 2 required)." });
    }

    const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";
    const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";
    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
Generate 5 AI interview questions based on:
    Role: ${role}
    Experience: ${experience}
    Interview Mode: ${mode}
    Candidate: ${candidateName}
    Skills/Resume: ${safeResume.slice(0, 1000)}
    
    Difficulty progression:
    Question 1 → easy
    Question 2 → easy
    Question 3 → medium
    Question 4 → medium
    Question 5 → hard
    
    Return each question on a new line. Just questions, no numbers.
    `;

    const messages = [
      {
        role: "system",
        content: `You are an expert ${mode} interviewer. Follow instructions precisely.`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];

    const filepath = req.file?.path;
    let ragPromise = Promise.resolve([]);

    if (filepath || clientSessionId) {
      const ragServiceDir = path.resolve(process.cwd(), "..", "rag_service-open", "rag_service");
      const trackMode = (mode.toLowerCase().includes("tech") || mode.toLowerCase().includes("code")) ? "technical" : "hr";

      ragPromise = new Promise((resolve) => {
        const venvPythonExe = path.resolve(ragServiceDir, "..", ".venv", "Scripts", "pythonw.exe");
        const pythonExe = fs.existsSync(venvPythonExe) ? venvPythonExe : 'pythonw';
        const arg1 = filepath ? path.resolve(filepath) : "SESSION_ONLY";

        const pythonProcess = spawn(pythonExe, ['test_rag_pipeline.py', arg1, trackMode, sessionId], {
          cwd: ragServiceDir,
          env: { ...process.env, PYTHONUNBUFFERED: "1" }
        });

        // Prevention of hanging: if the process fails to start (e.g. command not found)
        pythonProcess.on('error', (err) => {
          console.error(`Failed to spawn RAG process for ${sessionId}:`, err);
          resolve([]); // Ensure the promise resolves so the main request doesn't hang
        });


        let stdoutData = '';
        pythonProcess.stdout.on('data', (data) => { stdoutData += data.toString(); });
        let stderrData = '';
        pythonProcess.stderr.on('data', (data) => { stderrData += data.toString(); });

        pythonProcess.on('close', (code) => {
          console.log(`RAG process for ${sessionId} closed with code ${code}`);
          const logEntry = `\n--- [${new Date().toISOString()}] RAG Execution (${sessionId}) ---\n` +
            `Code: ${code}\n` +
            `STDOUT: ${stdoutData}\n` +
            `STDERR: ${stderrData}\n` +
            `-----------------------------------\n`;

          try {
            fs.appendFileSync(path.join(process.cwd(), "rag_execution.log"), logEntry);
          } catch (err) {
            console.error("Failed to write to rag_execution.log:", err);
          }

          try {
            const match = stdoutData.match(/===RAG_START===([\s\S]*?)===RAG_END===/);
            if (match && match[1]) {
              const parsed = JSON.parse(match[1].trim());
              resolve(parsed);
            } else {
              resolve([]);
            }
          } catch (e) {
            console.error("RAG Outcome Error:", e);
            resolve([]);
          }
        });

        setTimeout(() => {
          console.log(`RAG process for ${sessionId} timed out after 5 minutes.`);
          pythonProcess.kill();
          resolve([]);
        }, 300000); // 5 Minutes
      });
    }


    const [aiResponse, ragQuestionsRaw] = await Promise.all([
      askAi(messages),
      ragPromise
    ]);

    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({ message: "AI returned empty response." });
    }

    const questionsArrayRaw = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .map((q) => q.replace(/^\s*\d+[\.\)]\s*/, ""));

    let questionsArray = questionsArrayRaw.slice(0, 5);
    while (questionsArray.length < 5) {
      questionsArray.push("Based on your experience, explain one key decision you made during a relevant project?");
    }

    const ragArray = Array.isArray(ragQuestionsRaw) ? ragQuestionsRaw : [];
    let cleanRagQuestions = ragArray.map((q) => {
      if (typeof q === 'string') return q;
      if (q && q.question) return q.question;
      return "";
    }).filter(Boolean).slice(0, 5);

    const fallbackRagQuestions = [
      "Can you explain a challenging technical or behavioral trade-off you faced in your project context?",
      "How did you ensure code quality and maintainability in your most recent project?",
      "Describe a time when you had to debug a difficult production issue. What was your approach?",
      "How do you prioritize tasks when faced with tight deadlines and changing requirements?",
      "Can you walk me through the architecture of a major feature you built from scratch?"
    ];

    while (cleanRagQuestions.length < 5) {
      cleanRagQuestions.push(fallbackRagQuestions[cleanRagQuestions.length]);
    }

    const combinedQuestions = [...questionsArray, ...cleanRagQuestions].slice(0, 10);
    user.credits -= 2;
    await user.save();

    const difficultyMap = ["easy", "easy", "medium", "medium", "hard", "medium", "medium", "hard", "hard", "hard"];
    const timeLimitMap = [60, 60, 90, 90, 120, 90, 90, 120, 120, 150];

    const interview = await Interview.create({
      userId: user._id,
      candidateName: candidateName || "Unknown Candidate",
      candidateEmail: candidateEmail || "",
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: combinedQuestions.map((q, index) => ({
        question: q,
        difficulty: difficultyMap[index] || "medium",
        timeLimit: timeLimitMap[index] || 90,
      }))
    });

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      candidateName: interview.candidateName,
      questions: interview.questions
    });
  } catch (error) {
    console.error("generateQuestion failed:", error);
    return res.status(500).json({ message: `failed to create interview ${error.message}` });
  }
};


export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body

    const interview = await Interview.findById(interviewId)
    const question = interview.questions[questionIndex]

    // If no answer
    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback
      });
    }

    // If time exceeded
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback
      });
    }


    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):
1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Calculate finalScore = average of confidence, communication, and correctness (round to nearest whole number).

Feedback & Suggestion:
- feedback: State whether the answer was correct or clear (max 15 words).
- suggestion: Provide one specific, actionable tip to improve this specific answer or delivery (max 20 words).

Return ONLY valid JSON format:
{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "string",
  "suggestion": "string"
}
`
      },
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];


    const aiResponse = await askAi(messages)


    let parsed = {
      confidence: 0,
      communication: 0,
      correctness: 0,
      finalScore: 0,
      feedback: "Analysis error. Unable to process answer.",
      suggestion: "Maintain steady eye contact and try to structure your answer more clearly."
    };

    try {
      const cleaned = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.log("AI JSON parsing error in submitAnswer:", e);
    }

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;
    question.suggestion = parsed.suggestion || "";
    await interview.save();


    return res.status(200).json({ feedback: parsed.feedback })
  } catch (error) {
    return res.status(500).json({ message: `failed to submit answer ${error}` })

  }
}


export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body
    const interview = await Interview.findById(interviewId)
    if (!interview) {
      return res.status(400).json({ message: "failed to find Interview" })
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions
      ? totalScore / totalQuestions
      : 0;

    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    // AI Overall Improvements Synthesis
    let overallImprovements = "Candidate demonstrated a baseline understanding of the role's requirements. Continued practice in structuring responses logically is recommended.";
    try {
      const evaluationContext = interview.questions.map((q, i) => 
        `Q${i+1}: ${q.question}\nAnswer: ${q.answer}\nFeedback: ${q.feedback}`
      ).join("\n\n");

      const messages = [
        {
          role: "system",
          content: `You are a senior interview coach. Summarize the candidate's performance across the entire interview. 
          Identify 2-3 key areas for improvement. Be professional and encouraging. 
          Keep it under 60 words. Use plain text, no markdown bullets.`
        },
        {
          role: "user",
          content: `Interview for ${interview.role}.\n\nEvaluation History:\n${evaluationContext}`
        }
      ];

      const aiSummary = await askAi(messages);
      if (aiSummary) overallImprovements = aiSummary.trim();
    } catch (err) {
      console.error("AI overallImprovements error:", err);
    }

    interview.finalScore = finalScore;
    interview.overallImprovements = overallImprovements;
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      overallImprovements: interview.overallImprovements,
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        suggestion: q.suggestion || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
      candidateName: interview.candidateName,
      candidateEmail: interview.candidateEmail,
      role: interview.role
    })
  } catch (error) {
    return res.status(500).json({ message: `failed to finish Interview ${error}` })
  }
}


export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt candidateName candidateEmail");

    return res.status(200).json(interviews)

  } catch (error) {
    return res.status(500).json({ message: `failed to find currentUser Interview ${error}` })
  }
}

export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }


    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });
    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    return res.json({
      finalScore: interview.finalScore,
      overallImprovements: interview.overallImprovements || "",
      candidateName: interview.candidateName,
      candidateEmail: interview.candidateEmail,
      role: interview.role,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions
    });

  } catch (error) {
    return res.status(500).json({ message: `failed to find currentUser Interview report ${error}` })
  }
}




