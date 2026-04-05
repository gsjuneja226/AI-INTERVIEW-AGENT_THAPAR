import React, { useEffect, useRef, useState } from 'react';

const UserVideo = () => {
    const videoRef = useRef(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let stream = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 640 }, 
                        height: { ideal: 480 },
                        facingMode: "user"
                    }, 
                    audio: false 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
                setHasError(true);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center group bg-[radial-gradient(circle,rgba(226,232,240,0.5)_0%,transparent_100%)]">
            {hasError ? (
                <div className="text-center p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-tighter">Connection Restricted</p>
                    <p className="text-[7px] font-bold text-slate-300 uppercase italic">Check browser permissions</p>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror grayscale-[0.05] hover:grayscale-0 transition-all duration-700"
                />
            )}
            
            {/* Identity HUD (White Theme) */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-10 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200/50">
                <div className={`w-1.5 h-1.5 rounded-full ${hasError ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="text-[7px] font-black tracking-[0.3em] uppercase text-slate-500">Local Signal</span>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `.mirror { transform: rotateY(180deg); }` }} />
        </div>
    );
};

export default UserVideo;
