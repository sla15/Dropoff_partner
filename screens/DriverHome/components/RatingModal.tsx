
import React from 'react';
import { Star, X } from 'lucide-react';

interface RatingModalProps {
    currentRide: any;
    showRatingModal: boolean;
    hasCollectedPayment: boolean;
    userRating: number;
    appSettings: any;
    setHasCollectedPayment: (val: boolean) => void;
    setUserRating: (val: number) => void;
    submitRating: () => void;
    handleSkipRating: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
    currentRide,
    showRatingModal,
    hasCollectedPayment,
    userRating,
    appSettings,
    setHasCollectedPayment,
    setUserRating,
    submitRating,
    handleSkipRating
}) => {
    if (!showRatingModal) return null;

    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-sm rounded-[2rem] p-6 text-center shadow-2xl relative">
                <button onClick={handleSkipRating} className="absolute top-4 right-4 p-2 text-gray-400"><X size={24} /></button>
                <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                    <img
                        src={currentRide?.passengerImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentRide?.passengerName}`}
                        alt="User"
                        className="w-full h-full object-cover"
                    />
                </div>

                {!hasCollectedPayment ? (
                    <>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Final Settlement</h3>
                        <p className="text-gray-400 text-sm mb-6">Confirm payment from {currentRide?.passengerName}</p>
                        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl py-6 px-4 my-6 border border-gray-100 dark:border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total to Collect</p>
                            <p className="text-4xl font-black text-[#00E39A]">{appSettings.currency_symbol}{currentRide?.price?.toFixed(2)}</p>
                        </div>
                        <button
                            onClick={() => setHasCollectedPayment(true)}
                            className="w-full py-4 rounded-2xl font-bold bg-[#00E39A] text-black shadow-lg uppercase tracking-widest active:scale-95 transition-transform"
                        >
                            Confirm Payment Received
                        </button>
                    </>
                ) : (
                    <>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Rate {currentRide?.passengerName}</h3>
                        <p className="text-gray-400 text-sm mb-6">How was your interaction?</p>
                        <div className="flex justify-center gap-2 mb-8 mt-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setUserRating(star)}>
                                    <Star size={32} className={`${star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={submitRating}
                            className="w-full py-4 rounded-2xl font-bold bg-[#00E39A] text-black shadow-lg active:scale-95 transition-transform mb-3"
                        >
                            Submit Rating
                        </button>
                        <button
                            onClick={handleSkipRating}
                            className="w-full py-3 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Skip for Now
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
