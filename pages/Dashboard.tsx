
import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const tools = [
    {
      id: AppView.ECOM_STUDIO,
      title: 'استوديو التجارة الإبداعي',
      desc: 'صمم هويتك التجارية، خطط لحملاتك الإعلانية، وأنتج محتوى بصري مذهل لمنتجاتك بضغطة زر.',
      icon: '💎',
      color: 'from-amber-400 to-orange-500',
      tag: 'الأكثر طلباً'
    },
    {
      id: AppView.IMAGE_GEN,
      title: 'مولد الصور الخارق Pro',
      desc: 'حول كلماتك إلى واقع بصري بدقة 4K. تقنيات الجيل القادم للتصميم الفني المتقدم.',
      icon: '🎭',
      color: 'from-blue-500 to-indigo-600',
      tag: 'عالي الدقة'
    },
    {
      id: AppView.VIDEO_GEN,
      title: 'سينما الذكاء الاصطناعي Veo',
      desc: 'بث الحياة في صورك وأفكارك. أنتج فيديوهات احترافية بمؤثرات سينمائية مذهلة.',
      icon: '🎬',
      color: 'from-purple-500 to-pink-600',
      tag: 'تحريك متطور'
    },
    {
      id: AppView.AI_CHAT,
      title: 'مستشارك التصميمي الذكي',
      desc: 'ناقش أفكارك، حلل تصاميمك، واحصل على إرشادات فنية من خبير ذكاء اصطناعي متكامل.',
      icon: '🧠',
      color: 'from-emerald-400 to-teal-600',
      tag: 'خبير'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-20 pb-20 overflow-visible">
      {/* Hero Section */}
      <div className="text-center lg:text-right relative pt-10">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Next Gen Design Studio
        </div>
        
        <h2 className="text-7xl md:text-[6.5rem] font-black mb-10 leading-[1] tracking-tighter text-white animate-in fade-in slide-in-from-right-12 duration-1000">
          ابتكر مع <br/>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">OMER AI</span>
        </h2>
        
        <p className="text-slate-400 text-xl md:text-2xl max-w-3xl lg:ml-0 lg:mr-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 [animation-delay:200ms]">
          المنصة الأكثر تكاملاً للمبدعين والمسوقين. نحن لا نقدم أدوات فحسب، بل نبني لك مستقبلاً بصرياً لا حدود له.
        </p>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tools.map((tool, index) => (
          <button
            key={tool.id}
            onClick={() => onViewChange(tool.id)}
            style={{ animationDelay: `${index * 150}ms` }}
            className="premium-card group relative p-10 text-right rounded-[3.5rem] flex flex-col items-start animate-in fade-in slide-in-from-bottom-10"
          >
            <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 blur-[80px] transition-all duration-1000`}></div>
            
            <div className="flex justify-between items-start w-full mb-12">
               <div className="flex flex-col gap-3">
                 <div className="text-6xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700">{tool.icon}</div>
                 <span className="text-[9px] font-black px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-slate-400 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors uppercase tracking-widest">{tool.tag}</span>
               </div>
               <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-500 transform group-hover:rotate-[360deg] shadow-2xl">
                 <span className="text-2xl group-hover:text-white transition-colors">→</span>
               </div>
            </div>
            
            <h3 className="text-3xl font-black mb-4 text-white group-hover:text-blue-400 transition-colors duration-500">{tool.title}</h3>
            <p className="text-slate-500 leading-relaxed text-lg font-medium group-hover:text-slate-300 transition-colors duration-500">{tool.desc}</p>
            
            <div className="mt-10 pt-8 border-t border-white/5 w-full flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0">
               <div className="flex -space-x-2 rtl:space-x-reverse">
                 {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 shimmer"></div>)}
               </div>
               <span className="text-blue-500 text-sm font-black">ابدأ الآن</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
