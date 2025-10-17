import { CharacterProgression } from "./CoreCharacterProgress";
import { Attributes, Currency, DerivedStats, StatusEffect } from "./CoreInterface";
import { InventoryManager } from "./Inventory";
import { StatsCalculator } from "./StatsCalculate";

export class Character {
  id: string;
  name: string;
  level: number;
  experience: number;
  attributes: Attributes;
  derivedStats: DerivedStats;
  statusEffects: StatusEffect[] = [];
  inventory: InventoryManager;
  currency: Currency;

  constructor(
    id: string,
    name: string,
    attributes: Attributes,
    level: number = 1
  ) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.experience = 0;
    this.attributes = attributes;
    this.derivedStats = StatsCalculator.calculateDerivedStats(attributes, level);
    this.inventory = new InventoryManager();
    this.currency = { copper: 0, silver: 0, gold: 0, platinum: 0 };
  }

  gainExperience(amount: number): boolean {
    this.experience += amount;
    const newLevel = CharacterProgression.calculateLevel(this.experience);
    
    if (newLevel > this.level) {
      this.levelUp(newLevel);
      return true;
    }
    return false;
  }

  private levelUp(newLevel: number): void {
    const oldLevel = this.level;
    this.level = newLevel;
    
    // Recalculate derived stats
    const oldStats = { ...this.derivedStats };
    this.derivedStats = StatsCalculator.calculateDerivedStats(this.attributes, newLevel);
    
    // Maintain current HP/MP ratios
    const hpRatio = oldStats.hp / oldStats.maxHp;
    const mpRatio = oldStats.mp / oldStats.maxMp;
    
    this.derivedStats.hp = Math.floor(this.derivedStats.maxHp * hpRatio);
    this.derivedStats.mp = Math.floor(this.derivedStats.maxMp * mpRatio);
  }

  isAlive(): boolean {
    return this.derivedStats.hp > 0;
  }

  takeDamage(amount: number): void {
    this.derivedStats.hp = Math.max(0, this.derivedStats.hp - amount);
  }

  heal(amount: number): void {
    this.derivedStats.hp = Math.min(this.derivedStats.maxHp, this.derivedStats.hp + amount);
  }

  restoreMana(amount: number): void {
    this.derivedStats.mp = Math.min(this.derivedStats.maxMp, this.derivedStats.mp + amount);
  }
}