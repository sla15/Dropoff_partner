
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, ShieldCheck, Car, MapPin } from 'lucide-react';
import { ProfileDrawers } from '../components/ProfileDrawers';

export const ProfileDriverView: React.FC = () => {
  const { profile, rideStats } = useApp();
  const [activeDrawer, setActiveDrawer] = useState<'VEHICLE' | 'LOCATION' | 'VERIFICATION' | null>(null);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Driver Stats Card - Distinct accent style */}
      <div className="mx-6 mb-8">
        <div className="bg-[#00E39A]/10 dark:bg-[#00E39A]/5 p-8 rounded-[32px] border border-[#00E39A]/20 dark:border-[#00E39A]/10 shadow-sm relative overflow-hidden group transition-all">
          <div className="relative z-10">
            <p className="text-[11px] font-black text-[#00C285] dark:text-[#00E39A] uppercase tracking-[0.25em] mb-2 opacity-80">Total Rides Completed</p>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">{rideStats.completed}</p>
              <div className="h-2 w-2 rounded-full bg-[#00E39A] mb-2"></div>
            </div>

          </div>

          {/* Decorative background accents */}
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-[#00E39A]/10 blur-[60px] rounded-full group-hover:bg-[#00E39A]/20 transition-colors"></div>
          <div className="absolute bottom-[-10px] left-[-10px] w-20 h-20 bg-[#00E39A]/5 blur-[40px] rounded-full"></div>
        </div>
      </div>

      <div className="mx-6 space-y-3.5">
        {/* Row 1: Vehicle Details */}
        <button
          onClick={() => setActiveDrawer('VEHICLE')}
          className="w-full bg-white dark:bg-zinc-900/50 p-5 rounded-[24px] flex items-center justify-between border border-slate-100 dark:border-zinc-800 shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-5">
            <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/10 text-blue-500 flex items-center justify-center">
              <Car size={22} />
            </div>
            <div className="text-left">
              <p className="font-black text-[16px] text-slate-900 dark:text-white">Vehicle Profile</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1">
                {profile.vehicle?.model ? (
                  <span className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {profile.vehicle.type === 'SCOOTER_TUKTUK' ? 'Scooter / TukTuk' :
                        profile.vehicle.type === 'ECONOMIC' ? 'Economic' :
                          profile.vehicle.type === 'PREMIUM' ? 'Premium' : profile.vehicle.type}
                    </span>
                    <span>• {profile.vehicle.model}</span>
                  </span>
                ) : 'Set up vehicle'}
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-300" />
        </button>

        {/* Row 2: Location */}
        <button
          onClick={() => setActiveDrawer('LOCATION')}
          className="w-full bg-white dark:bg-zinc-900/50 p-5 rounded-[24px] flex items-center justify-between border border-slate-100 dark:border-zinc-800 shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-5">
            <div className="w-11 h-11 rounded-full bg-red-50 dark:bg-red-900/10 text-red-500 flex items-center justify-center">
              <MapPin size={22} />
            </div>
            <div className="text-left">
              <p className="font-black text-[16px] text-slate-900 dark:text-white">Home Location</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1">{profile.location || 'Not set'}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-300" />
        </button>

        {/* Row 3: Verification */}
        <button
          onClick={() => setActiveDrawer('VERIFICATION')}
          className="w-full bg-white dark:bg-zinc-900/50 p-5 rounded-[24px] flex items-center justify-between border border-slate-100 dark:border-zinc-800 shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-5">
            <div className="w-11 h-11 rounded-full bg-green-50 dark:bg-green-900/10 text-[#00E39A] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div className="text-left">
              <p className="font-black text-[16px] text-slate-900 dark:text-white">Legal Documents</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1">ID & License verification</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-300" />
        </button>
      </div>

      <ProfileDrawers activeDrawer={activeDrawer} onClose={() => setActiveDrawer(null)} />
    </div>
  );
};
