import React from 'react'
import { BsStars } from 'react-icons/bs'
import logo from "../assets/RAGCRUIT.png"
function Footer() {
  return (
    <div className='bg-transparent flex justify-center px-6 pb-12 pt-8 relative z-10'>
      <div className='w-full max-w-6xl rounded-[2rem] py-10 px-6 text-center border-t border-slate-200'>
        <div className='flex justify-center items-center mb-4'>
          <div className='flex items-center gap-3'>
              <img src={logo} alt="RAGCRUIT Logo" className="h-10 w-auto object-contain" />
              <h2 className='text-3xl font-black text-slate-900 tracking-tighter'>
                RAG<span className='text-blue-600'>CRUIT</span></h2>
           </div>
        </div>
        <p className='text-slate-400 text-xs font-bold leading-relaxed max-w-lg mx-auto uppercase tracking-widest'>
          Elevating interview preparation through intelligent AI simulation. Designed for technical excellence and career readiness.
        </p>
        <div className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
          © 2026 RAGCRUIT
        </div>
      </div>
    </div>
  )
}

export default Footer
