
export interface Attributes {
  strength: number;
  dexterity: number;
  intelligence: number;
  constitution: number;
  wisdom: number;
  charisma: number;
}

export interface DerivedStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  actionPoints: number;
  maxActionPoints: number;
  defense: number;
  initiative: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  type: 'beneficial' | 'detrimental';
  duration: number;
  effect: (character: Character) => void;
  onExpire?: (character: Character) => void;
}

export enum ActionType {
  ATTACK = 'attack',
  DEFEND = 'defend',
  MOVE = 'move',
  UTILITY = 'utility',
  SPELL = 'spell'
}

export interface Action {
  id: string;
  name: string;
  type: ActionType;
  apCost: number;
  execute: (actor: Character, target?: Character) => ActionResult;
}

export interface ActionResult {
  success: boolean;
  damage?: number;
  effects?: StatusEffect[];
  message: string;
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material'
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  weight: number;
  value: number;
  stackable: boolean;
  maxStack?: number;
  effects?: StatusEffect[];
}

export interface InventorySlot {
  item: Item;
  quantity: number;
}

export interface Currency {
  copper: number;
  silver: number;
  gold: number;
  platinum: number;
}