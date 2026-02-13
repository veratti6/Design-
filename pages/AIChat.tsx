
import React, { useState, useEffect, useRef } from 'react';
import { startProChat } from '../services/geminiService';
import { Message } from '../types';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: 'مرحباً بك! أنا مساعد التصميم الذكي الخاص بك. يمكنك الآن إرسال الصور لي لمناقشتها، أو طلب تحليلات فنية، أو حتى طلب نصائح لتطوير تصاميمك الحالية.',
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatInstance, setChatInstance] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const chat = await startProChat();
        setChatInstance(chat);
      } catch (err) {
        console.error("Failed to initialize chat", err);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedImage) || !chatInstance || loading) return;

    const currentInput = input;
    const currentImage = attachedImage;

    const userMessage: Message = { 
      role: 'user', 
      text: currentInput + (currentImage ? '\n[صورة مرفقة]' : ''), 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedImage(null);
    setLoading(true);

    try {
      // Prepare message parts for multimodal support
      const messageParts: any[] = [];
      if (currentInput.trim()) {
        messageParts.push({ text: currentInput });
      }
      if (currentImage) {
        messageParts.push({
          inlineData: {
            data: currentImage.split(',')[1],
            mimeType: currentImage.split(';')[0].split(':')[1] || 'image/png'
          }
        });
      }

      // If text is empty but image exists, add a default prompt
      if (messageParts.length === 1 && currentImage) {
        messageParts.unshift({ text: "حلل هذه الصورة وقدم لي اقتراحات تصميمية عنها." });
      }

      const response = await chatInstance.sendMessage({ message: messageParts });
      const modelMessage: Message = { 
        role: 'model', 
        text: response.text || 'عذراً، لم أستطع معالجة هذا الطلب.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'حدث خطأ أثناء تحليل الصورة أو إرسال الرسالة. يرجى التأكد من حجم الصورة والمحاولة مرة أخرى.', 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col animate-in fade-in duration-500">
      <div className="bg-slate-800/50 rounded-3xl border border-slate-700 shadow-xl flex-1 flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-900/30">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-[85%] p-4 rounded-2xl text-right ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none shadow-md'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base">{msg.text}</p>
                <span className="text-[10px] opacity-60 mt-2 block">
                  {msg.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          {attachedImage && (
            <div className="mb-4 flex items-center justify-end animate-in slide-in-from-bottom-2">
              <div className="relative group">
                <img src={attachedImage} className="h-20 w-20 object-cover rounded-xl border-2 border-blue-500" alt="Preview" />
                <button 
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-xl"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handleSend}
              disabled={loading || (!input.trim() && !attachedImage)}
              className={`px-6 py-4 rounded-2xl font-black transition-all ${
                loading ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg active:scale-95'
              }`}
            >
              إرسال
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل عن تصميمك أو اطلب تحسينات..."
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-14 pr-6 py-4 text-right outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl opacity-60 hover:opacity-100 transition-opacity"
                title="إرفاق صورة"
              >
                🖼️
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-3">
            يمكنك إرفاق صور التصاميم لمناقشتها مع الذكاء الاصطناعي مباشرة.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
