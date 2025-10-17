
export interface BoardTextures {
  baseTexture: any | null; 
  heightTexture: any | null; 
  normalTexture: any | null; 
}

export interface BoardInfo {
  gridSize: number;
  walkableTiles: number;
  totalTiles: number;
}

export interface AssetUrls {
  environment?: string;
  knight?: string;
  tula?: string;
  enemy?: string;
  wolf?: string;
  erika?: string;
}

export interface Character {
  id: string;
  name: string;
  class: string;
  modelPath: string;
  description: string;
  stats: {
    strength: number;
    defense: number;
    agility: number;
    magic: number;
  };
  abilities: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  element: string;
  displayIcon: string;
  isEnemy: boolean;
  speechText: string;
  voiceURI: string | null;
}