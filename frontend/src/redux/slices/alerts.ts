import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { useAppSelector } from '../store';
import { ShowDialogCallback } from '../../components/common/DialogAndAlerts';

export type AuthState = 'SIGNED_IN' | 'SIGNED_OUT' | 'PENDING';

type StateType = {
    showDialog: ShowDialogCallback

};

const initialState: StateType = {
    showDialog: async (severity, title, message, onResponse) => { return "ok" }
};

const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setDialogHandler: (state, { payload }: PayloadAction<ShowDialogCallback>) => { state.showDialog = payload },
    },
    extraReducers: (builder) => {

    },
});

export const { setDialogHandler } = slice.actions;

export default slice.reducer;
