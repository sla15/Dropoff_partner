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
        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-black dark:to-zinc-900 transition-colors">
            {/* Animated Logo */}
            <div className="relative mb-8 animate-bounce">
                <div className="w-24 h-24 bg-[#00E39A] rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                    <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div className="absolute -inset-2 bg-[#00E39A] rounded-3xl blur-xl opacity-30 animate-pulse"></div>
            </div>

            {/* App Name */}
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                Partner
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
                Loading your workspace{dots}
            </p>

            {/* Loading Indicator */}
            <div className="mt-8">
                <Loader2 className="w-6 h-6 text-[#00E39A] animate-spin" />
            </div>
        </div>
    );
};
