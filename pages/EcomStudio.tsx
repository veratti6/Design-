
import React, { useState, useRef, useEffect } from 'react';
import { generateMarketingCampaignData, generateProImage } from '../services/geminiService';
import { SavedItem } from '../types';

interface CampaignPost {
  day: number;
  title: string;
  content: string;
  imagePrompt: string;
  generatedImage?: string;
  error?: boolean;
}

interface CampaignResult {
  campaignName: string;
  slogan: string;
  targetAudience: string;
  posts: CampaignPost[];
}

/**
 * محرر نصوص غني مخصص (Rich Text Editor)
 * يوفر أدوات تنسيق أساسية لتحسين المظهر البصري للمنشورات
 */
const RichTextEditor: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    handleInput();
    if (editorRef.current) editorRef.current.focus();
  };

  return (
    <div className="flex flex-col border border-white/10 rounded-2xl bg-slate-900/50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 transition-all group/editor">
      <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-white/5 backdrop-blur-sm shrink-0">
        <button 
          onClick={() => execCommand('bold')}
          className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl text-slate-300 font-black text-sm transition-colors"
          title="عريض"
        >
          B
        </button>
        <button 
          onClick={() => execCommand('italic')}
          className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl text-slate-300 italic font-serif text-sm transition-colors"
          title="مائل"
        >
          I
        </button>
        <button 
          onClick={() => execCommand('underline')}
          className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl text-slate-300 underline text-sm transition-colors"
          title="تسطير"
        >
          U
        </button>
        <div className="w-px h-4 bg-white/10 mx-1"></div>
        <button 
          onClick={() => execCommand('insertUnorderedList')}
          className="px-3 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl text-slate-300 text-[10px] font-black uppercase transition-colors"
          title="قائمة منقطة"
        >
          • List
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 min-h-[160px] max-h-[400px] overflow-y-auto text-sm text-slate-300 leading-relaxed outline-none custom-scrollbar rich-text-content text-right"
        data-placeholder={placeholder}
      />
      <style>{`
        .rich-text-content:empty:before {
          content: attr(data-placeholder);
          color: #475569;
          font-style: italic;
        }
        .rich-text-content ul { list-style-type: disc; padding-right: 1.5rem; margin: 0.5rem 0; }
        .rich-text-content li { margin-bottom: 0.25rem; }
        .rich-text-content b { font-weight: 900; color: #fff; }
        .rich-text-content i { font-style: italic; }
        .rich-text-content u { text-decoration: underline; }
      `}</style>
    </div>
  );
};

const EcomStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaign' | 'mimic' | 'photoshoot' | 'library'>('campaign');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const [market, setMarket] = useState('السعودية');
  const [dialect, setDialect] = useState('عامية سعودية');
  const [reason, setReason] = useState('إطلاق منتج جديد');
  const [campaignResult, setCampaignResult] = useState<CampaignResult | null>(null);

  const [selectedAngles, setSelectedAngles] = useState<string[]>(['أمامية']);
  const [selectedScenes, setSelectedScenes] = useState<string[]>(['ستوديو فخم']);
  const [shootResults, setShootResults] = useState<{url: string, angle: string, scene: string}[]>([]);

  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTarget, setSaveTarget] = useState<{type: 'campaign' | 'photoshoot', data: any, defaultName: string} | null>(null);
  const [customSaveName, setCustomSaveName] = useState('');

  const productRef = useRef<HTMLInputElement>(null);
  const campaignExportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('OMER_SAVED_LIBRARY');
    if (stored) try { setSavedItems(JSON.parse(stored)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('OMER_SAVED_LIBRARY', JSON.stringify(savedItems));
  }, [savedItems]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => setProductImages(prev => [...prev, event.target?.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => setProductImages(prev => prev.filter((_, i) => i !== index));

  const openSaveDialog = (type: 'campaign' | 'photoshoot', data: any, defaultName: string) => {
    setSaveTarget({ type, data, defaultName });
    setCustomSaveName(defaultName);
    setShowSaveModal(true);
  };

  const confirmSaveToLibrary = () => {
    if (!saveTarget) return;
    const { type, data } = saveTarget;
    const nameToUse = customSaveName.trim() || saveTarget.defaultName;
    const newItem: SavedItem = {
      id: Date.now().toString(),
      type,
      name: nameToUse,
      date: new Date().toLocaleString('ar-EG'),
      data,
      previewImage: type === 'campaign' ? data.posts[0]?.generatedImage : data[0]?.url
    };
    setSavedItems(prev => [newItem, ...prev]);
    setSaveSuccess(true);
    setShowSaveModal(false);
    setSaveTarget(null);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const loadFromLibrary = (item: SavedItem) => {
    if (item.type === 'campaign') {
      setCampaignResult(item.data);
      setShootResults([]);
      setActiveTab('campaign');
    } else {
      setShootResults(item.data);
      setCampaignResult(null);
      setActiveTab('photoshoot');
    }
  };

  const downloadAllAsZip = async () => {
    setLoading(true);
    try {
      const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default;
      const zip = new JSZip();
      if (campaignResult) {
        campaignResult.posts.forEach((post) => {
          if (post.generatedImage) zip.file(`day-${post.day}-${post.title}.png`, post.generatedImage.split(',')[1], { base64: true });
        });
      } else {
        shootResults.forEach((res, i) => zip.file(`shoot-${res.angle}-${res.scene}-${i}.png`, res.url.split(',')[1], { base64: true }));
      }
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `omer-design-${Date.now()}.zip`;
      link.click();
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  /**
   * دالة تصدير الحملة بصيغة PDF
   */
  const downloadAsPDF = async () => {
    if (!campaignResult || !campaignExportRef.current) return;
    setLoading(true);
    try {
      const html2pdf = (await import('https://esm.sh/html2pdf.js@0.10.1')).default;
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `OMER-Campaign-${campaignResult.campaignName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#020617'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      // نقوم بتنفيذ التحويل على النسخة المرئية
      await html2pdf().set(opt).from(campaignExportRef.current).save();
    } catch (e) {
      console.error(e);
      alert("فشل إنشاء ملف PDF.");
    } finally { setLoading(false); }
  };

  const handleCampaignAction = async () => {
    if (productImages.length === 0) return alert("يرجى رفع صورة منتج واحدة على الأقل.");
    setLoading(true); setProgress(5); setCampaignResult(null);
    try {
      const data = await generateMarketingCampaignData(productImages, market, dialect, reason);
      setCampaignResult(data);
      const posts = [...data.posts];
      for (let i = 0; i < posts.length; i++) {
        setProgress(30 + Math.round((i / posts.length) * 70));
        try {
          posts[i].generatedImage = await generateProImage(posts[i].imagePrompt, '1K', '1:1', productImages[0]);
          setCampaignResult(prev => prev ? { ...prev, posts: [...posts] } : null);
        } catch (e) { posts[i].error = true; }
      }
    } catch (err: any) { 
      setErrorStatus(err.message); 
    } finally { setLoading(false); }
  };

  const handlePhotoshootAction = async () => {
    if (productImages.length === 0) return alert("يرجى رفع صورة المنتج.");
    setLoading(true); setShootResults([]);
    const total = selectedAngles.length * selectedScenes.length;
    let count = 0;
    try {
      for (const scene of selectedScenes) {
        for (const angle of selectedAngles) {
          count++; setProgress(Math.round((count / total) * 100));
          const url = await generateProImage(`Professional product photography, ${angle} view, setting: ${scene}, high resolution, studio lighting`, '1K', '1:1', productImages[0]);
          setShootResults(prev => [...prev, { url, angle, scene }]);
        }
      }
    } catch (err: any) { setErrorStatus(err.message); } finally { setLoading(false); }
  };

  const angles = ['أمامية', 'جانبية', 'علوي', '45 درجة', 'مقربة'];
  const scenes = ['ستوديو فخم', 'بيئة طبيعية', 'منزل عصري', 'بساطة مفرطة', 'إضاءة نيون'];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20 relative">
      {/* Navigation Tabs */}
      <div className="flex flex-col items-center gap-6 print:hidden">
        <div className="glass p-2 rounded-[2.5rem] border border-white/10 flex items-center gap-1 shadow-2xl">
          {[
            { id: 'campaign', label: 'حملة تسويقية', icon: '🚀', color: 'bg-amber-600' },
            { id: 'photoshoot', label: 'جلسة تصوير', icon: '📸', color: 'bg-blue-600' },
            { id: 'library', label: 'المكتبة الخاصة', icon: '📦', color: 'bg-indigo-600' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black transition-all duration-500 ${
                activeTab === tab.id 
                  ? `${tab.color} text-white shadow-xl scale-105` 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="hidden sm:block text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-8 print:hidden">
          {activeTab !== 'library' && (
            <div className="premium-card p-8 rounded-[3rem] space-y-6">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                <span>صور المنتج ({productImages.length})</span>
                <span className="text-blue-500">الخطوة 1</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {productImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/5 group shadow-2xl">
                    <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="Product" />
                    <button 
                      onClick={() => removeImage(idx)} 
                      className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xl"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {productImages.length < 5 && (
                  <div 
                    onClick={() => !loading && productRef.current?.click()} 
                    className="aspect-square rounded-[2rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center cursor-pointer bg-slate-900/30 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                  >
                    <span className="text-3xl group-hover:scale-125 transition-transform duration-500">➕</span>
                    <span className="text-[10px] font-bold text-slate-600 mt-2">إضافة صورة</span>
                  </div>
                )}
              </div>
              <input type="file" ref={productRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
            </div>
          )}

          {activeTab === 'campaign' && (
            <div className="premium-card p-8 rounded-[3rem] space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">هدف الحملة</label>
                <select 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  className="w-full bg-slate-900/80 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                >
                  <option>إطلاق منتج جديد</option>
                  <option>عروض خصومات</option>
                  <option>حملة موسمية</option>
                  <option>تصفية مخزون</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">السوق</label>
                  <select 
                    value={market} 
                    onChange={e => setMarket(e.target.value)} 
                    className="w-full bg-slate-900/80 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none"
                  >
                    <option>السعودية</option><option>الإمارات</option><option>مصر</option><option>عالمي</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">اللهجة</label>
                  <select 
                    value={dialect} 
                    onChange={e => setDialect(e.target.value)} 
                    className="w-full bg-slate-900/80 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none"
                  >
                    <option>عامية سعودية</option><option>فصحى</option><option>مصرية</option><option>خليجية</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleCampaignAction} 
                disabled={loading} 
                className="w-full py-6 rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-600 font-black text-xl shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? `جاري البناء... ${progress}%` : "إطلاق الحملة 🚀"}
              </button>
            </div>
          )}

          {activeTab === 'photoshoot' && (
            <div className="premium-card p-8 rounded-[3rem] space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الزوايا المفضلة</label>
                <div className="flex flex-wrap gap-2">
                  {angles.map(a => (
                    <button 
                      key={a} 
                      onClick={() => setSelectedAngles(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])} 
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${selectedAngles.includes(a) ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-white'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">البيئة الإخراجية</label>
                <div className="flex flex-wrap gap-2">
                  {scenes.map(s => (
                    <button 
                      key={s} 
                      onClick={() => setSelectedScenes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} 
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${selectedScenes.includes(s) ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-white'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handlePhotoshootAction} 
                disabled={loading} 
                className="w-full py-6 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 font-black text-xl shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? `جاري التصوير... ${progress}%` : "بدء الجلسة ✨"}
              </button>
            </div>
          )}
        </div>

        {/* Main Result Display Area */}
        <div className="lg:col-span-8 min-h-[600px] relative">
          {loading && !campaignResult && shootResults.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-500">
               <div className="w-48 h-48 relative">
                  <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-4xl text-blue-500">{progress}%</div>
               </div>
               <div className="text-center space-y-2">
                 <p className="text-2xl font-black text-white">يتم الآن استخدام ذكاء Omer البرمجي</p>
                 <p className="text-slate-500 font-medium">نحن نبني هويتك التجارية بلمسات إبداعية متقدمة...</p>
               </div>
            </div>
          )}

          {activeTab === 'library' && (
             <div className="space-y-8 animate-in fade-in duration-500">
                <h3 className="text-3xl font-black text-indigo-400 border-b border-white/10 pb-6">مشاريعك المحفوظة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {savedItems.map(item => (
                    <div 
                      key={item.id} 
                      className="premium-card p-6 rounded-[3rem] flex gap-6 group hover:border-indigo-500/40 transition-all cursor-pointer shadow-xl" 
                      onClick={() => loadFromLibrary(item)}
                    >
                       <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border border-white/5 shrink-0 shadow-inner">
                         {item.previewImage && <img src={item.previewImage} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="" />}
                       </div>
                       <div className="flex-1 space-y-2 text-right">
                         <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase ${item.type === 'campaign' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                           {item.type === 'campaign' ? 'حملة تسويقية' : 'جلسة تصوير'}
                         </span>
                         <h4 className="font-black text-xl text-white truncate group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                         <p className="text-[10px] text-slate-500 font-bold">{item.date}</p>
                       </div>
                    </div>
                  ))}
                  {savedItems.length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-20">
                       <span className="text-9xl">📦</span>
                       <p className="text-2xl font-black mt-4">المكتبة فارغة حالياً</p>
                    </div>
                  )}
                </div>
             </div>
          )}

          {campaignResult && activeTab === 'campaign' && (
            <div className="space-y-12 animate-in fade-in duration-1000">
               {/* Campaign Header Controls */}
               <div className="flex items-center justify-between border-b border-white/10 pb-10 flex-wrap gap-6 print:hidden">
                  <div className="text-right flex-1">
                    <h3 className="text-5xl font-black bg-gradient-to-l from-amber-400 to-orange-600 bg-clip-text text-transparent mb-2">{campaignResult.campaignName}</h3>
                    <p className="text-slate-400 text-lg italic opacity-70">"{campaignResult.slogan}"</p>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <button 
                      onClick={downloadAsPDF} 
                      className="px-6 py-4 bg-red-600 text-white rounded-[1.5rem] font-black text-sm flex items-center gap-3 shadow-2xl hover:bg-red-500 transition-all"
                    >
                      تحميل PDF 📄
                    </button>
                    <button 
                      onClick={downloadAllAsZip} 
                      className="px-6 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-sm flex items-center gap-3 shadow-2xl hover:bg-emerald-500 transition-all"
                    >
                      تحميل ZIP 📦
                    </button>
                    <button 
                      onClick={() => openSaveDialog('campaign', campaignResult, campaignResult.campaignName)} 
                      className="px-6 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm flex items-center gap-3 shadow-2xl hover:bg-indigo-500 transition-all"
                    >
                      حفظ المشروع 📦
                    </button>
                  </div>
               </div>

               {/* Export Container (For PDF) */}
               <div ref={campaignExportRef} className="space-y-16">
                  {/* Campaign Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="premium-card p-8 rounded-[3rem] text-right space-y-3 shadow-xl">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الجمهور المستهدف</span>
                        <p className="text-sm text-slate-300 font-bold leading-relaxed">{campaignResult.targetAudience}</p>
                     </div>
                     <div className="premium-card p-8 rounded-[3rem] text-right space-y-3 shadow-xl">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">التفاصيل الاستراتيجية</span>
                        <div className="flex gap-4 justify-end">
                           <div className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl text-xs font-black">سوق: {market}</div>
                           <div className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-xs font-black">لهجة: {dialect}</div>
                        </div>
                     </div>
                  </div>

                  {/* Posts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {campaignResult.posts.map((post, idx) => (
                      <div 
                        key={idx} 
                        className="premium-card p-8 rounded-[3.5rem] space-y-8 shadow-2xl group hover:border-amber-500/30 transition-all overflow-hidden"
                      >
                        <div className="flex justify-between items-center">
                          <span className="px-6 py-2 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black border border-amber-500/20 tracking-widest">اليوم {post.day}</span>
                          <span className="text-slate-600 font-black text-[10px] tracking-widest uppercase">Post #{idx + 1}</span>
                        </div>
                        
                        <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-black/50 border border-white/5 shadow-inner">
                          {post.generatedImage ? (
                            <img src={post.generatedImage} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center space-y-3 opacity-20">
                               <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                               <span className="text-[10px] font-black uppercase">Designing Image...</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6">
                          <h4 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">{post.title}</h4>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest print:hidden">محتوى المنشور (تحرير غني)</label>
                             <div className="print:hidden">
                               <RichTextEditor 
                                 value={post.content}
                                 onChange={(val) => {
                                   const newPosts = [...campaignResult.posts];
                                   newPosts[idx].content = val;
                                   setCampaignResult({ ...campaignResult, posts: newPosts });
                                 }}
                                 placeholder="اكتب محتوى المنشور هنا مع التنسيقات..."
                               />
                             </div>
                             {/* عرض المحتوى للطباعة فقط */}
                             <div 
                               className="hidden print:block text-slate-800 text-sm leading-relaxed text-right p-4 bg-slate-50 rounded-2xl border border-slate-200" 
                               dangerouslySetInnerHTML={{ __html: post.content }} 
                             />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {shootResults.length > 0 && activeTab === 'photoshoot' && (
            <div className="space-y-12 animate-in fade-in duration-1000">
               <div className="flex items-center justify-between border-b border-white/10 pb-8 flex-wrap gap-4 print:hidden">
                  <h3 className="text-3xl font-black text-blue-400">نتائج جلسة التصوير</h3>
                  <div className="flex gap-4">
                    <button onClick={downloadAllAsZip} className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl">
                      تحميل الصور 📦
                    </button>
                    <button onClick={() => openSaveDialog('photoshoot', shootResults, `Photoshoot - ${new Date().toLocaleDateString('ar-EG')}`)} className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl">
                      حفظ في المكتبة 📦
                    </button>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {shootResults.map((res, i) => (
                    <div key={i} className="premium-card p-6 rounded-[3.5rem] group relative overflow-hidden shadow-2xl">
                       <div className="relative aspect-square rounded-[2.5rem] overflow-hidden mb-6 shadow-inner bg-black/50">
                          <img src={res.url} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-125" alt="" />
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                             <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black text-blue-400 border border-white/5">{res.angle}</span>
                             <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black text-purple-400 border border-white/5">{res.scene}</span>
                          </div>
                       </div>
                       <a 
                        href={res.url} 
                        download={`shoot-${i}.png`} 
                        className="w-full py-5 bg-white/5 border border-white/10 hover:bg-blue-600 rounded-2xl text-[11px] font-black text-white transition-all flex items-center justify-center gap-3 group-hover:scale-[1.02] shadow-xl print:hidden"
                      >
                        تصدير الصورة 📥
                      </a>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {!loading && !campaignResult && shootResults.length === 0 && activeTab !== 'library' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-800 opacity-20 py-20">
               <div className="text-[12rem] mb-10 animate-bounce duration-[3s]">🎨</div>
               <p className="text-4xl font-black tracking-tighter">بانتظار إبداعاتك القادمة</p>
               <div className="w-40 h-1 bg-blue-500/20 rounded-full mt-10"></div>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal Dialog */}
      {showSaveModal && saveTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="premium-card w-full max-w-md p-10 rounded-[3.5rem] border border-white/10 space-y-8 text-right shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
            <h3 className="text-3xl font-black text-white tracking-tight">تسمية وحفظ المشروع</h3>
            <p className="text-slate-500 text-sm font-medium">اختر اسماً مميزاً لمشروعك لتسهيل العثور عليه لاحقاً في المكتبة الخاصة بك.</p>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">اسم المشروع</label>
              <input 
                type="text" 
                value={customSaveName} 
                onChange={e => setCustomSaveName(e.target.value)} 
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner" 
                placeholder="مثلاً: حملة الشتاء 2025..." 
                autoFocus
              />
            </div>

            <div className="flex gap-4">
               <button 
                onClick={confirmSaveToLibrary} 
                className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-blue-500 transition-all shadow-xl active:scale-95"
               >
                 حفظ الآن 📦
               </button>
               <button 
                onClick={() => setShowSaveModal(false)} 
                className="flex-1 py-5 bg-slate-800 text-slate-400 rounded-[1.5rem] font-black text-lg hover:bg-slate-700 transition-all active:scale-95"
               >
                 إلغاء
               </button>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[130] bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] animate-in slide-in-from-bottom-8">
           تم حفظ المشروع بنجاح في مكتبتك الشخصية! ✨
        </div>
      )}
      
      {/* Print-specific overrides */}
      <style>{`
        @media print {
          .premium-card {
            background: white !important;
            color: black !important;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
            margin-bottom: 2rem !important;
            padding: 2rem !important;
            page-break-inside: avoid !important;
          }
          .text-white, .text-slate-300 {
            color: black !important;
          }
          .bg-amber-500\/10, .bg-blue-500\/10 {
            background: #eee !important;
            color: #333 !important;
            border: 1px solid #ccc !important;
          }
          h3, h4 { color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default EcomStudio;
