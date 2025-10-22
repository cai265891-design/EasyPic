export type TaskStatus = 'pending' | 'analyzing' | 'writing' | 'generating' | 'completed' | 'failed';

export interface ImageItem {
  id: string;
  type: 'original' | 'main' | 'lifestyle' | 'detail' | 'dimension' | 'feature';
  url: string;
  width: number;
  height: number;
  fileSize: number;
}

export interface Copywriting {
  title: string;
  bulletPoints: string[];
  description: string;
  language: string; // 'en' | 'de' | 'fr' ...
}

export interface Project {
  id: string;
  name: string;
  status: TaskStatus;
  createdAt: string;
  images: ImageItem[];
  copywriting?: Copywriting;
  analysis?: Record<string, any>;
}

export interface CreateProjectPayload {
  name: string;
  files?: File[];
  options?: {
    productName?: string;
    keyFeatures?: string;
    specs?: string;
    category?: string;
    style?: string;
    language?: string;
  };
}

export interface User {
  id: string;
  email: string;
  credits: number;
}
