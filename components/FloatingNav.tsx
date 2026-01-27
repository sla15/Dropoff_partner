import React from 'react';
import { Home, List, User, Wallet, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FloatingNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ currentTab, onTabChange }) => {
  const { role, isLocked } = useApp();

  const driverTabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const merchantTabs = [
    { id: 'orders', icon: List, label: 'Orders' },
    { id: 'products', icon: Plus, label: 'Products' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const tabs = role === 'DRIVER' ? driverTabs : merchantTabs;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm z-[100]">
      <div className={`bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2.5 flex justify-between items-center px-4 transition-colors duration-500 ${isLocked ? 'border-red-500/50 bg-red-50/90 dark:bg-red-950/90' : 'border-slate-200/50 dark:border-zinc-800/50'}`}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const isDisabled = isLocked && tab.id !== 'wallet';
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={`flex items-center justify-center w-14 h-14 rounded-[22px] transition-all duration-300 relative ${isActive
                ? `text-slate-900 ${isLocked ? 'bg-red-500' : 'bg-[#00E39A]'} shadow-[0_8px_20px_rgba(239,68,68,0.3)] scale-110 active:scale-105`
                : isDisabled
                  ? 'text-slate-300 dark:text-zinc-700 opacity-40 cursor-not-allowed'
                  : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <div className={`absolute -bottom-1.5 w-1 h-1 rounded-full ${isLocked ? 'bg-red-600' : 'bg-slate-900'}`}></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
