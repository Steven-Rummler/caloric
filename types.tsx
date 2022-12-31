export type entryType = 'food' | 'active' | 'weight';

export interface entry {
  entryType: entryType;
  date: string;
  number: number;
  label?: string;
}

export type entryList = entry[];
