import { Currency } from "./CoreInterface";

export class CurrencyManager {
  private static readonly CONVERSION_RATES = {
    copper: 1,
    silver: 10,
    gold: 100,
    platinum: 1000
  };

  static toCopper(currency: Currency): number {
    return currency.copper + 
           (currency.silver * this.CONVERSION_RATES.silver) +
           (currency.gold * this.CONVERSION_RATES.gold) +
           (currency.platinum * this.CONVERSION_RATES.platinum);
  }

  static fromCopper(copperAmount: number): Currency {
    const platinum = Math.floor(copperAmount / this.CONVERSION_RATES.platinum);
    copperAmount %= this.CONVERSION_RATES.platinum;
    
    const gold = Math.floor(copperAmount / this.CONVERSION_RATES.gold);
    copperAmount %= this.CONVERSION_RATES.gold;
    
    const silver = Math.floor(copperAmount / this.CONVERSION_RATES.silver);
    copperAmount %= this.CONVERSION_RATES.silver;
    
    return {
      platinum,
      gold,
      silver,
      copper: copperAmount
    };
  }

  static addCurrency(current: Currency, addition: Currency): Currency {
    const totalCopper = this.toCopper(current) + this.toCopper(addition);
    return this.fromCopper(totalCopper);
  }

  static subtractCurrency(current: Currency, subtraction: Currency): Currency | null {
    const currentCopper = this.toCopper(current);
    const subtractionCopper = this.toCopper(subtraction);
    
    if (currentCopper < subtractionCopper) {
      return null; // Insufficient funds
    }
    
    return this.fromCopper(currentCopper - subtractionCopper);
  }
}