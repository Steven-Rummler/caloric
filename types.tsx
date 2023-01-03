export type entryType = 'food' | 'active' | 'weight';

export interface entry {
  entryType: entryType;
  timestamp: string;
  number: number;
  label?: string;
}

export type entryList = entry[];
