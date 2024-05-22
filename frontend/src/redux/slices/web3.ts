import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from '../../app-config'

type StateType = {
   // publicAddress: string | null
   chainId: number | null
   // signature: string | null
   // signatureTimeStamp: number | null
   networkError?: string | null
   provider?: ethers.providers.Web3Provider | null
};

const initialState: StateType = {
   chainId: null,
   // publicAddress: null,
   networkError: null,
   provider: null,
}

// const networks = {
//    polygonMumbai: { id: 80001, name: "Polygon Mumbai" },
//    polygon: { id: 137, name: "Polygon" }
// }

const slice = createSlice({
   name: 'web3',
   initialState,
   reducers: {
      loadWeb3Items: (state, { payload: { chainId, provider } }: PayloadAction<StateType>) => {
         let unsupportedChainError = `The network you have selected is not supported. Please change it to `;
         if (chainId && parseInt(chainId.toString()) !== SUPPORTED_CHAINS.id) {
            state.networkError = unsupportedChainError + SUPPORTED_CHAINS.name;
         } else {
            state.networkError = null
         }
         state.chainId = chainId && parseInt(chainId.toString());
         state.provider = provider;

      },

      changeToSupportedNetwork: (state) => {
         console.log("changing network")
         state.provider?.send('wallet_addEthereumChain', [SUPPORTED_CHAINS.walletDetails]);
      }
   },
   extraReducers: (builder) => {

   },
});

export const { loadWeb3Items, changeToSupportedNetwork } = slice.actions;

export default slice.reducer;
