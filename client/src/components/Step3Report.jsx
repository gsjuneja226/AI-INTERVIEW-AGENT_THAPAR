import React from 'react'
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { BsFileEarmarkPdfFill, BsStars } from "react-icons/bs"

const FloatingOrb = ({ color, size, top, left, delay, duration }) => (
  <motion.div
    className={`fixed rounded-full filter blur-[100px] opacity-15 pointer-events-none ${color} ${size} z-0`}
    style={{ top, left }}
    animate={{ x: [0, 40, -40, 0], y: [0, -40, 40, 0] }}
    transition={{ duration: duration || 20, repeat: Infinity, ease: "easeInOut", delay: delay || 0 }}
  />
);

function Step3Report({ report }) {
  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm uppercase tracking-widest">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
        Processing Assessment Data...
      </div>
    );
  }
  const navigate = useNavigate()
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    candidateName = "Candidate",
    candidateEmail = "",
    role = "Specialist",
    questionWiseScore = [],
    overallImprovements = "", // New field
  } = report;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0
  }))

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Technical Accuracy", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";
  let jobFit = {};

  if (finalScore >= 8) {
    performanceText = "Excellent Performance";
    shortTagline = "Candidate shows strong command over core concepts.";
    jobFit = {
      status: "Highly Recommended",
      message: "The candidate demonstrates exceptional proficiency and is an excellent fit for the role.",
      color: "text-emerald-600",
      pdfColor: [5, 150, 105],
      bgClass: "bg-emerald-50",
      borderClass: "border-emerald-100",
      icon: <FaCheckCircle className="text-emerald-500 text-3xl mb-4" />
    };
  } else if (finalScore >= 5) {
    performanceText = "Satisfactory Performance";
    shortTagline = "Good foundational knowledge with room for growth.";
    jobFit = {
      status: "Potential Fit",
      message: "The candidate has acceptable skills but may require further training or is better suited for a junior role.",
      color: "text-amber-600",
      pdfColor: [217, 119, 6],
      bgClass: "bg-amber-50",
      borderClass: "border-amber-100",
      icon: <FaExclamationTriangle className="text-amber-500 text-3xl mb-4" />
    };
  } else {
    performanceText = "Further Preparation Needed";
    shortTagline = "Significant knowledge gaps identified in key areas.";
    jobFit = {
      status: "Not Recommended",
      message: "The candidate does not meet the minimum requirements for the job at this time.",
      color: "text-rose-600",
      pdfColor: [225, 29, 72],
      bgClass: "bg-rose-50",
      borderClass: "border-rose-100",
      icon: <FaTimesCircle className="text-rose-500 text-3xl mb-4" />
    };
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 25;

    // Header Section
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, pageWidth, 50, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Interview Assessment Report", pageWidth / 2, 28, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Professional Candidate Evaluation Dossier", pageWidth / 2, 36, { align: "center" });

    currentY = 60;

    // Highlights Box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(`Overall Score: ${finalScore} / 10.0`, margin + 10, currentY + 12);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Result: ${performanceText}`, margin + 10, currentY + 20);

    currentY += 40;

    // Candidate Info
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Candidate Details", margin, currentY);
    
    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Name: ${candidateName}`, margin, currentY);
    doc.text(`Email: ${candidateEmail || "N/A"}`, margin, currentY + 6);
    doc.text(`Applied For: ${role}`, margin, currentY + 12);

    currentY += 25;

    // Competencies
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Core Competencies", margin, currentY);
    
    currentY += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Level of Confidence: ${confidence}/10`, margin, currentY);
    doc.text(`Communication Skills: ${communication}/10`, margin, currentY + 6);
    doc.text(`Technical Accuracy: ${correctness}/10`, margin, currentY + 12);

    currentY += 25;

    // Recommendation
    doc.setFillColor(...jobFit.pdfColor);
    doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`Recommendation: ${jobFit.status}`, margin + 5, currentY + 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const splitMsg = doc.splitTextToSize(jobFit.message, contentWidth - 10);
    doc.text(splitMsg, margin + 5, currentY + 17);

    currentY += 30;

    // Improvements Summary (PDF)
    if (overallImprovements) {
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.text("Growth Roadmap & Improvements", margin, currentY);
        currentY += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const splitImprovements = doc.splitTextToSize(overallImprovements, contentWidth);
        doc.text(splitImprovements, margin, currentY);
        currentY += (splitImprovements.length * 5) + 10;
    }

    // Questions Table
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Assessment Question", "Score", "Suggestion"]],
      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question,
        `${q.score}/10`,
        q.suggestion || "N/A"
      ]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [30, 41, 59], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    doc.save(`${candidateName}_Interview_Report.pdf`);
  };

  return (
    <div className='h-screen w-full bg-slate-50 relative font-sans text-slate-900 overflow-hidden flex flex-col'>
      
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] translate-y-1/2"></div>
      </div>

      <div className='max-w-7xl mx-auto relative z-10 w-full flex flex-col h-full px-6 pt-8'>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6 flex items-center justify-between bg-white border border-slate-100 p-6 rounded-3xl shadow-sm shrink-0'>
          
          <div className='flex items-center gap-6'>
            <button
              onClick={() => navigate("/history")}
              className='w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-600/30 transition-all flex items-center justify-center shadow-sm'>
              <FaArrowLeft size={14} />
            </button>

            <div>
              <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
                {candidateName}
              </h1>
              <div className='flex items-center gap-3'>
                <span className='text-blue-600 text-[8px] font-black uppercase tracking-widest'>
                  {role} Evaluation
                </span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <span className='text-slate-400 text-[8px] font-black uppercase tracking-widest'>
                  {candidateEmail || "Technical Assessment"}
                </span>
              </div>
            </div>
          </div>

          <button onClick={downloadPDF} className='bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-xl transition-all shadow-lg font-black tracking-widest text-[9px] uppercase flex items-center justify-center gap-2.5'>
            <BsFileEarmarkPdfFill size={14} />
            Export Report
          </button>
        </motion.div>

        <div className='flex-1 overflow-y-auto pr-2 scrollbar-hide pb-20'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

            <div className='space-y-6 flex flex-col'>
              {/* Score Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-8 text-center relative overflow-hidden flex flex-col justify-center">
                
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <h3 className="text-slate-300 font-black tracking-widest uppercase mb-8 text-[8px]">
                  Performance Quotient
                </h3>
                
                <div className='relative w-36 h-36 mx-auto'>
                  <CircularProgressbar
                    value={percentage}
                    text={`${score}/10`}
                    styles={buildStyles({
                      textSize: "18px",
                      pathColor: "#2563eb",
                      textColor: "#0f172a",
                      trailColor: "#f8fafc",
                      strokeLinecap: "round"
                    })}
                  />
                </div>

                <div className="mt-8">
                  <p className="font-black text-slate-900 text-lg tracking-tight mb-1">
                    {performanceText}
                  </p>
                  <p className="text-slate-400 text-[10px] font-bold leading-relaxed px-4 lowercase">
                    {shortTagline}
                  </p>
                </div>
              </motion.div>

              {/* Metrics Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className='bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-8 relative overflow-hidden'>
                <h3 className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-8 text-center">
                  Competency Map
                </h3>

                <div className='space-y-8'>
                  {skills.map((s, i) => (
                    <div key={i}>
                      <div className='flex justify-between mb-3'>
                        <span className='font-black text-slate-900 text-[10px] uppercase tracking-wider'>{s.label}</span>
                        <span className='font-black text-blue-600 text-[10px]'>{s.value}/10</span>
                      </div>

                      <div className='bg-slate-50 h-2.5 rounded-full overflow-hidden'>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${s.value * 10}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          className='bg-blue-600 h-full rounded-full shadow-lg shadow-blue-600/10'
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recommendation & Improvements Block */}
              <div className="space-y-6">
                  <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`rounded-[2.5rem] shadow-sm border p-8 relative overflow-hidden flex flex-col items-center justify-center text-center ${jobFit.bgClass} ${jobFit.borderClass}`}>

                      <div className="mb-4">{jobFit.icon}</div>
                      <h3 className={`text-[9px] font-black uppercase tracking-widest mb-2 ${jobFit.color}`}>
                          {jobFit.status}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-bold lowercase">
                          {jobFit.message}
                      </p>
                  </motion.div>

                  {/* Growth Roadmap / Improvements Summary */}
                  <AnimatePresence>
                      {overallImprovements && (
                          <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-blue-600 border border-blue-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden"
                          >
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                  <BsStars className="animate-pulse" /> Growth Roadmap
                              </h3>
                              <p className="text-xs font-bold leading-relaxed italic opacity-95">
                                  {overallImprovements}
                              </p>
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>
            </div>

            <div className='lg:col-span-2 space-y-6'>
              {/* Chart Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className='bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-8'>
                <h3 className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-8">
                  Response Flow Analysis
                </h3>

                <div className='h-60'>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={questionScoreData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: '900' }} />
                      <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: '900' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '1rem', color: '#0f172a', fontWeight: 'bold', fontSize: '10px' }} />
                      <Area type="monotone"
                        dataKey="score"
                        stroke="#2563eb"
                        fill="url(#colorScore)"
                        strokeWidth={4} />
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Questions List */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className='bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-8'>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                    Response Breakdown
                  </h3>
                  <span className='text-[8px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1.5'>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> AUDITED
                  </span>
                </div>

                <div className='space-y-4'>
                  {questionWiseScore.map((q, i) => (
                    <div key={i} className='bg-slate-50/50 p-6 rounded-3xl border border-slate-50 group hover:border-blue-600/30 transition-all'>
                      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
                        <div className="flex-1">
                          <p className="text-[8px] font-black text-blue-600 tracking-widest uppercase mb-2">
                            Session Question {i + 1}
                          </p>
                          <p className="font-bold text-slate-900 text-base leading-snug tracking-tight mb-3">
                            {q.question || "No question text available."}
                          </p>
                          
                          {q.suggestion && (
                              <div className="bg-white/80 border border-blue-50/50 rounded-2xl p-4 mt-2">
                                  <p className="text-[7px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Mentor Context</p>
                                  <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic lowercase">{q.suggestion}</p>
                              </div>
                          )}
                        </div>

                        <div className='bg-white border border-slate-100 text-slate-900 px-4 py-3 rounded-xl font-black text-lg shadow-sm flex items-center justify-center min-w-[80px] group-hover:border-blue-600/30 group-hover:text-blue-600 transition-all'>
                          {q.score ?? 0}<span className='text-slate-300 text-[10px] ml-1'>/10</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step3Report
