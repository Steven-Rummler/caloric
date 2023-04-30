import { Dayjs } from 'dayjs';

export type entryType = 'food' | 'active' | 'weight';

export type timeSeries = { x: Dayjs; y: number }[];
export type daySeries = { x: string; y: number }[];

export interface entry {
  entryType: entryType;
  timestamp: string;
  number: number;
  label?: string;
}

export interface settings {
  trackActiveCalories: boolean;
}
