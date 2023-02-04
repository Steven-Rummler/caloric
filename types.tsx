export type entryType = 'food' | 'active' | 'weight';

export type series = { x: string; y: number }[];

export interface entry {
  entryType: entryType;
  timestamp: string;
  number: number;
  label?: string;
}

export type entryList = entry[];

export interface settings {
  trackActiveCalories: boolean;
}
