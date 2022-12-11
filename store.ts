import { configureStore, combineReducers, createSlice } from "@reduxjs/toolkit";
import dayjs from 'dayjs';
import * as _ from 'lodash';

const slice = createSlice({
    name: 'data',
    initialState: {
        // entries: [
        //     ...[...Array(15)].map(() => ({
        //         entryType: 'food',
        //         date: dayjs().subtract(10 * 24 * 60 * Math.random(), 'minute'),
        //         number: 10 * Math.round(10 + 40 * Math.random())
        //     })),
        //     ...[...Array(5)].map(() => ({
        //         entryType: 'active',
        //         date: dayjs().subtract(10 * 24 * 60 * Math.random(), 'minute'),
        //         number: 10 * Math.round(100 * Math.random())
        //     })),
        //     ...[...Array(5)].map(() => ({
        //         entryType: 'weight',
        //         date: dayjs().subtract(10 * 24 * 60 * Math.random(), 'minute'),
        //         number: Math.round(150 + 5 * Math.random(), 1)
        //     }))
        // ]
    },
    reducers: {
        // updateData: (state, action) => {
        //     state = action.payload;
        // },
        // addEntry: (state, action) => {
        //     state.entries.push(action.payload);
        // },
        // removeEntry: (state, action) => {
        //     state.entries = state.entries.filter(e => !_.isEqual(e, action.payload));
        // }
    },
});

// const { updateData, addEntry, removeEntry } = slice.actions;

// const getEntries = state => state.data.entries;

const reducer = combineReducers({
    data: slice.reducer
});

const store = configureStore({
    reducer
});

export { store } //, updateData, addEntry, removeEntry, getEntries };