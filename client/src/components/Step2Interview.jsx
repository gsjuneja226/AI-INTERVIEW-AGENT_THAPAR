import React, { useState, useRef, useEffect } from 'react';
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import UserVideo from './UserVideo';
import AIAvatar from './AIAvatar';
import { motion, AnimatePresence } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash, FaForward, FaPhoneSlash } from "react-icons/fa";
import { BsArrowRight, BsStars, BsShieldFillCheck, BsPersonFill, BsClockFill } from 'react-icons/bs';
import axios from "axios";
import { ServerUrl } from '../App';

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, candidateName } = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const currentQuestion = questions[currentIndex];

  // ── Voice & Speech Engine ───────────────────────────────────
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const female = voices.find(v => v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("female"));
      const male = voices.find(v => v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("male"));
      
      if (female) { setSelectedVoice(female); setVoiceGender("female"); }
      else if (male) { setSelectedVoice(male); setVoiceGender("male"); }
      else { setSelectedVoice(voices[0]); setVoiceGender("female"); }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = 1.0;

      utterance.onstart = () => { setIsAIPlaying(true); stopMic(); };
      utterance.onend = () => {
        setIsAIPlaying(false);
        if (isMicOn) startMic();
        setTimeout(() => { setSubtitle(""); resolve(); }, 300);
      };
      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) return;
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(`Welcome, ${candidateName || 'Candidate'}. I am your AI coordinator.`);
        await speakText("We will begin the session now. Please speak clearly.");
        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await speakText(currentQuestion.question);
      }
    };
    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  // ── Timers ───────────────────────────────────────────────────
  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) setTimeLeft(currentQuestion.timeLimit || 60);
  }, [currentIndex]);

  // ── Mic & Transcribe ─────────────────────────────────────────
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setAnswer(prev => prev + " " + transcript);
    };
    recognitionRef.current = recognition;
  }, []);

  const startMic = () => { if (recognitionRef.current && !isAIPlaying) try { recognitionRef.current.start(); } catch { } };
  const stopMic = () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  const toggleMic = () => { if (isMicOn) stopMic(); else startMic(); setIsMicOn(!isMicOn); };

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);
    try {
      await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken: currentQuestion.timeLimit - timeLeft,
      }, { withCredentials: true });
      setFeedback("submitted");
      setIsSubmitting(false);
    } catch (error) { console.log(error); setIsSubmitting(false); }
  };

  const handleNext = async () => {
    if (currentIndex + 1 >= questions.length) { finishInterview(); return; }
    setAnswer("");
    setFeedback("");
    setCurrentIndex(currentIndex + 1);
  };

  const [isFinishing, setIsFinishing] = useState(false);
  const finishInterview = async () => {
    stopMic(); setIsMicOn(false); setIsFinishing(true);
    try {
      const result = await axios.post(ServerUrl + "/api/interview/finish", { interviewId }, { withCredentials: true });
      onFinish(result.data);
    } catch (error) { console.log(error); setIsFinishing(false); }
  };

  useEffect(() => {
    if (!isIntroPhase && timeLeft === 0 && !isSubmitting && !feedback) submitAnswer();
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current.abort(); }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className='h-screen w-full bg-slate-900 relative flex flex-col overflow-hidden font-sans text-white'>
      
      {/* ── Background: AI Video Layer ──────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <AIAvatar videoSource={videoSource} isPlaying={isAIPlaying} subtitle={""} />
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
      </div>

      {/* ── Top Bar: Connection & Session Info ───────────────────── */}
      <div className="absolute top-0 inset-x-0 h-24 px-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-20 pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Audio-Visual Stream: Live</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
             <BsPersonFill className="text-white/40" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">{candidateName || 'Candidate'}</span>
          </div>
        </div>

        <div className="flex items-center gap-10 pointer-events-auto">
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Session Timer</span>
              <p className={`text-2xl font-mono font-black ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                00:{timeLeft.toString().padStart(2, '0')}
              </p>
           </div>
           <div className="flex gap-1.5">
             {questions.map((_, i) => (
               <div key={i} className={`w-1.5 h-6 rounded-full transition-all duration-700 ${i <= currentIndex ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]' : 'bg-white/10'}`} />
             ))}
           </div>
        </div>
      </div>

      {/* ── Candidate View: Picture-in-Picture ────────────────────── */}
      <div className="absolute top-32 right-10 w-72 h-44 z-30 group">
         <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl transition-transform hover:scale-[1.03] duration-500">
            <UserVideo />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
               <div className="w-1 h-1 rounded-full bg-emerald-400" />
               <span className="text-[8px] font-black uppercase tracking-widest text-white/90">Local Feed</span>
            </div>
         </div>
      </div>

      {/* ── Subtitles Overlay: Cinematic Style ─────────────────────── */}
      <div className="absolute bottom-40 inset-x-0 z-30 flex flex-col items-center justify-center px-10 text-center pointer-events-none">
        <AnimatePresence mode="wait">
          {subtitle && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               exit={{ opacity: 0, y: -10 }}
               className="bg-black/40 backdrop-blur-md border border-white/10 px-10 py-6 rounded-3xl max-w-4xl shadow-2xl"
            >
               <p className="text-3xl font-black leading-tight tracking-tight text-white italic drop-shadow-lg">
                 "{subtitle}"
               </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Floating Control Bar: Cinematic Call Bar ───────────────── */}
      <div className="absolute bottom-10 inset-x-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-6 bg-black/40 backdrop-blur-2xl px-10 py-6 rounded-[3rem] border border-white/10 shadow-2xl pointer-events-auto">
          
          <button onClick={toggleMic} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-rose-500 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)]'}`}>
            {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
          </button>

          <div className="h-10 w-px bg-white/10" />

          {!feedback ? (
            <button 
              onClick={submitAnswer} 
              disabled={isSubmitting || !answer.trim()}
              className="px-12 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black uppercase tracking-[0.4em] text-[11px] transition-all flex items-center gap-4 disabled:opacity-30 disabled:grayscale shadow-xl shadow-blue-600/20"
            >
              {isSubmitting ? 'Transmitting...' : 'Send Response'}
              <BsArrowRight size={20} />
            </button>
          ) : (
            <button 
              onClick={handleNext} 
              className="px-12 h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-black uppercase tracking-[0.4em] text-[11px] transition-all flex items-center gap-4 shadow-xl shadow-emerald-500/20"
            >
              {currentIndex + 1 >= questions.length ? 'Finalize Call' : 'Next Question'}
              <FaForward size={18} />
            </button>
          )}

          <div className="h-10 w-px bg-white/10" />

          <button 
             onClick={finishInterview}
             className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all shadow-xl shadow-rose-600/20"
          >
            <FaPhoneSlash size={22} />
          </button>
        </div>
      </div>

      {/* Synthesis Finishing Overlay */}
      <AnimatePresence>
        {isFinishing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[500] bg-black backdrop-blur-3xl flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 border-t-2 border-blue-600 rounded-full animate-spin mb-10" />
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">Call Ending</h2>
            <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.5em]">Synthesizing technical metadata... stand by.</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Global Grain Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

    </div>
  );
}

export default Step2Interview;
