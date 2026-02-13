
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  IMAGE_GEN = 'IMAGE_GEN',
  IMAGE_EDIT = 'IMAGE_EDIT',
  VIDEO_GEN = 'VIDEO_GEN',
  AI_CHAT = 'AI_CHAT',
  ECOM_STUDIO = 'ECOM_STUDIO'
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface GenerationResult {
  url: string;
  type: 'image' | 'video';
  prompt: string;
}

export interface SavedItem {
  id: string;
  type: 'campaign' | 'photoshoot';
  name: string;
  date: string;
  data: any;
  previewImage?: string;
}
