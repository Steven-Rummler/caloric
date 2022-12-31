export type entryType = 'food' | 'active' | 'weight';

export type entry = {
    entryType: entryType;
    date: string;
    number: number;
    label?: string
}

export type entryList = entry[];