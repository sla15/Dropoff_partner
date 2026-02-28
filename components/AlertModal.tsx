import React from 'react';
import { X } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    isDarkMode: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    title,
    message,
    onClose,
    onConfirm,
    onCancel,
    confirmText = 'OK',
    cancelText,
    isDarkMode
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className={`
                relative w-full max-w-xs overflow-hidden rounded-[24px] shadow-2xl 
                animate-in zoom-in-95 duration-200
                ${isDarkMode ? 'bg-zinc-900 border border-white/10' : 'bg-white border border-slate-200'}
            `}>
                <div className="p-6 text-center">
                    <h3 className={`text-[19px] font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {title}
                    </h3>
                    <p className={`text-[14px] font-medium leading-relaxed px-2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className={`flex border-t ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                    {cancelText && (
                        <button
                            onClick={() => {
                                if (onCancel) onCancel();
                                onClose();
                            }}
                            className={`
                                flex-1 py-4 text-[17px] font-bold transition-colors active:bg-black/5
                                border-r ${isDarkMode ? 'border-white/10 text-zinc-400 active:bg-white/5' : 'border-slate-100 text-slate-400'}
                            `}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            onClose();
                        }}
                        className={`
                            flex-1 py-4 text-[17px] font-black transition-colors active:bg-black/5
                            ${isDarkMode ? 'text-[#00E39A] active:bg-white/5' : 'text-[#00E39A]'}
                        `}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
