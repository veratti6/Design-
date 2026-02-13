
import React, { useState, useRef } from 'react';
import { generateVeoVideo } from '../services/geminiService';

const VideoGenerator: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !image) {
      alert("يرجى إدخال وصف أو صورة لبدء التحريك.");
      return;
    }
    setLoading(true);
    setLoadingStatus('جاري إرسال الطلب إلى استوديو Veo...');
    
    // Status rotation for better UX
    const statuses = [
      'جاري تحليل الصورة والوصف الدرامي...',
      'نقوم الآن ببناء الحركات السينمائية...',
      'العملية قد تستغرق دقيقة لجودة 720p...',
      'أوشكنا على الانتهاء من المعالجة النهائية...'
    ];
    let statusIndex = 0;
    const interval = setInterval(() => {
      setLoadingStatus(statuses[statusIndex % statuses.length]);
      statusIndex++;
    }, 8000);

    try {
      const videoUrl = await generateVeoVideo(prompt, image || undefined, aspectRatio);
      setResult(videoUrl);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء توليد الفيديو.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700 shadow-xl text-right">
        <h2 className="text-3xl font-bold mb-2 flex items-center justify-end gap-3">
          <span>تحريك الصور واستوديو Veo السينمائي</span>
          <span className="text-purple-500 text-2xl">🎬</span>
        </h2>
        <p className="text-slate-400 mb-8">حول الصور الثابتة إلى مشاهد حية أو ابتكر فيديوهات مذهلة من النصوص.</p>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left/Main Column */}
            <div className="flex-1 space-y-6 order-2 md:order-1">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400">سيناريو الحركة والإخراج</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="مثال: اجعل الكاميرا تتحرك حول العنصر ببطء مع إضافة تأثير ضبابي في الخلفية..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-right min-h-[180px] focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium text-slate-400">تنسيق الفيديو</label>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`px-6 py-3 rounded-xl border font-bold transition-all flex items-center gap-2 ${aspectRatio === '9:16' ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                  >
                    <span>طولي (9:16)</span>
                    <span className="w-3 h-5 border border-current rounded-sm"></span>
                  </button>
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`px-6 py-3 rounded-xl border font-bold transition-all flex items-center gap-2 ${aspectRatio === '16:9' ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                  >
                    <span>عرضي (16:9)</span>
                    <span className="w-5 h-3 border border-current rounded-sm"></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right/Source Column */}
            <div className="w-full md:w-72 order-1 md:order-2 space-y-4">
               <label className="block text-sm font-medium text-slate-400">صورة البداية (Image-to-Video)</label>
               <div 
                onClick={() => !loading && fileInputRef.current?.click()}
                className={`aspect-[9/12] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${
                  image ? 'border-purple-500/50 bg-slate-900 shadow-2xl shadow-purple-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
                }`}
              >
                {image ? (
                  <>
                    <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Source" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="bg-purple-600 px-4 py-2 rounded-lg font-bold text-white text-sm">استبدال الصورة</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <span className="text-4xl mb-4 block filter drop-shadow-xl">✨</span>
                    <p className="text-slate-400 font-bold text-sm mb-2">ارفع الصورة لتحريكها</p>
                    <p className="text-slate-600 text-[10px] leading-relaxed">يمكنك توليد فيديو بدون صورة بالاعتماد على الوصف فقط</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              {image && (
                <button 
                  onClick={() => setImage(null)}
                  className="w-full py-2 text-xs text-red-400 hover:text-red-300 font-bold transition-colors bg-red-500/5 rounded-lg border border-red-500/10"
                >
                  حذف صورة المصدر
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-5 mt-4 rounded-2xl font-black text-xl flex items-center justify-center gap-4 transition-all ${
              loading ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-purple-600 hover:bg-purple-500 shadow-2xl shadow-purple-600/30 active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{loadingStatus}</span>
              </div>
            ) : (
              <>
                <span>توليد الفيديو السينمائي</span>
                <span className="text-2xl">🎬</span>
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-16 space-y-8 animate-in zoom-in-95 duration-700">
            <div className="flex items-center justify-between flex-row-reverse border-b border-slate-800 pb-4">
              <h3 className="text-2xl font-black">النتيجة النهائية</h3>
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold border border-purple-500/20">READY</span>
            </div>
            
            <div className="bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-800 relative group">
              <video src={result} controls autoPlay loop className="w-full" />
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <a 
                  href={result} 
                  download="architech-veo-video.mp4" 
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 p-3 rounded-full text-white transition-all"
                  title="تحميل مباشر"
                >
                  📥
                </a>
              </div>
            </div>
            
            <div className="flex justify-center gap-6">
              <button
                onClick={() => {
                  setResult(null);
                  setPrompt('');
                  setImage(null);
                }}
                className="px-12 py-5 bg-white text-slate-950 hover:bg-purple-50 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95"
              >
                إنشاء فيديو جديد
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;
