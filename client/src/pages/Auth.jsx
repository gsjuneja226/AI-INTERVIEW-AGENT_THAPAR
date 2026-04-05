import React, { useState } from 'react'
import { BsStars, BsLightningFill } from "react-icons/bs";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import logo from "../assets/RAGCRUIT.png"
import AuthModel from '../components/AuthModel';

function Auth({ isModel = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const response = await signInWithPopup(auth, provider)
      let User = response.user
      let name = User.displayName
      let email = User.email
      const result = await axios.post(ServerUrl + "/api/auth/google", { name, email }, { withCredentials: true })
      dispatch(setUserData(result.data))
      setLoading(false);
      if (!isModel) {
        navigate("/");
      }
    } catch (error) {
      console.error("Authentication Error:", error)
      alert("Signin failed: " + (error.response?.data?.message || error.message || "Network Error"));
      dispatch(setUserData(null))
      setLoading(false);
    }
  }

  const modalStyles = isModel
    ? "p-10 rounded-3xl bg-white border border-slate-200 shadow-2xl relative overflow-hidden"
    : "max-w-md w-full p-12 rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl relative overflow-hidden mx-auto";

  const containerStyles = isModel
    ? "w-full"
    : "min-h-screen bg-slate-50 flex items-center justify-center px-6 py-20 font-sans text-slate-900 relative";

  return (
    <div className={containerStyles}>

      {!isModel && (
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2"></div>
        </div>
      )}

      <motion.div
        initial={!isModel ? { opacity: 0, y: 20 } : false}
        animate={!isModel ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 0.6 }}
        className={`${modalStyles} z-10`}>

        <div className='flex flex-col items-center justify-center gap-2 mb-12 relative z-10'>
          <h2 className='font-black text-2xl tracking-tight text-slate-900'>RAG<span className="text-blue-600">CRUIT</span></h2>
          <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
        </div>

        <h1 className='text-3xl font-black text-center text-slate-900 mb-4 relative z-10'>
          Welcome Back
        </h1>

        <div className='flex justify-center mb-8 relative z-10'>
          <span className='bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest'>
            <BsLightningFill className="text-blue-600" />
            AI Interview Prep
          </span>
        </div>

        <p className='text-slate-500 text-center text-sm font-medium leading-relaxed mb-10 relative z-10 px-2'>
          Sign in to access your professional interview dashboard, track assessment history, and practice with context-aware AI.
        </p>

        <motion.button
          onClick={handleGoogleAuth}
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className='relative z-10 w-full flex items-center justify-center gap-3 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-lg transition-all font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed'>
          <FcGoogle size={20} />
          {loading ? "Signing in..." : "Continue With Google"}
        </motion.button>
        
        <p className="text-center text-[10px] text-slate-400 mt-8 font-medium">By continuing, you agree to our Terms of Service.</p>

      </motion.div>

    </div>
  )
}

export default Auth
