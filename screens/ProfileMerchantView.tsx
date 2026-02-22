
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, ShieldCheck, Store, Package, Trash2 } from 'lucide-react';
import { ProfileDrawers } from '../components/ProfileDrawers';

export const ProfileMerchantView: React.FC = () => {
  const { profile, setCurrentTab, orderStats } = useApp();
  const [activeDrawer, setActiveDrawer] = useState<'VEHICLE' | 'LOCATION' | 'VERIFICATION' | 'BUSINESS' | 'BUSINESS_MAP' | null>(null);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mx-6 mb-8">
        <div className="bg-[#00E39A]/10 dark:bg-[#00E39A]/5 p-8 rounded-[32px] border border-[#00E39A]/20 dark:border-[#00E39A]/10 shadow-sm relative overflow-hidden group transition-all">
          <div className="relative z-10">
            <p className="text-[11px] font-black text-[#00C285] dark:text-[#00E39A] uppercase tracking-[0.25em] mb-2 opacity-80">Store Performance</p>
            <div className="flex items-baseline justify-between w-full">
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">{orderStats.count}</p>
                <div className="h-2 w-2 rounded-full bg-[#00E39A] mb-2"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Orders</p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">D{orderStats.revenue.toLocaleString()}</p>
                <p className="text-[9px] font-black text-[#00C285] dark:text-[#00E39A] uppercase tracking-widest mt-0.5">Total Revenue</p>
              </div>
            </div>
          </div>

          {/* Decorative background accents */}
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-[#00E39A]/10 blur-[60px] rounded-full group-hover:bg-[#00E39A]/20 transition-colors"></div>
          <div className="absolute bottom-[-10px] left-[-10px] w-20 h-20 bg-[#00E39A]/5 blur-[40px] rounded-full"></div>
        </div>
      </div>

      <div className="mx-6 space-y-3.5">
        <button onClick={() => setActiveDrawer('BUSINESS')} className="w-full bg-white dark:bg-zinc-900 p-5 rounded-[24px] flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.99] transition-all">
          <div className="flex items-center gap-5">
            <div className="w-11 h-11 rounded-full bg-orange-50 dark:bg-orange-900/10 text-orange-500 flex items-center justify-center"><Store size={22} /></div>
            <div className="text-left">
              <p className="font-black text-[16px] text-slate-900 dark:text-white">Business Details</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1">{profile.business?.businessName || 'Update your store'}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-300" />
        </button>

        <button onClick={() => setCurrentTab('products')} className="w-full bg-white dark:bg-zinc-900 p-5 rounded-[24px] flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.99] transition-all">
          <div className="flex items-center gap-5">
            <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/10 text-blue-500 flex items-center justify-center"><Package size={22} /></div>
            <div className="text-left">
              <p className="font-black text-[16px] text-slate-900 dark:text-white">Product Catalog</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Manage items & inventory</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-300" />
        </button>

        <button onClick={() => setActiveDrawer('VERIFICATION')} className="w-full bg-white dark:bg-zinc-900 p-5 rounded-[24px] flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.99] transition-all">
          <div className="flex items-center gap-5">
            <div className="w-11 h-11 rounded-full bg-green-50 dark:bg-green-900/10 text-[#00E39A] flex items-center justify-center"><ShieldCheck size={22} /></div>
            <div className="text-left">
              <p className="font-black text-[16px] text-slate-900 dark:text-white">Verification Center</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1">ID verification</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-300" />
        </button>
      </div>

      <ProfileDrawers activeDrawer={activeDrawer} onClose={() => setActiveDrawer(null)} onActiveDrawerChange={setActiveDrawer} />
    </div>
  );
};
