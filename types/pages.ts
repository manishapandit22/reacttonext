// Page component props types
export interface PageParams {
  params: Promise<{ [key: string]: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Game-related types
export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  character?: string;
  [key: string]: any;
}

export interface GamePageParams {
  params: Promise<{
    gameId: string;
  }>;
}

export interface StoryData {
  id?: string;
  name?: string;
  game_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CharacterData {
  character_id: string;
  name: string;
  description?: string;
  image?: string;
  stats?: CharacterStats;
  [key: string]: any;
}

export interface CharacterStats {
  health?: number;
  maxHealth?: number;
  attack?: number;
  defense?: number;
  [key: string]: any;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  image?: string;
  [key: string]: any;
}

// User and Profile types
export interface UserPageParams {
  params: Promise<{
    userID: string;
  }>;
}

export interface ProfilePageParams {
  params: Promise<{
    userid: string;
  }>;
}

// Blog types
export interface BlogPageParams {
  params: Promise<{
    slug: string;
  }>;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  coverImage?: string;
  tags?: string[];
  [key: string]: any;
}

// Collection types
export interface CollectionPageParams {
  params: Promise<{
    id: string;
  }>;
}

export interface CollectionData {
  id: string;
  name: string;
  description?: string;
  items?: any[];
  owner?: string;
  [key: string]: any;
}

// Item types
export interface ItemPageParams {
  params: Promise<{
    itemID: string;
  }>;
}

export interface ItemData {
  id: string;
  name: string;
  description?: string;
  price?: number;
  image?: string;
  owner?: string;
  [key: string]: any;
}

// World types
export interface WorldPageParams {
  params: Promise<{
    worldID: string;
  }>;
}

export interface WorldData {
  id: string;
  name: string;
  description?: string;
  image?: string;
  creator?: string;
  [key: string]: any;
}

// Character page types
export interface CharacterPageParams {
  params: Promise<{
    characterID: string;
  }>;
}

// Payment status types
export interface PaymentStatusPageParams {
  params: Promise<{
    gameId: string;
  }>;
}

export interface PaymentStatus {
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  amount?: number;
  message?: string;
  [key: string]: any;
}

// Edit page types
export interface EditPageParams {
  params: Promise<{
    gameId: string;
  }>;
}

