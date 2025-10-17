import { Character } from "./CharacterClass";
import { Action, ActionResult, ActionType, Attributes, Item, ItemType } from "./CoreInterface";
import { StatsCalculator } from "./StatsCalculate";

export class RPGFactory {
  static createHumanCharacter(name: string, attributeDistribution: Partial<Attributes> = {}): Character {
    const defaultAttributes: Attributes = {
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      constitution: 10,
      wisdom: 10,
      charisma: 10,
      ...attributeDistribution
    };

    if (!StatsCalculator.validateAttributes(defaultAttributes)) {
      throw new Error("Invalid attribute values. Must be between 8 and 20.");
    }

    return new Character(`char_${Date.now()}`, name, defaultAttributes);
  }

  static createBasicWeapon(): Item {
    return {
      id: 'sword_basic',
      name: 'Basic Sword',
      type: ItemType.WEAPON,
      weight: 3,
      value: 50,
      stackable: false
    };
  }

  static createHealthPotion(): Item {
    return {
      id: 'potion_health',
      name: 'Health Potion',
      type: ItemType.CONSUMABLE,
      weight: 0.5,
      value: 25,
      stackable: true,
      maxStack: 10
    };
  }

  static createBasicAttackAction(): Action {
    return {
      id: 'attack_basic',
      name: 'Basic Attack',
      type: ActionType.ATTACK,
      apCost: 2,
      execute: (actor: Character, target?: Character): ActionResult => {
        if (!target) {
          return { success: false, message: "No target specified" };
        }

        const baseDamage = 10;
        const attributeModifier = Math.floor(actor.attributes.strength / 2);
        const isCritical = Math.random() < 0.1; // 10% crit chance
        
        let damage = baseDamage + attributeModifier - Math.floor(target.derivedStats.defense / 2);
        
        if (isCritical) {
          damage = Math.floor(damage * 1.52);
        }

        damage = Math.max(1, damage);
        target.takeDamage(damage);

        return {
          success: true,
          damage,
          message: `${actor.name} attacks ${target.name} for ${damage} damage${isCritical ? ' (Critical Hit!)' : ''}`
        };
      }
    };
  }
}
