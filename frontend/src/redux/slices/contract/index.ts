import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NftContract } from '../../../block-chain/contract/NFT';
import { MarketContract } from '../../../block-chain/contract/Market';
// import { useAppSelector } from '../store';
// import { ShowDialogCallback } from '../../components/common/DialogAndAlerts';


type StateType = {
    nftContract: NftContract | null
    marketContract: MarketContract | null

};

const initialState: StateType = {
    nftContract: null,
    marketContract: null
}

const slice = createSlice({
    name: 'contract',
    initialState,
    reducers: {
        loadContract: (state, { payload }: PayloadAction<{ signer: any }>) => {
            if (payload.signer) {
                state.nftContract = new NftContract(payload.signer);
                state.marketContract = new MarketContract(payload.signer);
            } else {
                state.nftContract = null;
                state.nftContract = null;
            }
        }
    },
    extraReducers: (builder) => {

    },
});

export const { loadContract } = slice.actions;

export default slice.reducer;
