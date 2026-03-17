import React, { useState } from 'react';
import { ArrowLeft, Send, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useUI } from '../context/UIContext';

interface ManualPaymentScreenProps {
    onBack: () => void;
}

export const ManualPaymentScreen: React.FC<ManualPaymentScreenProps> = ({ onBack }) => {
    const { profile, submitManualPayment, appSettings } = useProfile();
    const { showAlert, isDarkMode } = useUI();
    const [transactionId, setTransactionId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Wave IDs: 9-20 chars, Alphanumeric + _ + -, starts with T_ or PT- (case insensitive prefix)
    const validateId = (id: string) => {
        const val = id.trim().toUpperCase();
        if (val.length < 9 || val.length > 20) return false;
        if (!val.startsWith('T_') && !val.startsWith('PT-')) return false;
        // Alphanumeric, underscores, and hyphens only
        const alphanumericRegex = /^[A-Z0-9_-]+$/;
        return alphanumericRegex.test(val);
    };

    const isValidId = validateId(transactionId);

    const handleSubmit = async () => {
        if (!isValidId) {
            showAlert("Invalid ID", "The Wave Transaction ID must start with 'T_'. Please check your receipt.");
            return;
        }

        setIsSubmitting(true);
        const { success, error } = await submitManualPayment('WAVE_MANUAL', transactionId.trim().toUpperCase());
        setIsSubmitting(false);

        if (success) {
            onBack(); // Return to wallet immediately so they see the yellow bar
            showAlert(
                "Payment Received", 
                "Your payment is being processed. It usually takes 5-10 minutes. You can check your status in the wallet."
            );
        } else {
            showAlert("Error", error || "Something went wrong. Please try again or contact support.");
        }
    };

    return (
        <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-zinc-950' : 'bg-slate-50'} animate-in slide-in-from-right duration-300`}>
            {/* Header */}
            <div className={`px-6 pb-6 flex items-center gap-4 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} border-b shadow-sm`} style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}>
                <button onClick={onBack} className={`p-2 rounded-xl ${isDarkMode ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Manual Wave Payment</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8">
                {/* Instructions */}
                <div className={`p-6 rounded-[28px] mb-8 ${isDarkMode ? 'bg-blue-900/10 border-blue-900/20' : 'bg-blue-50 border-blue-100'} border`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <Info size={16} />
                        </div>
                        <h2 className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest text-xs">How to Pay</h2>
                    </div>
                    <ol className="space-y-4">
                        <li className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                                Open your <span className="font-black text-slate-900 dark:text-white">Wave App</span>
                            </p>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                                Send <span className="font-black text-[#00E39A]">D{profile.commissionDebt.toFixed(2)}</span> to our business number: <span className="font-black underline">388 8888</span>
                            </p>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                                Copy the <span className="font-black text-blue-500">Transaction ID</span> (9-20 chars, starts with <span className="font-black text-blue-500">T_</span> or <span className="font-black text-blue-500">PT-</span>) and paste it below.
                            </p>
                        </li>
                    </ol>
                </div>

                {/* Input Field */}
                <div className="space-y-2 mb-8">
                    <label className={`text-[11px] font-black uppercase tracking-[0.1em] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'} ml-1`}>
                        Transaction ID (starts with T_ or PT-)
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            autoFocus
                            autoCapitalize="characters"
                            autoCorrect="off"
                            spellCheck="false"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="T_XXXX..."
                            className={`
                                w-full px-6 py-5 rounded-2xl text-[17px] font-black tracking-tight outline-none transition-all
                                ${isDarkMode 
                                    ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#00E39A]/50' 
                                    : 'bg-white border-slate-200 text-slate-900 focus:border-[#00E39A] shadow-sm'}
                                border-2
                            `}
                        />
                        {isValidId && (
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#00E39A]">
                                <CheckCircle2 size={24} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Receipt Help Card */}
                <div className={`p-4 rounded-3xl border border-dashed ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-300 bg-white'}`}>
                    <p className={`text-[10px] font-black text-center mb-4 uppercase tracking-widest ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                        Copy the Transaction ID at the bottom
                    </p>
                    <div className="aspect-[4/3] rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                        <img 
                            src="/assets/wave_receipt.png" 
                            alt="Wave Receipt Sample" 
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className={`px-6 pb-8 ${isDarkMode ? 'bg-zinc-900/80 border-t border-zinc-800' : 'bg-white/80 border-t border-slate-100'} backdrop-blur-lg`} style={{ paddingTop: '20px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
                <button
                    disabled={!isValidId || isSubmitting}
                    onClick={handleSubmit}
                    className={`
                        w-full py-5 rounded-2xl text-[15px] font-black flex items-center justify-center gap-3 transition-all uppercase tracking-[0.1em]
                        ${isValidId && !isSubmitting
                            ? 'bg-[#00E39A] text-slate-900 shadow-xl active:scale-[0.98]' 
                            : 'bg-slate-200 text-slate-400 dark:bg-zinc-800 dark:text-zinc-600'}
                    `}
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></div>
                    ) : (
                        <>
                            Submit Payment <Send size={18} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
