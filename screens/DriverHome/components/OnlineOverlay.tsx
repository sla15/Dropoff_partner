
import React from 'react';
import { Power } from 'lucide-react';

interface OnlineOverlayProps {
    isOnline: boolean;
    handleToggleOnline: () => void;
}

export const OnlineOverlay: React.FC<OnlineOverlayProps> = ({ isOnline, handleToggleOnline }) => {
    if (isOnline) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl">
            <div className="w-[85%] max-w-sm bg-[#1C1C1E]/60 backdrop-blur-md rounded-[2.5rem] p-8 text-center shadow-2xl border border-white/5 overflow-hidden">
                <h2 className="text-2xl font-bold text-white mb-2">Ready to drive?</h2>
                <p className="text-gray-400 text-sm mb-10">Go online to receive requests.</p>
                <button
                    onClick={handleToggleOnline}
                    className="w-20 h-20 mx-auto rounded-full bg-[#1C1C1E] border-2 border-[#00E39A] flex items-center justify-center shadow-[0_0_30px_rgba(0,227,154,0.15)] active:scale-95 transition-all"
                >
                    <Power size={32} className="text-[#00E39A]" />
                </button>
                <p className="text-[#00E39A] text-xs font-bold uppercase mt-8 animate-pulse tracking-widest">Tap to Start</p>
            </div>
        </div>
    );
};
