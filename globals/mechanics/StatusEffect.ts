import { Character } from "./CharacterClass";
import { StatusEffect } from "./CoreInterface";

export class StatusEffectsManager {
  static createHasteEffect(duration: number): StatusEffect {
    return {
      id: 'haste',
      name: 'Haste',
      type: 'beneficial',
      duration,
      effect: (character: Character) => {
        character.derivedStats.actionPoints += 5; // Extra actions
      }
    };
  }

  static createRegenerationEffect(duration: number, healAmount: number): StatusEffect {
    return {
      id: 'regeneration',
      name: 'Regeneration',
      type: 'beneficial',
      duration,
      effect: (character: Character) => {
        character.derivedStats.hp = Math.min(
          character.derivedStats.maxHp,
          character.derivedStats.hp + healAmount
        );
      }
    };
  }

  static createPoisonEffect(duration: number, damageAmount: number): StatusEffect {
    return {
      id: 'poison',
      name: 'Poison',
      type: 'detrimental',
      duration,
      effect: (character: Character) => {
        character.derivedStats.hp = Math.max(0, character.derivedStats.hp - damageAmount);
      }
    };
  }

  static createParalysisEffect(duration: number): StatusEffect {
    return {
      id: 'paralysis',
      name: 'Paralysis',
      type: 'detrimental',
      duration,
      effect: (character: Character) => {
        character.derivedStats.actionPoints = 0; // Cannot act
      }
    };
  }

  static applyEffect(character: Character, effect: StatusEffect): void {
    // Remove existing effect of same type
    character.statusEffects = character.statusEffects.filter(e => e.id !== effect.id);
    character.statusEffects.push({ ...effect });
  }

  static removeEffect(character: Character, effectId: string): void {
    character.statusEffects = character.statusEffects.filter(e => e.id !== effectId);
  }
}
