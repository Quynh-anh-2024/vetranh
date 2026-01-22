export enum SubjectId {
  ART = 'Mĩ thuật',
  TECH = 'Công nghệ',
  ACTIVITY = 'Hoạt động trải nghiệm'
}

export interface Lesson {
  id: string; // e.g., "L1_T1_L1"
  no: number;
  name: string;
  sourceRef?: string;
}

export interface Topic {
  id: string; // e.g., "L1_T1"
  no: number;
  name: string;
  lessons: Lesson[];
}

export interface GradeLevel {
  grade: number;
  topics: Topic[];
}

export interface CurriculumData {
  [grade: number]: GradeLevel;
}

export interface ArtWork {
  id: string;
  imagePreviewBase64: string; // Was imageBase64
  promptTextEN: string; // Was prompt
  promptTextVN?: string;
  lessonName: string;
  topicName: string;
  grade: number;
  style: string;
  createdAt: number;
  userId: string;
  authorName: string;
  visibility: 'public' | 'private';
}

export interface IdeaSuggestion {
  title: string;
  description: string;
  materials: string[];
}

export interface VietnameseIdea {
  id: string;
  name: string;      // Tên ý tưởng
  composition: string; // Bố cục/Nhân vật
  details: string;   // Chi tiết nổi bật
  context: string;   // Bối cảnh
  level: 'Thấp' | 'Vừa' | 'Cao';
}

// Draft State for LocalStorage
export interface ArtDraftState {
  lessonId: string;
  previewBase64: string | null;
  promptTextEN: string;
  promptTextVN: string;
  style: string;
  isSaved: boolean;
  savedDocId: string | null;
  timestamp: number;
}

// UI Theme Helpers
export const GRADE_THEMES: Record<number, string> = {
  1: 'from-yellow-400 to-orange-500',
  2: 'from-green-400 to-emerald-600',
  3: 'from-cyan-400 to-blue-500',
  4: 'from-purple-400 to-indigo-600',
  5: 'from-rose-400 to-red-600',
};

export const GRADE_COLORS: Record<number, string> = {
  1: 'text-orange-500 bg-orange-50 border-orange-200',
  2: 'text-green-600 bg-green-50 border-green-200',
  3: 'text-blue-500 bg-blue-50 border-blue-200',
  4: 'text-purple-600 bg-purple-50 border-purple-200',
  5: 'text-rose-600 bg-rose-50 border-rose-200',
};