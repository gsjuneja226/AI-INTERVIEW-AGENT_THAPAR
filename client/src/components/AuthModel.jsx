import React from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes } from "react-icons/fa";
import Auth from '../pages/auth';
import { motion, AnimatePresence } from 'motion/react';

function AuthModel({onClose}) {
    const {userData} = useSelector((state)=>state.user)

    useEffect(()=>{
        if(userData){
            onClose()
        }
        
    },[userData , onClose])

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 pointer-events-auto'>
        <motion.div 
           initial={{ opacity: 0, scale: 0.98, y: 10 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.98, y: 10 }}
           className='relative w-full max-w-md'>
            
            <button onClick={onClose} className='absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-all z-50 p-2.5 bg-white shadow-sm border border-slate-100 rounded-xl'>
             <FaTimes size={14}/>
            </button>
            <Auth isModel={true}/>

        </motion.div>
    </div>
  )
}

export default AuthModel
