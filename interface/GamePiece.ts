export interface GamePiece {
  id: string;
  modelPath: string;
  gridPosition: [number, number];
  elevation: number;
  targetPosition: [number, number] | null;
  targetWorldPosition?: [number, number, number] | null; 
  speedFeet?: number;
  isEnemy: boolean;
  speechText: string;
  voiceURI: string | null;
  name?: string;
  class?: string;
  stats?: {
    strength: number;
    defense: number;
    agility: number;
    magic: number;
  };
  abilities?: string[];
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  element?: string;
  health?: number;
  maxHealth?: number;
  mana?: number;
  maxMana?: number;
  onMove?: (fromPos: [number, number], toPos: [number, number]) => void;
}