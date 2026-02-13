
import React, { useState, useRef } from 'react';
import { generateProImage } from '../services/geminiService';
import { ImageSize, AspectRatio } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [refImage, setRefImage] = useState<string | null>(null);
  const [size, setSize] = useState<ImageSize>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRefImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !refImage) {
      setError("يرجى إدخال وصف نصي أو اختيار صورة مرجعية.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const imageUrl = await generateProImage(prompt, size, aspectRatio, refImage || undefined);
      setResult(imageUrl);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء توليد الصورة. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const sizes: ImageSize[] = ['1K', '2K', '4K'];
  const ratios: { label: string; value: AspectRatio }[] = [
    { label: 'مربع (1:1)', value: '1:1' },
    { label: 'سينمائي (16:9)', value: '16:9' },
    { label: 'طولي (9:16)', value: '9:16' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-slate-700 shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-right flex items-center justify-end gap-3">
          <span>توليد وتصميم الصور الاحترافي</span>
          <span className="text-blue-500 text-2xl">🎨</span>
        </h2>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-right">
              <label className="block text-sm font-medium text-slate-400 mb-2">وصف التصميم (اختياري عند استخدام صورة)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="أدخل وصفاً تفصيلياً أو اترك الوصف فارغاً ليعتمد الذكاء الاصطناعي على الصورة المرجعية فقط..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-right min-h-[140px] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-right">
                <label className="block text-sm font-medium text-slate-400 mb-3">دقة الصورة</label>
                <div className="flex gap-2 justify-end">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`px-5 py-2 rounded-xl border font-bold transition-all ${
                        size === s 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <label className="block text-sm font-medium text-slate-400 mb-3">الأبعاد السينمائية</label>
                <div className="flex gap-2 flex-wrap justify-end">
                  {ratios.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setAspectRatio(r.value)}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                        aspectRatio === r.value 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 ${
                loading 
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جاري التصميم والابتكار...</span>
                </>
              ) : (
                <>
                  <span>توليد التصميم الآن</span>
                  <span className="text-2xl">✨</span>
                </>
              )}
            </button>
          </div>

          {/* Reference Image Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-400 text-right">صورة مرجعية (Image to Image)</label>
            <div 
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${
                refImage ? 'border-blue-500/50 bg-slate-900' : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
              }`}
            >
              {refImage ? (
                <>
                  <img src={refImage} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="Reference" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white font-bold bg-blue-600 px-4 py-2 rounded-lg">تغيير الصورة</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <span className="text-5xl mb-4 block filter grayscale opacity-50">🖼️</span>
                  <p className="text-slate-400 font-bold mb-1">رفع صورة مرجعية</p>
                  <p className="text-slate-500 text-xs leading-relaxed">استخدم صورة لتوجيه النمط أو التكوين الفني</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            {refImage && (
              <button 
                onClick={() => setRefImage(null)}
                className="w-full py-2 text-xs text-red-400 hover:text-red-300 font-bold transition-colors bg-red-500/5 rounded-lg border border-red-500/10"
              >
                إزالة الصورة المرجعية
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-right animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in zoom-in-95 duration-700">
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
             <div className="flex items-center justify-between mb-4 flex-row-reverse">
              <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest border border-blue-500/20">التصميم الجاهز</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = result;
                    link.download = 'architech-ai-design.png';
                    link.click();
                  }}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  title="تحميل"
                >
                  📥
                </button>
              </div>
            </div>
            <img src={result} alt="Generated result" className="w-full rounded-2xl shadow-inner bg-slate-900 border border-slate-700" />
          </div>
          <div className="flex justify-center gap-4 pb-8">
            <button
              onClick={() => {
                setResult(null);
                setPrompt('');
                setRefImage(null);
              }}
              className="px-10 py-4 bg-white text-slate-900 hover:bg-blue-50 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95"
            >
              تصميم عمل جديد
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
