export const randomNumber = (low: number, high: number): number => {
  return Math.floor(Math.random() * (high - low + 1)) + low;
};

