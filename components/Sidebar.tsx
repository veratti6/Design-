
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'الرئيسية', icon: '🏠' },
    { id: AppView.ECOM_STUDIO, label: 'استوديو المنتجات', icon: '🛍️' },
    { id: AppView.IMAGE_GEN, label: 'توليد الصور Pro', icon: '🎨' },
    { id: AppView.IMAGE_EDIT, label: 'تعديل الصور', icon: '🖌️' },
    { id: AppView.VIDEO_GEN, label: 'فيديو Veo', icon: '🎬' },
    { id: AppView.AI_CHAT, label: 'المساعد الذكي', icon: '✨' },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5 px-4 md:px-8 py-3 flex items-center justify-between gap-4 select-none">
      {/* Brand Identity */}
      <div 
        className="flex items-center gap-3 group cursor-pointer shrink-0" 
        onClick={() => onNavigate(AppView.DASHBOARD)}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-xl text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          O
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter text-white group-hover:text-blue-400 transition-colors font-['Inter']">OMER</span>
          <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] -mt-1 hidden sm:block font-['Inter']">DESIGN INTEL</span>
        </div>
      </div>

      {/* Horizontal Navigation */}
      <nav className="flex items-center gap-1 md:gap-3 overflow-x-auto no-scrollbar py-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-500 shrink-0 relative group ${
                isActive 
                  ? 'bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`text-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isActive 
                  ? 'scale-125 drop-shadow-[0_4px_12px_rgba(59,130,246,0.6)] opacity-100' 
                  : 'opacity-60 group-hover:opacity-100 group-hover:scale-110'
              }`}>
                {item.icon}
              </span>
              <span className={`font-bold text-xs md:text-sm whitespace-nowrap tracking-tight transition-colors duration-300 font-['Cairo'] ${
                isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
              }`}>
                {item.label}
              </span>
              
              {/* Refined Active Indicator */}
              {isActive && (
                <div className="absolute -bottom-[0.8rem] left-5 right-5 h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Action/Status Group */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-white/5">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-['Inter']">Pro Access</span>
        </div>
        <button className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center hover:bg-slate-700 transition-all text-lg shadow-inner group overflow-hidden">
           <span className="group-hover:animate-bounce">🔔</span>
        </button>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  );
};

export default Sidebar;
