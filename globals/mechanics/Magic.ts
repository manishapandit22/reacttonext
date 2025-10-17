import { Character } from "./CharacterClass";
import { ActionResult } from "./CoreInterface";

export enum SpellCategory {
  OFFENSIVE = 'offensive',
  DEFENSIVE = 'defensive',
  HEALING = 'healing',
  UTILITY = 'utility',
  BUFF = 'buff',
  DEBUFF = 'debuff'
}

export interface Spell {
  id: string;
  name: string;
  category: SpellCategory;
  manaCost: number;
  cooldown: number;
  currentCooldown: number;
  level: number;
  cast: (caster: Character, target?: Character) => ActionResult;
}

export class MagicSystem {
  private spells: Map<string, Spell> = new Map();
  
  addSpell(spell: Spell): void {
    this.spells.set(spell.id, { ...spell });
  }

  canCastSpell(caster: Character, spellId: string): boolean {
    const spell = this.spells.get(spellId);
    if (!spell) return false;

    return caster.derivedStats.mp >= spell.manaCost && 
           spell.currentCooldown <= 0;
  }

  castSpell(caster: Character, spellId: string, target?: Character): ActionResult {
    const spell = this.spells.get(spellId);
    if (!spell) {
      return { success: false, message: "Spell not found" };
    }

    if (!this.canCastSpell(caster, spellId)) {
      return { success: false, message: "Cannot cast spell - insufficient mana or on cooldown" };
    }

    // Consume mana
    caster.derivedStats.mp -= spell.manaCost;
    
    // Set cooldown
    spell.currentCooldown = spell.cooldown;

    // Execute spell effect
    return spell.cast(caster, target);
  }

  updateCooldowns(): void {
    this.spells.forEach(spell => {
      if (spell.currentCooldown > 0) {
        spell.currentCooldown--;
      }
    });
  }
}