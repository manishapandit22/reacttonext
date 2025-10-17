import { Character } from "./CharacterClass";
import { ActionEconomyManager } from "./CoreActionEconomy";
import { Action, ActionResult } from "./CoreInterface";

export enum CombatPhase {
  INITIATIVE = 'initiative',
  ACTION = 'action',
  RESOLUTION = 'resolution',
  STATUS = 'status',
  END = 'end'
}

export class CombatManager {
  private participants: Character[] = [];
  private turnOrder: Character[] = [];
  private currentPhase: CombatPhase = CombatPhase.INITIATIVE;
  private currentTurnIndex: number = 0;

  addParticipant(character: Character): void {
    this.participants.push(character);
  }

  initiateCombat(): void {
    this.currentPhase = CombatPhase.INITIATIVE;
    this.determineTurnOrder();
    this.currentTurnIndex = 0;
  }

  private determineTurnOrder(): void {
    this.turnOrder = [...this.participants].sort((a, b) => 
      b.derivedStats.initiative - a.derivedStats.initiative
    );
  }

  getCurrentCharacter(): Character | null {
    if (this.currentTurnIndex < this.turnOrder.length) {
      return this.turnOrder[this.currentTurnIndex];
    }
    return null;
  }

  executeAction(action: Action, actor: Character, target?: Character): ActionResult {
    this.currentPhase = CombatPhase.ACTION;
    
    if (!ActionEconomyManager.canPerformAction(actor, action.type)) {
      return {
        success: false,
        message: `Insufficient action points for ${action.name}`
      };
    }

    this.currentPhase = CombatPhase.RESOLUTION;
    const result = action.execute(actor, target);
    
    if (result.success) {
      ActionEconomyManager.consumeActionPoints(actor, action.type);
    }

    this.applyStatusEffects();
    this.endTurnCleanup();
    
    return result;
  }

  private applyStatusEffects(): void {
    this.currentPhase = CombatPhase.STATUS;
    this.participants.forEach(character => {
      character.statusEffects.forEach((effect, index) => {
        effect.effect(character);
        effect.duration--;
        
        if (effect.duration <= 0) {
          if (effect.onExpire) {
            effect.onExpire(character);
          }
          character.statusEffects.splice(index, 1);
        }
      });
    });
  }

  private endTurnCleanup(): void {
    this.currentPhase = CombatPhase.END;
    this.currentTurnIndex++;
    
    if (this.currentTurnIndex >= this.turnOrder.length) {
      this.currentTurnIndex = 0;
      // New round - reset action points
      this.participants.forEach(character => {
        ActionEconomyManager.resetActionPoints(character);
      });
    }
  }

  calculateDamage(baseDamage: number, attributeModifier: number, multipliers: number, targetDefense: number): number {
    const finalDamage = (baseDamage + attributeModifier) * multipliers - targetDefense;
    return Math.max(0, Math.floor(finalDamage));
  }

  calculateCriticalHit(damage: number): number {
    return Math.floor(damage * 1.52);
  }
}

