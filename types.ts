import { Dayjs } from 'dayjs';

export type entryType = 'food' | 'weight';

export type timeSeries = { x: Dayjs; y: number }[];
export type daySeries = { x: string; y: number }[];

export interface entry {
  entryType: entryType;
  timestamp: string;
  number: number;
  label?: string;
}

export type settings = Record<string, boolean>;
