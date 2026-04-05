import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const AIAvatar = ({ videoSource, isPlaying, subtitle }) => {
    const videoRef = useRef(null);
    const [mouthPulse, setMouthPulse] = useState(1);

    useEffect(() => {
        if (isPlaying && videoRef.current) {
            videoRef.current.play();
            const interval = setInterval(() => {
                setMouthPulse(1 + Math.random() * 0.08); // Micro-pulses
            }, 100);
            return () => clearInterval(interval);
        } else if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setMouthPulse(1);
        }
    }, [isPlaying]);

    return (
        <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-200 shadow-sm group">
            {/* AI Video Feed */}
            <video
                ref={videoRef}
                src={videoSource}
                muted
                playsInline
                loop
                className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-[1.02]' : 'grayscale-[0.1]'}`}
            />

            {/* Subtitles Overlay (Professional Theme) */}
            <AnimatePresence>
                {subtitle && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-6 left-6 right-6 z-30"
                    >
                        <div className="bg-white/90 backdrop-blur-md border border-blue-100 p-6 rounded-2xl shadow-lg">
                             <p className="text-lg md:text-xl font-bold tracking-tight leading-snug text-blue-900 text-center italic">
                                "{subtitle}"
                             </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Identification HUD */}
            <div className="absolute top-6 left-6 flex items-center gap-2.5 z-20">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-slate-300'}`} />
                <span className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-500 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200/50">
                    {isPlaying ? 'Audio Stream: Transmitting' : 'Signal Status: Standby'}
                </span>
            </div>

            {/* Procedural Lip-Sync Bloom (White Theme) */}
            <AnimatePresence>
                {isPlaying && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                    >
                        <motion.div
                            style={{ 
                                scale: mouthPulse,
                                background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 60%)'
                            }}
                            className="absolute bottom-[35%] left-1/2 -translate-x-1/2 w-48 h-32 rounded-full blur-3xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIAvatar;
