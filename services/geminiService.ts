
import { GoogleGenAI, Type } from "@google/genai";

/**
 * التأكد من وجود مفتاح API مفعل للخدمات المدفوعة
 */
export async function ensureProAccess() {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }
}

/**
 * دالة موحدة للتعامل مع أخطاء الحصة والكيانات غير الموجودة
 */
async function handleProError(error: any) {
  const errorMessage = error.message || "";
  const isQuotaExceeded = errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota");
  const isNotFound = errorMessage.includes("Requested entity was not found");

  if (isQuotaExceeded || isNotFound) {
    console.warn("Pro Access Error: Quota exceeded or key invalid. Opening key selector.");
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
    }
    throw new Error("لقد تجاوزت حصة الاستخدام المتاحة أو أن المفتاح غير صالح. يرجى اختيار مفتاح API مربوط بمشروع مدفوع (Billing enabled).");
  }
  throw error;
}

/**
 * تنظيف نصوص JSON المستلمة من الموديل
 */
function cleanJsonString(str: string): string {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
}

/**
 * توليد صور احترافية باستخدام gemini-3-pro-image-preview
 */
export async function generateProImage(prompt: string, size: '1K' | '2K' | '4K' = '1K', aspectRatio: string = '1:1', refImage?: string) {
  await ensureProAccess();
  // إنشاء نسخة جديدة في كل مرة لضمان استخدام المفتاح الأحدث
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const parts: any[] = [];
    if (prompt) parts.push({ text: prompt });
    if (refImage) {
      const mimeType = refImage.split(';')[0].split(':')[1] || 'image/png';
      const base64Data = refImage.split(',')[1];
      parts.push({
        inlineData: { data: base64Data, mimeType: mimeType }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts },
      config: {
        imageConfig: { aspectRatio, imageSize: size },
        tools: [{ google_search: {} }]
      }
    });

    const candidates = response.candidates || [];
    if (candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("الموديل لم يرجع أي بيانات صورية.");
  } catch (error: any) {
    return handleProError(error);
  }
}

/**
 * بناء بيانات الحملة التسويقية المتكاملة
 */
export async function generateMarketingCampaignData(productImages: string[], market: string, dialect: string, reason: string) {
  // استخدام Gemini 3 Pro يتطلب مفتاحاً محدثاً أيضاً
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemPrompt = `أنت خبير تسويق استراتيجي. حلل صور المنتج المرفقة وأنشئ حملة تسويقية لـ 9 أيام. 
  السوق: ${market}، اللهجة: ${dialect}، المناسبة: ${reason}.
  يجب أن يكون 'imagePrompt' وصفاً فنياً دقيقاً بالإنجليزية لإنشاء صورة إعلانية مذهلة تحتوي على المنتج.`;

  try {
    const imageParts = productImages.map(img => ({
      inlineData: { data: img.split(',')[1], mimeType: 'image/png' }
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          ...imageParts,
          { text: systemPrompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            campaignName: { type: Type.STRING },
            slogan: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            posts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING }
                },
                required: ["day", "title", "content", "imagePrompt"]
              }
            }
          },
          required: ["campaignName", "slogan", "targetAudience", "posts"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("استجابة فارغة من الموديل.");
    return JSON.parse(cleanJsonString(text));
  } catch (e: any) {
    return handleProError(e);
  }
}

/**
 * تحريك الصور عبر Veo
 */
export async function generateVeoVideo(prompt: string, image?: string, aspectRatio: '16:9' | '9:16' = '16:9') {
  await ensureProAccess();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: image ? {
        imageBytes: image.split(',')[1],
        mimeType: image.split(';')[0].split(':')[1] || 'image/png'
      } : undefined,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("فشل استخراج رابط الفيديو.");
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    return handleProError(error);
  }
}

export async function editImage(image: string, prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: image.split(',')[1], mimeType: 'image/png' } },
          { text: prompt }
        ]
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return response.text;
  } catch (e: any) {
    return handleProError(e);
  }
}

export async function mimicDesign(productImage: string, styleImage: string, prompt: string) {
  await ensureProAccess();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: productImage.split(',')[1], mimeType: 'image/png' } },
          { inlineData: { data: styleImage.split(',')[1], mimeType: 'image/png' } },
          { text: `إعادة تصميم المنتج الأول بروح وألوان وإضاءة الصورة الثانية. ${prompt}` }
        ]
      },
      config: { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("فشل المحاكاة.");
  } catch (e: any) {
    return handleProError(e);
  }
}

export async function startProChat() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "أنت مساعد تصميم وتسويق ذكي محترف. تجيب بالعربية وتساعد في تحليل الصور."
    }
  });
}
