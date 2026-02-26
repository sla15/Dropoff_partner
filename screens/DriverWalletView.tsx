import React from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, AlertTriangle, Wallet, Car, CreditCard, Star, Trash2 } from 'lucide-react';

export const DriverWalletView: React.FC = () => {
    const { profile, transactions, payCommission, reviews, appSettings } = useApp();

    return (
        <div className="animate-in fade-in duration-500">
            {/* Total Earnings Card */}
            <div className="mx-6 mt-6 bg-slate-900 dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                <div className="relative z-10 text-center">
                    <p className="text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase mb-2">My Cash</p>
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">D{profile.walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
                </div>

                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#00E39A]/10 to-transparent pointer-events-none"></div>

                <div className="flex mt-8 pt-8 border-t border-white/5">
                    <div className="flex-1 text-center border-r border-white/5">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Today</p>
                        <p className="text-xl font-black text-white">D0.00</p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                        <p className={`text-xl font-black ${profile.isOnline ? 'text-[#00E39A]' : 'text-red-500'}`}>
                            {profile.isOnline ? 'ACTIVE' : 'INACTIVE'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Commission Due Card */}
            <div className="mx-6 mt-6 bg-white dark:bg-zinc-900 rounded-[28px] p-6 border border-slate-100 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <CreditCard size={20} className="text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white text-[15px]">Money to Pay Back</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Limit: D{appSettings?.max_driver_cash_amount?.toFixed(2) || '5,000.00'}</p>
                        </div>
                    </div>
                    <span className="text-red-500 font-black text-2xl">-D{profile.commissionDebt.toFixed(2)}</span>
                </div>

                <div className="mt-6 mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-red-500">How much used</span>
                    <span className="text-slate-400">D{((appSettings?.max_driver_cash_amount || 5000) - profile.commissionDebt).toFixed(2)} left</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-1000"
                        style={{ width: `${(profile.commissionDebt / (appSettings?.max_driver_cash_amount || 5000)) * 100}%` }}
                    ></div>
                </div>

                <div className="mt-6 bg-red-50 dark:bg-red-900/10 rounded-2xl p-4 border border-red-100 dark:border-red-900/20 flex gap-4">
                    <AlertTriangle size={20} className="text-red-500 shrink-0" />
                    <div>
                        <h4 className="text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider mb-1">Take Note</h4>
                        <p className="text-red-500/80 text-[11px] font-medium leading-relaxed">
                            You cannot work if your debt passes D{appSettings?.max_driver_cash_amount || '5,000'}. Pay your fees every day.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        payCommission();
                    }}
                    className="w-full mt-6 bg-[#00E39A] text-slate-900 py-4 rounded-2xl text-[13px] font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg uppercase tracking-widest"
                >
                    <Wallet size={18} /> Pay via Wave
                </button>
            </div>

            <div className="px-8 mt-10 mb-6 flex justify-between items-end">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">What Customers Say</h3>
                <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                    <Star size={12} className="text-yellow-500 fill-current" />
                    <span className="text-yellow-600 dark:text-yellow-400 text-[11px] font-black uppercase tracking-widest">{profile.rating}</span>
                </div>
            </div>

            <div className="px-6 space-y-3 mb-10">
                {reviews.slice(0, 3).map((rev) => (
                    <div key={rev.id} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[15px] font-black text-slate-400">
                                    {rev.reviewerName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white text-sm">{rev.reviewerName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{rev.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} size={10} className={i < rev.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'} />
                                ))}
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed font-medium italic">"{rev.comment}"</p>
                    </div>
                ))}
            </div>

            {/* History */}
            <div className="px-8 mt-10 mb-6 flex justify-between items-end">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">My Recent Trips</h3>
                <button className="text-[#00E39A] text-xs font-black uppercase tracking-widest">View All</button>
            </div>

            <div className="px-6 space-y-3 pb-32">
                {transactions
                    .filter(t => t.type === 'RIDE')
                    .slice(0, 7) // Limit to 7 rides
                    .map((tx) => (
                        <div key={tx.id} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl flex items-center justify-between border border-slate-100 dark:border-zinc-800 shadow-sm relative group">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                    <Car size={22} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white text-[15px]">{tx.description}</p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{tx.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="font-black text-[15px] text-[#00E39A]">D{tx.amount.toFixed(2)}</p>
                                    <p className="text-[9px] font-bold text-red-400 uppercase tracking-tighter mt-0.5">-D{tx.commission.toFixed(2)} Fee</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Delete this ride record?')) {
                                            // We need to expose deleteRide from context
                                            const { deleteRide } = (window as any).domainContext || {}; // Mocking for now, will fix interface
                                            // Better way: useApp already exposes it if added
                                            await (useApp as any)().deleteRide(tx.id);
                                        }
                                    }}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};