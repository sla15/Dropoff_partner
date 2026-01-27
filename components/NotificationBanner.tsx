import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Car, ShoppingBag } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { notifications, removeNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-[60] flex flex-col items-center pt-14 pointer-events-none px-4">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className="w-full max-w-sm bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-2xl rounded-2xl p-4 mb-2 pointer-events-auto border border-gray-100 dark:border-zinc-800 animate-in slide-in-from-top-4 fade-in duration-300"
          onClick={() => removeNotification(notification.id)}
        >
          <div className="flex gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              notification.type === 'RIDE' ? 'bg-partner-green text-black' : 
              notification.type === 'ORDER' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {notification.type === 'RIDE' && <Car size={20} />}
              {notification.type === 'ORDER' && <ShoppingBag size={20} />}
              {notification.type === 'SYSTEM' && <Bell size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{notification.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-tight line-clamp-2">{notification.body}</p>
            </div>
            <div className="text-xs text-gray-400">Now</div>
          </div>
        </div>
      ))}
    </div>
  );
};