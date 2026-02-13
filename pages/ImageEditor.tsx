
import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleEdit = async () => {
    if (!image || !prompt.trim()) return;
    setLoading(true);
    try {
      const editedUrl = await editImage(image, prompt);
      if (editedUrl.startsWith('data:')) {
        setResult(editedUrl);
      } else {
        alert(editedUrl); // Model response text if no image
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء معالجة الصورة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700 shadow-xl text-right">
        <h2 className="text-3xl font-bold mb-2">محرر الصور بالذكاء الاصطناعي</h2>
        <p className="text-slate-400 mb-8">قم برفع صورة واطلب من Gemini تعديلها (مثلاً: "أضف فلتر ريترو" أو "أزل الشخص في الخلفية")</p>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div 
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                image ? 'border-blue-500/50' : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
              }`}
            >
              {image ? (
                <img src={image} className="w-full h-full object-cover" alt="Source" />
              ) : (
                <>
                  <span className="text-4xl mb-4">📸</span>
                  <p className="text-slate-400 font-medium">اضغط لرفع صورة</p>
                </>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            {image && (
              <button 
                onClick={() => setImage(null)}
                className="text-sm text-red-400 hover:text-red-300 transition-colors w-full text-center"
              >
                إلغاء الصورة
              </button>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-400">ما التعديل الذي ترغب به؟</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="أضف نظارات شمسية للشخص في الصورة..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-right min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              onClick={handleEdit}
              disabled={loading || !image || !prompt}
              className={`w-full py-4 mt-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                loading ? 'bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'تنفيذ التعديلات ✨'
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-12 pt-12 border-t border-slate-700 space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-wider">النتيجة النهائية</span>
              <h3 className="text-xl font-bold">الصورة المعدلة</h3>
            </div>
            <div className="bg-slate-900 rounded-3xl p-4 border border-slate-700">
              <img src={result} className="w-full rounded-2xl" alt="Result" />
            </div>
            <div className="flex justify-center">
               <a href={result} download="architech-edited.png" className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold shadow-xl transition-all">
                تحميل الصورة المعدلة
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageEditor;
