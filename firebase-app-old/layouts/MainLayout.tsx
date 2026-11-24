import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import NotificationsPanel from '../components/NotificationsPanel';

const MainLayout: React.FC = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const onToggleNotifications = () => setIsNotificationsOpen(prev => !prev);

  return (
    <div className="min-h-screen text-gray-200 flex flex-col items-center bg-gray-900 overflow-x-hidden">
      <Header onToggleNotifications={onToggleNotifications} />
      <main 
        className="flex-grow w-full max-w-xl bg-hey-church-bg shadow-2xl relative overflow-x-hidden" 
        style={{ 
          paddingTop: 'calc(4rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))'
        }}
      >
        <Outlet context={{ onToggleNotifications }} />
      </main>
      <BottomNav />
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
};

export default MainLayout;