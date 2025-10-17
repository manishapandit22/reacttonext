import { Character } from "./CharacterClass";
import { ActionType } from "./CoreInterface";

export class ActionEconomyManager {
  private static readonly ACTION_COSTS: Record<ActionType, number> = {
    [ActionType.ATTACK]: 2,
    [ActionType.DEFEND]: 12,
    [ActionType.MOVE]: 1, // per space
    [ActionType.UTILITY]: 1,
    [ActionType.SPELL]: 2 // base cost, can vary by spell
  };

  static getActionCost(actionType: ActionType, modifier: number = 1): number {
    return this.ACTION_COSTS[actionType] * modifier;
  }

  static canPerformAction(character: Character, actionType: ActionType, modifier: number = 1): boolean {
    const cost = this.getActionCost(actionType, modifier);
    return character.derivedStats.actionPoints >= cost;
  }

  static consumeActionPoints(character: Character, actionType: ActionType, modifier: number = 1): boolean {
    const cost = this.getActionCost(actionType, modifier);
    if (this.canPerformAction(character, actionType, modifier)) {
      character.derivedStats.actionPoints -= cost;
      return true;
    }
    return false;
  }

  static resetActionPoints(character: Character): void {
    character.derivedStats.actionPoints = character.derivedStats.maxActionPoints;
  }
}