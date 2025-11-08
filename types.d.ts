export type entryType = 'food' | 'weight';

export type timeSeries = { x: string; y: number }[];
export type daySeries = { x: string; y: number }[];

export interface entry {
  entryType: entryType;
  timestamp: string;
  number: number;
  label?: string;
}
