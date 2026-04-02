// Core data models for AI Diagnostic Template

export enum LoadingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ProductRecommendation {
  name: string;
  type: string;
  reason: string;
}

export interface RoutineStep {
  stepName: string;
  frequency: string;
  instruction: string;
  product_type?: string;
  key_ingredients?: string;
}

export interface HairProfile {
  curlType: string;
  porosity: string;
  condition: string;
  visualAnalysis: string;
}

export interface ClinicTreatment {
  name: string;
  price: string;
  reason: string;
  projected_improvement?: string; // Specific motivation for this treatment (Paragraph 1)
  personalized_benefits?: string; // "Why you need this" (Paragraph 2)
}

export interface MarketingSignals {
  is_smiling: boolean;
  ptosis_severity: string;
  lip_volume: string;
  has_suspected_procedures: boolean;
  procedure_markers?: string[];
  recommended_audiences: string[];
  botox_zones?: string[]; // Areas needing relaxants (forehead, glabella)
  filler_zones?: string[]; // Areas needing volume (nasolabial, lips)
  device_opportunities?: string[]; // Suggestions for hardware (IPL, SMAS)
  grooming_markers?: string[]; // Signs of self-care (lashes, brows)
  tired_look_score?: number; // 0-10 fatigue index for marketing hooks
}

export interface HiddenAnalysis {
  estimated_visual_age: number;
  problem_severity: 'Low' | 'Medium' | 'High' | 'Critical';
  premium_affinity_markers: string[];
  marketing_signals?: MarketingSignals;
  sales_strategy?: {
      hook: string;
      pain_point_trigger: string;
      objection_handling: string;
  };
  whatsapp_templates?: {
      care: string;
      result: string;
      offer: string;
  };
}

export interface Marker {
  type: string;
  x: number; // 0-1000
  y: number; // 0-1000
  label: string;
  severity?: number;
}

export interface SkinMetrics {
  hydration: number;
  pores: number;
  texture: number;
  firmness: number;
  barrier: number;
  tone: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
}

export interface GeneratedQuiz {
  confirmation_question: QuizQuestion;
  preference_question: QuizQuestion;
  budget_intent_question: QuizQuestion;
}

export interface ZoneProgressItem {
  zone: string;
  metric: string;
  percentChange: number;
  description: string;
}

export interface ComparisonResult {
  summary?: string;
  highlights?: string[];
  setbacks?: string[];
  praise?: string;
  confidence?: number;
  quality?: string;
  zoneProgress?: ZoneProgressItem[];
}

export interface AnalysisResult {
  profile: any; // Flexible to support Hair, Skin, Alopecia, Mole profiles
  hidden_analysis?: HiddenAnalysis; // CRM internal data
  routine: RoutineStep[];
  products: {
    affordable: ProductRecommendation[];
    midRange: ProductRecommendation[];
    luxury: ProductRecommendation[];
  };
  clinicTreatments?: ClinicTreatment[]; // Optional clinic-specific recommendations
  closingAdvice: string;
  markers?: Marker[];
  metrics?: SkinMetrics;
  metrics_analysis?: Record<string, string>;
  active_ingredients?: string[];
  generated_quiz?: GeneratedQuiz; // NEW: Dynamic quiz
  comparison?: ComparisonResult;
}

export interface UploadedImage {
  id: string;
  url: string;
  file: File;
  base64: string;
}

export interface Lead {
  email: string;
  curlType: string;
  porosity: string;
  timestamp: number; // Unix timestamp
}

export interface SavedAnalysis {
  result: AnalysisResult;
  photos: string[]; // base64 images
  timestamp: number;
  email?: string; // User email from EmailGate
}

// Diagnostic Types Configuration
export type DiagnosticType = 'hair' | 'alopecia' | 'skin' | 'mole';

export interface ColorPalette {
  primary50: string;
  primary100: string;
  primary200: string;
  primary500: string;
  primary600: string;
  primary700: string;
  cssVars?: Record<string, string>;
}

export interface DiagnosticConfig {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  colors: ColorPalette;
  systemPrompt: string;
  schema: any; // Gemini JSON schema
  uploadHint: string;
}

export interface SocialContent {
  id?: string;
  clinicId: string;
  type: 'google_review' | 'instagram_post';
  procedureKeywords: string[];
  isActive: boolean;
  order: number;
  createdAt: any; // Firestore Timestamp
  
  // Google Review fields
  author?: string;
  rating?: number;
  text?: string;
  date?: string;
  originalUrl?: string;
  
  // Instagram Post fields
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'carousel';
  caption?: string;
  permalink?: string;
  thumbnailUrl?: string;
}
