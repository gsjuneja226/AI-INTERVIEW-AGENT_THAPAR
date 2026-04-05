import React from 'react'
import { motion, AnimatePresence } from "motion/react"
import {
    FaUserTie,
    FaBriefcase,
    FaCode,
    FaMicrochip
} from "react-icons/fa";
import {
    BsStars,
    BsLightningFill,
    BsFileEarmarkPdf,
    BsTerminalFill,
    BsCheckCircleFill,
    BsXCircleFill,
    BsShieldExclamation,
    BsArrowRightCircleFill,
    BsCpu
} from "react-icons/bs";
import { useState } from 'react';
import axios from "axios"
import { ServerUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';

// ── Rejection Modal ────────────────────────────────────────────────────
function RejectionModal({ reason, designation, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-white border border-slate-200 rounded-[2rem] p-10 shadow-2xl overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col items-center text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                        className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-6 shadow-sm"
                    >
                        <BsShieldExclamation className="text-rose-500 text-3xl" />
                    </motion.div>

                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Resume Not Suitable
                    </h2>
                    <p className="text-slate-500 text-sm mt-2 font-medium">
                        Your profile does not currently align with the <span className="text-rose-600 font-bold">{designation}</span> role requirements.
                    </p>
                </div>

                <div className="relative z-10 bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest mb-3 uppercase">AI Analysis Summary:</p>
                    <p className="text-slate-700 text-sm leading-relaxed font-medium">
                        {reason || "The uploaded resume does not meet the necessary technical criteria for this specific designation."}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg"
                >
                    Upload Different Resume
                </button>
            </motion.div>
        </motion.div>
    );
}

// ── Synthesis Modal ───────────────────────────────────────────────────
function SynthesisModal({ role }) {
    const [progress, setProgress] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);

    const statuses = [
        { label: "INITIALIZING ASSESSMENT CORE", sub: "Bootstrapping LLM context..." },
        { label: "CLONING SOURCE REPOSITORIES", sub: "Fetching project history via secure tunnel..." },
        { label: "ANALYZING SYSTEM ARCHITECTURE", sub: "Identifying patterns and design paradigms..." },
        { label: "GENERATING SEMANTIC EMBEDDINGS", sub: "Constructing vector space for RAG indexing..." },
        { label: "SYNCHRONIZING DOSSIER INTELLIGENCE", sub: "Mapping resume data to technical context..." },
        { label: "INTEGRATING PROBE POINTS", sub: "Synthesizing deep-dive probe questions..." },
        { label: "FINALIZING ASSESSMENT FORGE", sub: "Synchronizing session state with RAG engine..." }
    ];

    React.useEffect(() => {
        const totalDuration = 180000; // 3 minutes
        const interval = 100;
        const step = (interval / totalDuration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev + step;
                return next >= 100 ? 100 : next;
            });
        }, interval);

        const statusTimer = setInterval(() => {
            setStatusIndex(prev => (prev < statuses.length - 1 ? prev + 1 : prev));
        }, 25000);

        return () => {
            clearInterval(timer);
            clearInterval(statusTimer);
        };
    }, [statuses.length]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-50/98 backdrop-blur-2xl"
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[160px] animate-pulse" />
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative w-full max-w-2xl text-center"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 mx-auto mb-8 border-t-2 border-r-2 border-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.15)]"
                >
                    <FaMicrochip className="text-3xl text-blue-600" />
                </motion.div>

                <div className="space-y-2 mb-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={statusIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            <h3 className="text-[9px] font-black text-blue-600 tracking-[0.4em] uppercase">Intelligence Synthesis</h3>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                                {statuses[statusIndex].label}
                            </h2>
                            <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest pt-1 italic">
                                {statuses[statusIndex].sub}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="max-w-md mx-auto relative px-8 py-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
                    <div className="flex justify-between items-end mb-4">
                        <div className="text-left">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Process Progress</span>
                            <div className="text-2xl font-black text-blue-600 font-mono leading-none">{Math.floor(progress)}%</div>
                        </div>
                        <div className="text-right">
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estimated Wait</span>
                           <div className="text-blue-600 font-mono text-sm tracking-widest font-black">~ {Math.max(0, 180 - Math.floor(progress * 1.8))}s</div>
                        </div>
                    </div>

                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                        <motion.div
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400"
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                            Generating deep-dive context for <span className="text-blue-600 italic">{role}</span> profile. 
                            <br />Initial sync may take up to 3 minutes.
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────
function Step1SetUp({ onStart }) {
    const { userData } = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [candidateName, setCandidateName] = useState("");
    const [candidateEmail, setCandidateEmail] = useState("");
    const [mode, setMode] = useState("Technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [validating, setValidating] = useState(false);
    const [rejectionModal, setRejectionModal] = useState(null);
    const [sessionId, setSessionId] = useState("");

    React.useEffect(() => {
        if (resumeFile && !analysisDone) {
            handleUploadResume();
        }
    }, [resumeFile, analysisDone]);

    const handleUploadResume = async () => {
        if (!resumeFile || analyzing) return;
        setAnalyzing(true)
        const formdata = new FormData()
        formdata.append("resume", resumeFile)
        try {
            const result = await axios.post(ServerUrl + "/api/interview/resume", formdata, { withCredentials: true })
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            setSessionId(result.data.sessionId || "");
            setAnalysisDone(true);
            setAnalyzing(false);
        } catch (error) {
            console.log(error)
            setAnalyzing(false);
        }
    }

    const handleStart = async () => {
        if (!role || !experience || !candidateName) return;

        if (resumeFile) {
            setValidating(true);
            try {
                const fd = new FormData();
                fd.append("resume", resumeFile);
                fd.append("designation", role);
                const { data } = await axios.post(ServerUrl + "/api/interview/validate-resume", fd, { withCredentials: true });
                setValidating(false);

                if (!data.suitable) {
                    setRejectionModal({ reason: data.reason, designation: role });
                    return;
                }
            } catch (err) {
                setValidating(false);
                console.error("Validation error:", err);
            }
        }

        setLoading(true)
        try {
            const formdata = new FormData()
            if (resumeFile) formdata.append("resume", resumeFile);
            formdata.append("role", role);
            formdata.append("experience", experience);
            formdata.append("mode", mode);
            formdata.append("candidateName", candidateName);
            formdata.append("candidateEmail", candidateEmail);
            formdata.append("sessionId", sessionId);

            const result = await axios.post(ServerUrl + "/api/interview/generate-questions", formdata, { withCredentials: true })
            if (userData) {
                dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }))
            }
            setLoading(false)
            onStart(result.data)

        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    const handleRejectionClose = () => {
        setRejectionModal(null);
        setAnalysisDone(false);
        setResumeFile(null);
        setProjects([]);
        setSkills([]);
        setResumeText("");
    };

    const isButtonBusy = loading || validating;
    const buttonLabel = validating
        ? "Screening Resume..."
        : loading
            ? "Setting up Session..."
            : "Launch Virtual Assessment";

    const isProfileReady = !!(role && experience && candidateName);

    return (
        <div
            className="
                h-screen w-full 
                flex items-start justify-center 
                bg-[#fcfdfe] 
                px-6 py-6 
                text-slate-900 
                font-[IBM Plex Sans] 
                relative overflow-y-auto scrollbar-hide
            "
        >
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[140px] opacity-40" />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[130px] opacity-40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='relative z-10 w-full max-w-xl bg-white/70 backdrop-blur-xl border border-white/50 p-6 md:p-8 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(37,99,235,0.08)] mt-4 mb-10'
            >
                <div className="text-center mb-6 relative z-10">
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                        <BsLightningFill className="text-indigo-600 text-[9px]" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-700">Practice Module Alpha</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                        Assessment <span className="text-indigo-600">Forge.</span>
                    </h2>
                </div>

                <div className='space-y-4 relative z-10'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <div className='relative group'>
                            <FaUserTie className={`absolute top-1/2 -translate-y-1/2 left-4 transition-colors text-xs ${candidateName ? 'text-indigo-600' : 'text-slate-300'}`} />
                            <input type='text' placeholder='Candidate Name'
                                className='w-full pl-10 pr-1 pr-10 py-3 bg-slate-50/50 border border-slate-100 rounded-xl outline-none font-bold text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:border-indigo-600/30 transition-all shadow-sm'
                                onChange={(e) => setCandidateName(e.target.value)} value={candidateName} />
                            {candidateName && <BsCheckCircleFill className="absolute top-1/2 -translate-y-1/2 right-4 text-emerald-500 text-[9px]" />}
                        </div>

                        <div className='relative group'>
                            <div className={`absolute top-1/2 -translate-y-1/2 left-4 transition-colors text-[10px] font-black ${candidateEmail ? 'text-indigo-600' : 'text-slate-300'}`}>@</div>
                            <input type='email' placeholder='Contact Email'
                                className='w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl outline-none font-bold text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:border-indigo-600/30 transition-all shadow-sm'
                                onChange={(e) => setCandidateEmail(e.target.value)} value={candidateEmail} />
                        </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <div className='relative group'>
                            <BsTerminalFill className={`absolute top-1/2 -translate-y-1/2 left-4 transition-colors text-xs ${role ? 'text-indigo-600' : 'text-slate-300'}`} />
                            <input type='text' placeholder='Target Designation'
                                className='w-full pl-10 pr-1 pr-10 py-3 bg-slate-50/50 border border-slate-100 rounded-xl outline-none font-bold text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:border-indigo-600/30 transition-all shadow-sm'
                                onChange={(e) => setRole(e.target.value)} value={role} />
                            {role && <BsCheckCircleFill className="absolute top-1/2 -translate-y-1/2 right-4 text-emerald-500 text-[9px]" />}
                        </div>

                        <div className='relative group'>
                            <FaBriefcase className={`absolute top-1/2 -translate-y-1/2 left-4 transition-colors text-xs ${experience ? 'text-indigo-600' : 'text-slate-300'}`} />
                            <input type='text' placeholder='Exp (e.g. 3 Yrs)'
                                className='w-full pl-10 pr-1 pr-10 py-3 bg-slate-50/50 border border-slate-100 rounded-xl outline-none font-bold text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:border-indigo-600/30 transition-all shadow-sm'
                                onChange={(e) => setExperience(e.target.value)} value={experience} />
                            {experience && <BsCheckCircleFill className="absolute top-1/2 -translate-y-1/2 right-4 text-emerald-500 text-[9px]" />}
                        </div>
                    </div>

                    <div className='relative'>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Assessment Track</p>
                        <div className="grid grid-cols-2 gap-3">
                            {['Technical', 'HR'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mode === m ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-white'}`}
                                >
                                    {m === 'Technical' ? <BsCpu /> : <BsStars />}
                                    {m} Focus
                                </button>
                            ))}
                        </div>
                    </div>

                    {!analysisDone ? (
                        <div className='mt-2'>
                            <motion.div
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => document.getElementById("resumeUpload").click()}
                                className={`relative border-2 border-dashed rounded-[1.5rem] p-6 text-center cursor-pointer transition-all overflow-hidden bg-slate-50/50 ${analyzing ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                            >
                                <div className='flex flex-col items-center justify-center gap-2 relative z-10'>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${analyzing ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white text-indigo-600 shadow-sm border border-slate-50'}`}>
                                        <BsFileEarmarkPdf size={18} />
                                    </div>
                                    <div>
                                        <p className='text-slate-900 font-black text-xs mb-0.5 uppercase tracking-tight'>
                                            {resumeFile ? resumeFile.name : "Inject Resume Dossier"}
                                        </p>
                                        <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">
                                            {analyzing ? "Synthesizing Profile Data..." : "Analyze projects & technical arsenal"}
                                        </p>
                                    </div>
                                </div>
                                {analyzing && (
                                    <motion.div
                                        initial={{ top: "-100%" }}
                                        animate={{ top: "200%" }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-indigo-400/10 to-transparent z-0"
                                    />
                                )}
                                <input type="file" accept="application/pdf" id="resumeUpload" className='hidden' onChange={(e) => setResumeFile(e.target.files[0])} />
                            </motion.div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className='bg-white border border-indigo-600/30 rounded-[1.5rem] p-4 shadow-xl relative overflow-hidden mt-2'
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className='flex items-center justify-between mb-3 border-b border-slate-50 pb-2 relative z-10'>
                                <h3 className='text-[8px] font-black text-indigo-600 flex items-center gap-2 tracking-[0.2em] uppercase'>
                                    <BsCheckCircleFill className="text-indigo-600" size={10} /> Intelligence Extracted
                                </h3>
                                <button onClick={() => { setAnalysisDone(false); setResumeFile(null); }} className='px-2 py-0.5 text-[8px] font-black text-slate-400 bg-slate-50 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all uppercase tracking-widest border border-slate-100'>Eject</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                {projects.length > 0 && (
                                    <div>
                                        <p className='font-black text-slate-400 text-[7px] tracking-widest mb-2 uppercase flex items-center gap-2'><FaBriefcase className="text-indigo-400" /> Key Ventures</p>
                                        <ul className='space-y-1'>
                                            {projects.slice(0, 2).map((p, i) => (
                                                <li key={i} className='text-slate-700 text-[9px] font-black leading-tight line-clamp-1 flex gap-1.5 items-start'>
                                                    <span className='w-0.5 h-0.5 rounded-full bg-indigo-600 mt-1.5 shrink-0' /> {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {skills.length > 0 && (
                                    <div>
                                        <p className='font-black text-slate-400 text-[7px] tracking-widest mb-2 uppercase flex items-center gap-2'><FaCode className="text-indigo-400" /> Stack Radar</p>
                                        <div className='flex flex-wrap gap-1'>
                                            {skills.slice(0, 6).map((s, i) => <span key={i} className='bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-indigo-100/30'>{s}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    <motion.button
                        layout
                        id="start-interview-btn"
                        onClick={handleStart}
                        disabled={!isProfileReady || (!resumeFile && !analysisDone) || isButtonBusy}
                        whileHover={!isButtonBusy ? { scale: 1.01 } : {}}
                        whileTap={!isButtonBusy ? { scale: 0.98 } : {}}
                        className={`w-full py-4.5 rounded-[2rem] text-sm font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-xl relative overflow-hidden group
                            ${!isProfileReady || (!resumeFile && !analysisDone) || isButtonBusy ? 'bg-slate-100 text-slate-300' : 'bg-indigo-600 hover:bg-slate-900 text-white shadow-indigo-600/20'}`}
                    >
                        {isButtonBusy ? (
                            <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="relative z-10">{buttonLabel}</span>
                                <BsArrowRightCircleFill className={`transition-transform duration-300 ${isProfileReady ? 'group-hover:translate-x-1' : ''}`} />
                            </>
                        )}
                        {!isButtonBusy && isProfileReady && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        )}
                    </motion.button>
                </div>
            </motion.div>

            <AnimatePresence>
                {rejectionModal && <RejectionModal reason={rejectionModal.reason} designation={role} onClose={handleRejectionClose} />}
                {loading && <SynthesisModal role={role} />}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `@keyframes shimmer { 100% { transform: translateX(100%); } }` }} />
        </div>
    )
}

export default Step1SetUp
