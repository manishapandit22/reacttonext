import { Attributes, DerivedStats } from "./CoreInterface";

export class StatsCalculator {
  static calculateDerivedStats(attributes: Attributes, level: number): DerivedStats {
    const hp = attributes.constitution * 10 + level * 5;
    const mp = attributes.intelligence * 8 + level * 3;
    
    return {
      hp,
      maxHp: hp,
      mp,
      maxMp: mp,
      actionPoints: 23,
      maxActionPoints: 23,
      defense: Math.floor(attributes.constitution / 2) + Math.floor(attributes.dexterity / 3),
      initiative: attributes.dexterity + Math.floor(attributes.intelligence / 2)
    };
  }

  static validateAttributes(attributes: Attributes): boolean {
    return Object.values(attributes).every(attr => attr >= 8 && attr <= 20);
  }
}