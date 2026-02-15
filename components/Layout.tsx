
import React from 'react';
import { useApp } from '../context/AppContext';
import { FloatingNav } from './FloatingNav';
import { NotificationBanner } from './NotificationBanner';
import { DriverHome } from '../screens/DriverHome';
import { MerchantOrders } from '../screens/MerchantOrders';
import { ProductManagement } from '../screens/ProductManagement';
import { WalletScreen } from '../screens/WalletScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ChatScreen } from '../screens/ChatScreen';

export const Layout: React.FC = () => {
  const { role, activeChat, currentTab, setCurrentTab, isDarkMode, isLocked } = useApp();

  // Auto-switch to wallet if locked
  React.useEffect(() => {
    if (isLocked && currentTab !== 'wallet') {
      setCurrentTab('wallet');
    }
  }, [isLocked, currentTab, setCurrentTab]);

  const renderScreen = () => {
    if (role === 'DRIVER') {
      switch (currentTab) {
        case 'home': return <DriverHome />;
        case 'wallet': return <WalletScreen />;
        case 'profile': return <ProfileScreen />;
        default: return <DriverHome />;
      }
    } else {
      switch (currentTab) {
        case 'orders': return <MerchantOrders />;
        case 'products': return <ProductManagement />;
        case 'wallet': return <WalletScreen />;
        case 'profile': return <ProfileScreen />;
        default: return <MerchantOrders />;
      }
    }
  };

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden relative transition-colors duration-300 
      ${isLocked ? 'border-4 border-red-600' : ''} 
      ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <NotificationBanner />

      {/* Screen Content */}
      <main className="flex-1 h-full overflow-hidden relative">
        {renderScreen()}
      </main>

      {/* Overlays */}
      {activeChat && <ChatScreen />}

      {/* Navigation (Hide when chat is open or ride is active for cleaner look) */}
      {!activeChat && (
        <FloatingNav
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          isVisible={!useApp().rideStatus || useApp().rideStatus === 'IDLE'}
        />
      )}
    </div>
  );
};
