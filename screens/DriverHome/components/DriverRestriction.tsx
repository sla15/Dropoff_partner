
import React from 'react';
import { XCircle } from 'lucide-react';

interface DriverRestrictionProps {
    isLocked: boolean;
    isSuspended: boolean;
    commissionDebt: number;
    setCurrentTab: (tab: string) => void;
}

export const DriverRestriction: React.FC<DriverRestrictionProps> = ({
    isLocked,
    isSuspended,
    commissionDebt,
    setCurrentTab
}) => {
    if (!isLocked) return null;

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-red-950 text-center text-white">
            <div className="bg-red-500/20 p-8 rounded-full mb-8 animate-pulse">
                <XCircle className="w-20 h-20 text-red-500" />
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tight">Account Restricted</h2>
            <p className="text-red-200/70 mb-10 leading-relaxed max-w-xs mx-auto">
                {isSuspended
                    ? "Your account has been manually suspended by an administrator. Please contact support."
                    : `Your commission debt of D${commissionDebt.toFixed(2)} exceeds the allowable limit. Clear your dues to continue.`
                }
            </p>
            <button
                onClick={() => setCurrentTab('wallet')}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-[0_10px_30px_rgba(220,38,38,0.4)] uppercase tracking-widest"
            >
                {isSuspended ? "Check Wallet Status" : "Reduce Commission Due"}
            </button>
        </div>
    );
};
