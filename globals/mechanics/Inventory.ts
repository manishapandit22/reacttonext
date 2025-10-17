import { InventorySlot, Item, ItemType } from "./CoreInterface";

export class InventoryManager {
  private slots: (InventorySlot | null)[];
  private maxWeight: number;
  private equippedItems: Map<ItemType, Item> = new Map();
  private hotbar: (Item | null)[] = new Array(10).fill(null);

  constructor(slotCount: number = 30, maxWeight: number = 100) {
    this.slots = new Array(slotCount).fill(null);
    this.maxWeight = maxWeight;
  }

  addItem(item: Item, quantity: number = 1): boolean {
    const totalWeight = this.getCurrentWeight() + (item.weight * quantity);
    if (totalWeight > this.maxWeight) {
      return false; // Too heavy
    }

    if (item.stackable) {
      return this.addStackableItem(item, quantity);
    } else {
      return this.addNonStackableItem(item, quantity);
    }
  }

  private addStackableItem(item: Item, quantity: number): boolean {
    // Find existing stack
    for (let slot of this.slots) {
      if (slot && slot.item.id === item.id) {
        const maxStack = item.maxStack || 99;
        const canAdd = Math.min(quantity, maxStack - slot.quantity);
        slot.quantity += canAdd;
        quantity -= canAdd;
        
        if (quantity <= 0) return true;
      }
    }

    // Create new stacks if needed
    while (quantity > 0) {
      const emptySlot = this.slots.findIndex(slot => slot === null);
      if (emptySlot === -1) return false; // No empty slots

      const maxStack = item.maxStack || 99;
      const stackSize = Math.min(quantity, maxStack);
      
      this.slots[emptySlot] = {
        item: { ...item },
        quantity: stackSize
      };
      
      quantity -= stackSize;
    }

    return true;
  }

  private addNonStackableItem(item: Item, quantity: number): boolean {
    for (let i = 0; i < quantity; i++) {
      const emptySlot = this.slots.findIndex(slot => slot === null);
      if (emptySlot === -1) return false; // No empty slots

      this.slots[emptySlot] = {
        item: { ...item },
        quantity: 1
      };
    }

    return true;
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    let remainingToRemove = quantity;

    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      if (slot && slot.item.id === itemId) {
        const removeFromSlot = Math.min(remainingToRemove, slot.quantity);
        slot.quantity -= removeFromSlot;
        remainingToRemove -= removeFromSlot;

        if (slot.quantity <= 0) {
          this.slots[i] = null;
        }

        if (remainingToRemove <= 0) return true;
      }
    }

    return remainingToRemove === 0;
  }

  getCurrentWeight(): number {
    return this.slots.reduce((weight, slot) => {
      if (slot) {
        return weight + (slot.item.weight * slot.quantity);
      }
      return weight;
    }, 0);
  }

  equipItem(item: Item): boolean {
    if (item.type === ItemType.WEAPON || 
        item.type === ItemType.ARMOR || 
        item.type === ItemType.ACCESSORY) {
      
      const currentEquipped = this.equippedItems.get(item.type);
      if (currentEquipped) {
        this.addItem(currentEquipped); // Return to inventory
      }
      
      this.equippedItems.set(item.type, item);
      this.removeItem(item.id, 1);
      return true;
    }
    return false;
  }

  getEquippedItems(): Map<ItemType, Item> {
    return new Map(this.equippedItems);
  }

  addToHotbar(item: Item, slotIndex: number): boolean {
    if (slotIndex >= 0 && slotIndex < this.hotbar.length) {
      this.hotbar[slotIndex] = item;
      return true;
    }
    return false;
  }
}