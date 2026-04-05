import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from "motion/react"
import { BsStars, BsLightningFill } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';
import logo from "../assets/RAGCRUIT.png"

function Navbar() {
    const { userData } = useSelector((state) => state.user)
    const [showCreditPopup, setShowCreditPopup] = useState(false)
    const [showUserPopup, setShowUserPopup] = useState(false)
    const [showAuth, setShowAuth] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        try {
            await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true })
            dispatch(setUserData(null))
            setShowUserPopup(false)
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled || location.pathname !== '/' ? 'py-3' : 'py-5'} flex justify-center px-6 pointer-events-none`}>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`w-full max-w-7xl rounded-2xl border transition-all duration-300 pointer-events-auto
                    ${scrolled || location.pathname !== '/'
                        ? 'bg-white/80 backdrop-blur-md border-slate-200 shadow-sm'
                        : 'bg-transparent border-transparent'
                    }
                    px-6 py-2.5 flex justify-between items-center relative`}>

                <div className='flex items-center gap-2 cursor-pointer group' onClick={() => navigate("/")}>
                   <h1 className="flex items-center gap-2 font-black tracking-tight text-2xl transition-colors text-slate-900">
  <img 
    src={logo} 
    alt="RAGCRUIT Logo" 
    className="h-10 w-auto object-contain" 
  />
  RAG<span className="text-blue-600">CRUIT</span>
</h1>
                </div>

                <div className='flex items-center gap-3 relative'>

                    <button onClick={() => {
                        if (!userData) {
                            setShowAuth(true)
                            return;
                        }
                        setShowCreditPopup(!showCreditPopup);
                        setShowUserPopup(false)
                    }} className='flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 shadow-sm hover:shadow-md'>
                        <BsLightningFill className='text-yellow-400 animate-pulse' size={14} />
                        Balance: {userData?.credits || 0}
                    </button>

                    <AnimatePresence>
                        {showCreditPopup && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                className='absolute right-12 top-14 w-60 bg-white shadow-xl border border-slate-200 rounded-xl p-4 z-50'>
                                <p className='text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1'>Interview Credits</p>
                                <p className='text-xs text-slate-500 mb-4'>Purchase additional credits for professional mock assessment sessions.</p>
                                <button onClick={() => {
                                    setShowCreditPopup(false);
                                    navigate("/pricing");
                                }} className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold transition-all'>Buy Credits</button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className='relative'>
                        <button
                            onClick={() => {
                                if (!userData) {
                                    setShowAuth(true)
                                    return;
                                }
                                setShowUserPopup(!showUserPopup);
                                setShowCreditPopup(false)
                            }} className='w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-sm hover:bg-slate-800 transition-all font-bold'>
                            {userData ? userData?.name.slice(0, 1).toUpperCase() : <FaUserCircle size={18} />}
                        </button>

                        <AnimatePresence>
                            {showUserPopup && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    className='absolute right-0 top-14 w-52 bg-white shadow-xl border border-slate-200 rounded-xl p-1.5 z-50'>
                                    <div className='px-3 py-2 mb-1 border-b border-slate-100'>
                                        <p className='text-[9px] text-slate-400 font-bold uppercase tracking-widest'>Candidate Profile</p>
                                        <p className='text-xs text-slate-900 font-semibold truncate mt-0.5'>{userData?.name}</p>
                                    </div>
                                    <button onClick={() => {
                                        setShowUserPopup(false);
                                        navigate("/history");
                                    }} className='w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all'>Interview History</button>
                                    <button onClick={handleLogout}
                                        className='w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-red-50 flex items-center gap-2 text-red-600 hover:text-red-700 transition-all font-medium mt-1'>
                                        <HiOutlineLogout size={14} /> Logout</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

            </motion.div>

            {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
        </div>
    )
}

export default Navbar
