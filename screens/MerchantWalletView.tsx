import React from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, ShoppingBag, Star, Calendar, ArrowUpRight } from 'lucide-react';

export const MerchantWalletView: React.FC = () => {
    const { profile, transactions, reviews, orderStats, merchantOrders } = useApp();

    // Calculate Total Revenue from Completed Orders
    // Calculate Total Revenue from Completed or Delivered Orders
    const totalRevenue = merchantOrders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return (
        <div className="animate-in fade-in duration-500">
            {/* Earnings Overview */}
            <div className="mx-6 mt-6 bg-[#00E39A] rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10 text-center">
                    <p className="text-slate-900/60 text-[10px] font-black tracking-[0.2em] uppercase mb-2">Total Money Made</p>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">D{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>

                    <div className="inline-flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full border border-black/10">
                        <ShoppingBag size={14} className="text-slate-900" />
                        <span className="text-slate-900 text-xs font-black uppercase tracking-wider">{orderStats.count} Total Orders</span>
                    </div>
                </div>

                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="mx-6 mt-6 grid grid-cols-1 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Cash to Collect</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">D{profile.walletBalance.toLocaleString()}</p>
                    <button className="mt-3 text-[#00E39A] text-[10px] font-black uppercase flex items-center gap-1">Request <ArrowUpRight size={10} /></button>
                </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="px-8 mt-10 mb-6 flex justify-between items-end">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Customer Reviews</h3>
                <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                    <Star size={12} className="text-yellow-500 fill-current" />
                    <span className="text-yellow-600 dark:text-yellow-400 text-[11px] font-black uppercase tracking-widest">{profile.rating}</span>
                </div>
            </div>

            <div className="px-6 space-y-3">
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

            {/* Sales History */}
            <div className="px-8 mt-10 mb-6 flex justify-between items-end">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">My Sales</h3>
                <button className="text-[#00E39A] text-xs font-black uppercase tracking-widest">Export</button>
            </div>

            <div className="px-6 space-y-3 pb-8">
                {transactions.filter(t => t.type === 'ORDER').map((tx) => (
                    <div key={tx.id} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl flex items-center justify-between border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                                <Calendar size={22} />
                            </div>
                            <div>
                                <p className="font-black text-slate-900 dark:text-white text-[15px]">{tx.description}</p>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{tx.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-[15px] text-slate-900 dark:text-white">D{tx.amount.toFixed(2)}</p>
                            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-0.5">Paid</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};