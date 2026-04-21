export enum StudioMode {
  VIDEO = 'video',
  PHOTO = 'photo',
  PAINT = 'paint',
  AD_BUILDER = 'ad_builder',
  AUDIOBOOK = 'audiobook',
  NOTEBOOK = 'notebook',
  ADMIN = 'admin',
  PROFILE = 'profile',
  STORAGE = 'storage',
  SHOP = 'shop',
  COMMUNICATION = 'communication',
  COMMUNICATION_SKILLS = 'communication_skills',
  OFFICE = 'office',
  SUPPORT = 'support',
  VPS_MANAGER = 'vps_manager',
  FINANCE = 'finance',
  TECH_SKILLS = 'tech_skills',
  LIFE_SKILLS = 'life_skills',
  HEALTH = 'health',
  CAREER = 'career',
  LEGAL = 'legal',
  QUIZ = 'quiz',
  AI_LEARNING = 'ai_learning',
  PROGRESS = 'progress',
  GITHUB = 'github'
}

export type UserRole = 'User' | 'Creator' | 'admin';

export type SubscriptionTier = 'Free' | 'Micro' | 'Student' | 'Individual' | 'Creator' | 'Studio' | 'Enterprise';
export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';
export type MarketingAssetType = 'ad' | 'logo' | 'poster' | 'flyer' | 'invitation' | 'business_card' | 'certificate' | 'web_banner' | 'qr_code';

export interface UserProfile {
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  mobile?: string;
  dob?: string;
  plan: SubscriptionTier;
  credits: number;
  revenue: number;
  referralCode: string;
  referralCount: number;
  facebookConnected: boolean;
  githubConnected: boolean;
  twitterConnected: boolean;
  language: 'en' | 'bn' | 'hi' | 'es' | 'ar' | 'fr' | 'ru' | 'ja' | 'zh' | 'pt';
  studentVerificationStatus: VerificationStatus;
  studentIcardUrl?: string | null;
  isApproved: boolean;
  isBlocked?: boolean;
}

export interface Project {
  id: string;
  name: string;
  type: StudioMode;
  thumbnail: string;
  updatedAt: number;
  data: any;
  status: 'draft' | 'published' | 'archived';
  fileSize?: string;
  fileType?: string;
}

export interface SiteConfig {
  maintenanceMode: boolean;
  activeModules: {
    video: boolean;
    photo: boolean;
    paint: boolean;
    ads: boolean;
    office: boolean;
    shop: boolean;
    notebook: boolean;
    vps: boolean;
  };
  globalAnnouncement: string;
  hardenedMode?: boolean;
  version: string;
  changelog: string;
  lastUpdateDate: number;
}

export interface Keyframe {
  time: number;
  value: number | string | any;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'bezier';
}

export interface Bone {
  id: string;
  x: number;
  y: number;
  parentId?: string;
  name: string;
}

export interface TimelineLayer {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'vfx' | 'text' | 'vector' | 'rig';
  start: number;
  duration: number;
  content: string;
  track: number;
  opacity?: number | Keyframe[];
  scale?: number | Keyframe[];
  position?: { x: number, y: number } | Keyframe[];
  rotation?: number | Keyframe[];
  volume?: number;
  blur?: number;
  hue?: number;
  blendingMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'add';
}

export interface NotebookArtifact {
  type: 'audio' | 'video' | 'quiz' | 'flashcards' | 'slides' | 'infographic' | 'mindmap' | 'datatable';
  title: string;
  data: any;
  createdAt: number;
}

export interface MarketplaceProduct {
  id: string;
  sellerEmail: string;
  sellerName: string;
  name: string;
  category: string;
  price: number;
  thumbnail: string;
  type: StudioMode;
  rating: number;
  salesCount: number;
  description: string;
  createdAt: number;
}

export interface Course {
  id: string | number;
  title: string;
  instructor: string;
  avatar: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  rating: number;
  isUgc: boolean;
  price?: number;
}

export interface VPSConfig {
  id: string;
  name: string;
  ip: string;
  username: string;
  password?: string;
  provider: string;
  status: 'online' | 'offline' | 'maintenance' | 'processing';
  hasVideoEngine?: boolean;
  lastChecked: number;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  method: string;
  details: string; // Phone number or banking info
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}
