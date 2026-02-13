
import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ImageGenerator from './pages/ImageGenerator';
import ImageEditor from './pages/ImageEditor';
import VideoGenerator from './pages/VideoGenerator';
import AIChat from './pages/AIChat';
import EcomStudio from './pages/EcomStudio';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [displayView, setDisplayView] = useState<AppView>(AppView.DASHBOARD);
  const [isExiting, setIsExiting] = useState(false);

  const handleNavigate = (view: AppView) => {
    if (view === displayView) return;
    
    // Update active state immediately
    setCurrentView(view);
    
    // Trigger exit animation
    setIsExiting(true);
    
    // Wait for exit animation to complete before switching component
    setTimeout(() => {
      setDisplayView(view);
      setIsExiting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400); 
  };

  const renderViewContent = () => {
    switch (displayView) {
      case AppView.DASHBOARD:
        return <Dashboard onViewChange={handleNavigate} />;
      case AppView.IMAGE_GEN:
        return <ImageGenerator />;
      case AppView.IMAGE_EDIT:
        return <ImageEditor />;
      case AppView.VIDEO_GEN:
        return <VideoGenerator />;
      case AppView.AI_CHAT:
        return <AIChat />;
      case AppView.ECOM_STUDIO:
        return <EcomStudio />;
      default:
        return <Dashboard onViewChange={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      {/* Top Navigation Bar */}
      <Sidebar activeView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        <div className={`p-6 md:p-12 max-w-[1600px] mx-auto w-full transition-all duration-300 ${isExiting ? 'view-animate-exit' : 'view-animate-enter'}`} key={displayView}>
          {renderViewContent()}
        </div>
      </main>

      {/* Footer (Optional simple version) */}
      <footer className="py-12 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
           <div className="flex items-center gap-3">
              <span className="font-black text-lg tracking-tighter">OMER AI</span>
              <span className="text-[10px] font-bold uppercase tracking-widest border-l border-white/20 pl-3">Design for the future</span>
           </div>
           <p className="text-xs font-bold">© 2025 جميع الحقوق محفوظة لاستوديو Omer الإبداعي</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
