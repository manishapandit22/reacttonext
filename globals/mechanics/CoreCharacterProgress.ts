export class CharacterProgression {
  private static readonly BASE_XP = 1000;
  private static readonly XP_EXPONENT = 1.5;

  static calculateRequiredXP(level: number): number {
    return Math.floor(this.BASE_XP * Math.pow(level, this.XP_EXPONENT));
  }

  static getTotalXPForLevel(level: number): number {
    let totalXP = 0;
    for (let i = 1; i <= level; i++) {
      totalXP += this.calculateRequiredXP(i);
    }
    return totalXP;
  }

  static canLevelUp(currentXP: number, currentLevel: number): boolean {
    const requiredXP = this.getTotalXPForLevel(currentLevel + 1);
    return currentXP >= requiredXP;
  }

  static calculateLevel(currentXP: number): number {
    let level = 1;
    while (currentXP >= this.getTotalXPForLevel(level + 1)) {
      level++;
    }
    return level;
  }
}