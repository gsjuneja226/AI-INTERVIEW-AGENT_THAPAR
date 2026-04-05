import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { motion, AnimatePresence } from "motion/react"
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AuthModel from '../components/AuthModel'
import {
  BsFillLightningFill,
  BsBarChartFill,
  BsChatLeftTextFill,
  BsClockHistory,
  BsCheckCircleFill,
  BsArrowRightShort,
  BsPersonFill,
  BsCpuFill,
  BsShieldLockFill,
  BsTerminalFill
} from 'react-icons/bs'

function Home() {
  const { userData } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const aiQuestions = [
    "I noticed you used Redux for state management. Why choose it over Context API for that specific use case?",
    "How does the Virtual DOM reconciliation process work in React 18, and what are the performance implications?",
    "Can you explain the trade-offs between Server-Side Rendering (SSR) and Static Site Generation (SSG)?",
    "How would you handle complex form state and validation in a large-scale React application?",
    "What is the difference between useMemo and useCallback, and when should each be applied?"
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuestionIndex((prev) => (prev + 1) % aiQuestions.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (

    <div className='min-h-screen bg-slate-50 flex flex-col font-sans relative text-slate-900 overflow-hidden'>
      {/* Minimal Background Decoration */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-50 rounded-full blur-[120px] translate-y-1/2"></div>
      </div>

      <Navbar />

      <div className='flex-1 px-6 pt-32 pb-20 relative z-10'>
        <div className='max-w-7xl mx-auto'>

          {/* Hero Section */}
          <div className='flex flex-col lg:flex-row items-center justify-between mb-32 gap-16'>
            <div className='lg:w-1/2 text-left z-10'>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='inline-flex items-center gap-2 border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-8 shadow-sm'>
                <BsCpuFill className="text-blue-600" />
                <span className="tracking-wider uppercase">with rag activated</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className='text-5xl md:text-7xl font-black font-family-pilegiate tracking-tight text-slate-900 leading-[1.05] mb-8'>
                Master Your Next <span className="text-blue-600">Technical Interview.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className='text-slate-600 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-xl'>
                Practice with hyper-realistic AI mock interviews tailored to your resume and projects. Get deep-dive feedback on your technical expertise and communication style.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className='flex flex-col sm:flex-row items-start gap-4'>
                <button
                  onClick={() => {
                    if (!userData) {
                      setShowAuth(true)
                      return;
                    }
                    navigate("/interview")
                  }}
                  className='bg-blue-600 text-white font-bold px-10 py-4 rounded-xl transition-all hover:bg-blue-700 hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center gap-2'>
                  Start Assessment <BsArrowRightShort size={24} />
                </button>

                <button
                  onClick={() => {
                    if (!userData) {
                      setShowAuth(true)
                      return;
                    }
                    navigate("/history")
                  }}
                  className='bg-white border border-slate-200 text-slate-700 font-bold px-10 py-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm'>
                  View History
                </button>
              </motion.div>
            </div>

            {/* Hero Visual - Clean Assessment Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className='lg:w-1/2 relative w-full max-w-lg'>
              
              <div className="relative border border-slate-200 rounded-3xl bg-white shadow-2xl p-10 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <BsChatLeftTextFill size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">Technical Assessment</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Live Evaluation</p>
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                </div>

                <div className="space-y-8">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 min-h-[140px] flex flex-col justify-center">
                    <p className="text-[10px] text-blue-600 font-black mb-3 uppercase tracking-widest">Context-Aware AI Question:</p>
                    <AnimatePresence mode="wait">
                      <motion.p 
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="text-base text-slate-800 leading-relaxed font-bold">
                        "{aiQuestions[currentQuestionIndex]}"
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  <div className="space-y-6 px-1">
                    <div className="flex items-center justify-between text-[11px] mb-2 font-black uppercase tracking-widest text-slate-400">
                      <span>Response Quality</span>
                      <span className="text-blue-600">Dynamic Score</span>
                    </div>
                    <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                      <motion.div 
                        initial={{ width: "30%" }}
                        animate={{ width: ["30%", "85%", "78%", "92%"] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full bg-blue-600 rounded-full shadow-lg" 
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex gap-3 pt-6 border-t border-slate-100">
                  <div className="w-3 h-3 rounded-full bg-blue-600 shadow-lg shadow-blue-600/30"></div>
                  <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-100"></div>
                </div>
              </div>

            </motion.div>
          </div>

          {/* Features Grid */}
          <div className='mb-32 relative z-10'>
            <div className='text-center mb-20'>
              <h2 className='text-3xl md:text-5xl font-black text-slate-900 mb-6'>Everything you need to <span className="text-blue-600">secure the role.</span></h2>
              <p className='text-slate-600 max-w-xl mx-auto text-lg font-medium'>Professional tools designed for serious candidates during placement seasons.</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {[
                { 
                  icon: <BsFillLightningFill size={24} />, 
                  title: 'Context-Aware Interviews', 
                  desc: 'Our AI analyzes your custom resume to ask deep-dive questions specific to your actual experience.',
                  color: 'text-blue-600',
                  bg: 'bg-blue-50'
                },
                { 
                  icon: <BsBarChartFill size={24} />, 
                  title: 'Performance Insights', 
                  desc: 'Get immediate technical scoring and communication analysis after every session.',
                  color: 'text-blue-600',
                  bg: 'bg-blue-50'
                },
                { 
                  icon: <BsClockHistory size={24} />, 
                  title: 'Comprehensive Roadmap', 
                  desc: 'Track your growth over time with a saved history of all your mock assessment sessions.',
                  color: 'text-blue-600',
                  bg: 'bg-blue-50'
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-slate-200 p-10 rounded-3xl hover:border-blue-600/30 transition-all shadow-sm hover:shadow-md group">
                  <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                  <h3 className='font-bold text-xl text-slate-900 mb-4'>{feature.title}</h3>
                  <p className='text-slate-600 leading-relaxed font-medium'>{feature.desc}</p>
                </motion.div>
              ))}
           </div>
          </div>

          {/* How It Works Section */}
          <div className='mb-32 relative z-10'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-5xl font-black text-slate-900 mb-4'>The <span className="text-blue-600">Perfect Prep</span> Protocol.</h2>
              <p className='text-slate-600 font-medium'>From file upload to job-ready in minutes.</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-12 relative'>
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-100 -z-10"></div>
              
              {[
                { step: '01', title: 'Upload & Profile', desc: 'Securely upload your resume and specify the role you are targeting.' },
                { step: '02', title: 'RAG Brain Indexing', desc: 'Our system analyzes your projects and codebase to build a custom context.' },
                { step: '03', title: 'Master the Session', desc: 'Engage in a live technical interview with real-time feedback and scoring.' }
              ].map((item, i) => (
                <div key={i} className='flex flex-col items-center text-center'>
                  <div className='w-16 h-16 bg-white border-2 border-blue-600 text-blue-600 rounded-full flex items-center justify-center font-black text-xl mb-6 shadow-xl shadow-blue-600/10'>
                    {item.step}
                  </div>
                  <h4 className='font-bold text-lg text-slate-900 mb-2'>{item.title}</h4>
                  <p className='text-slate-500 text-sm max-w-[220px] font-medium'>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className='mb-32 relative z-10'>
            <div className='max-w-3xl mx-auto'>
              <div className='text-center mb-16'>
                <h2 className='text-3xl md:text-4xl font-black text-slate-900'>Common <span className="text-blue-600">Questions.</span></h2>
              </div>
              
              <div className='space-y-6'>
                {[
                  { q: 'How does RAG make interviews better?', a: 'RAG (Retrieval-Augmented Generation) allows our AI to actually "read" your projects. Instead of generic questions, it asks about the specific architectural choices you made in your own code.' },
                  { q: 'Are the scores comparable to real interview standards?', a: 'Yes. Our scoring system is calibrated based on standard industry rubrics for communication, confidence, and technical accuracy.' },
                  { q: 'Is my resume and code data private?', a: 'Absolutely. We use ephemeral processing and encrypted storage. Your data is used exclusively to calibrate your private interview session.' }
                ].map((faq, i) => (
                  <div key={i} className='bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm'>
                    <h4 className='font-black text-slate-900 mb-3 flex items-center gap-3'>
                      <span className='w-1.5 h-1.5 bg-blue-600 rounded-full'></span>
                      {faq.q}
                    </h4>
                    <p className='text-slate-500 text-sm font-medium leading-relaxed pl-4.5'>
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className='relative overflow-hidden rounded-[2.5rem] bg-blue-600 px-8 py-16 md:p-20 text-center z-10'>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-700 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-30"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className='text-3xl md:text-5xl font-black text-white mb-8 leading-tight'>Ready to level up your interview preparation?</h2>
              <button 
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true)
                    return;
                  }
                  navigate("/interview")
                }}
                className="bg-white text-blue-600 font-black px-12 py-5 rounded-2xl text-lg hover:scale-105 active:scale-95 transition-all shadow-xl">
                Get Started for Free
              </button>
              <p className="text-blue-100 mt-8 font-bold text-sm uppercase tracking-widest opacity-80">No credit card required to start.</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
      </AnimatePresence>
      <Footer />
    </div>
  )
}

export default Home
