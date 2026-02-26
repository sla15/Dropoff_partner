import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-black transition-colors overflow-hidden">
            {/* Animated Logo - Falls from sky */}
            <div className="relative mb-12 animate-fall-down">
                <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                    <img
                        src="/assets/logo.png"
                        alt="DROPOFF Logo"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>

            {/* App Name - Slides from left */}
            <div className="text-center animate-slide-in-left">
                <h1 className="text-4xl font-black mb-2 tracking-tight flex items-center justify-center">
                    <span className="text-[#535351]">DROP</span><span className="text-[#00E39A] ml-0.5">OFF</span>
                </h1>
                <p className="text-[11px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-[0.4em] mb-6 pl-1">
                    Driver & Business
                </p>
                <p className="text-sm text-slate-400 dark:text-zinc-500 font-medium italic">
                    Initializing workspace{dots}
                </p>
            </div>

            {/* Simple Loading Indicator */}
            <div className="mt-12">
                <Loader2 className="w-6 h-6 text-[#00E39A] animate-spin" />
            </div>
        </div>
    );
};
