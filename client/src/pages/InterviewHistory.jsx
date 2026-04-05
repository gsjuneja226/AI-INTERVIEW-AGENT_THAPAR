import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { ServerUrl } from '../App'
import { motion } from "motion/react"
import { BsArrowLeft, BsFileEarmarkBarGraphFill, BsClockHistory, BsCheckCircleFill, BsExclamationTriangleFill } from 'react-icons/bs'


const FloatingOrb = ({ color, size, top, left, delay, duration }) => (
    <motion.div
      className={`absolute rounded-full filter blur-[150px] opacity-10 pointer-events-none ${color} ${size}`}
      style={{ top, left }}
      animate={{ x: [0, 60, -60, 0], y: [0, -60, 60, 0] }}
      transition={{ duration: duration || 30, repeat: Infinity, ease: "easeInOut", delay: delay || 0 }}
    />
);

function InterviewHistory() {
    const [interviews, setInterviews] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const getMyInterviews = async () => {
            try {
                const result = await axios.get(ServerUrl + "/api/interview/get-interview", { withCredentials: true })
                setInterviews(result.data)
            } catch (error) {
                console.log(error)
            }
        }
        getMyInterviews()
    }, [])

    return (
        <div className='h-screen w-full bg-slate-50 relative overflow-hidden font-sans text-slate-900 flex flex-col'>
            
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className='w-full max-w-7xl mx-auto px-6 py-8 relative z-10 flex flex-col h-full'>

                <div className='mb-10 flex items-center justify-between shrink-0'>
                    <div className='flex items-center gap-6'>
                        <button
                            onClick={() => navigate("/")}
                            className='w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600/30 transition-all flex items-center justify-center shadow-sm'>
                            <BsArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className='text-3xl font-black text-slate-900 tracking-tight'>
                                Interview History
                            </h1>
                            <p className='text-[10px] font-black text-blue-600/60 uppercase tracking-[0.2em] mt-1'>
                                Analytical Performance Archive
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide pb-10">
                    {interviews.length === 0 ?
                        <div className='w-full max-w-2xl mx-auto bg-white border border-slate-200 p-20 rounded-[3rem] shadow-xl text-center relative overflow-hidden mt-10'>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-[50px] rounded-full"></div>
                            <BsClockHistory className='mx-auto text-slate-200 mb-8' size={64}/>
                            <p className='text-slate-500 text-lg font-bold'>
                                No sessions found. Start your first interview to see your progress here.
                            </p>
                            <button 
                                onClick={() => navigate("/")}
                                className='mt-8 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black tracking-widest text-[10px] uppercase shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all'>
                                Start Interview
                            </button>
                        </div>
                        :
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {interviews.map((item, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => navigate(`/report/${item._id}`)}
                                    className='bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-blue-600/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col h-full'>
                                    
                                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                                    <div className='flex items-center justify-between mb-8 shrink-0'>
                                        <div className='w-11 h-11 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all'>
                                            <BsFileEarmarkBarGraphFill size={18} />
                                        </div>
                                        <div className='text-right'>
                                          <span className='text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors'>{item.finalScore != null ? item.finalScore : 0}</span>
                                          <span className='text-[10px] text-slate-300 ml-1 font-black uppercase'>/ 10</span>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-lg font-black text-slate-900 mb-1 leading-tight tracking-tight">
                                            {item.candidateName || "Candidate"}
                                        </h3>
                                        <div className="text-[9px] text-blue-600 font-black mb-4 uppercase tracking-wider">
                                            {item.role}
                                        </div>
                                        
                                        <div className='flex items-center gap-2 mb-8'>
                                            <span className='bg-slate-50 border border-slate-100 text-slate-400 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest'>{item.experience}</span>
                                            <span className='text-slate-300 text-[8px] font-bold uppercase tracking-widest'>{item.mode} Phase</span>
                                        </div>
                                    </div>

                                    <div className='border-t border-slate-50 pt-6 flex items-center justify-between mt-auto'>
                                       <div className='text-[8px] uppercase font-black text-slate-300 tracking-widest flex items-center gap-1.5'>
                                          <BsClockHistory size={10}/>
                                          {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                       </div>
                                       
                                       <div className={`flex items-center gap-1.5 text-[8px] font-black uppercase py-1.5 px-3 rounded-lg border ${item.status === 'completed' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                          {item.status === 'completed' ? <BsCheckCircleFill size={8}/> : <BsClockHistory size={8}/>}
                                          <span>{item.status}</span>
                                       </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default InterviewHistory
