import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Nft, QueryGetNftInfoArgs, GetNftInfoOutput, Listing_Type, GetNftOwnersOutput, GetNftListingsOfSameTokenOutput } from '../../../graphql/types'
import { getNftInfo, getNftListingsOfSameToken, getNftOwners, getListingDetailsOfListingType } from './asyncThunks';
import { WritableDraft } from 'immer/dist/internal';
import { GraphQLResult } from '../../../utils/global-types';
import { SellingDetailsResponse, AuctionDetailsResponse, BiddingDetailsResposne } from '../../../block-chain/contract/Market';


type StateType = {
   info: GetNftInfoOutput['nftInfo'] | null
   listingInfo: GetNftInfoOutput['listingInfo'] | null
   collectionInfo: GetNftInfoOutput['collectionInfo'] | null
   auctionDetails: { bid: BiddingDetailsResposne, auction: AuctionDetailsResponse } | null
   sellingDetails: SellingDetailsResponse | null
   nonListedTokensOwners: Omit<GetNftOwnersOutput, "cursor">
   listedTokensOwners: GetNftListingsOfSameTokenOutput['data']
   fetchingStatus: {
      getNftInfo: boolean;
      getNftListingsOfSameToken: boolean;
      getNftOwners: boolean;
   }
   error: {
      getNftInfo: any;
      getNftListingsOfSameToken: any;
      getNftOwners: any;
   }
};

const initialState: StateType = {
   info: null,
   listingInfo: null,
   collectionInfo: null,
   listedTokensOwners: [],
   auctionDetails: null,
   sellingDetails: null,
   nonListedTokensOwners: { count: 0, data: [] },
   error: {
      getNftInfo: null,
      getNftListingsOfSameToken: null,
      getNftOwners: null,
   },
   fetchingStatus: {
      getNftInfo: false,
      getNftListingsOfSameToken: false,
      getNftOwners: false,
   }
}

const slice = createSlice({
   name: 'nftDetail',
   initialState,
   reducers: {
      clearAllState: (state) => initialState,

   },
   extraReducers: (builder) => {


      builder.addCase(getNftInfo.pending, handlePending("getNftInfo"));
      builder.addCase(getNftInfo.fulfilled, (state, { payload, meta: { arg } }) => {
         if (!payload?.getNftInfo) { return }
         state.fetchingStatus.getNftInfo = false;
         state.error.getNftInfo = null;
         state.info = payload.getNftInfo.nftInfo;
         state.listingInfo = payload.getNftInfo.listingInfo;
         state.collectionInfo = payload.getNftInfo.collectionInfo;
      });
      builder.addCase(getNftInfo.rejected, handleReject("getNftInfo"));


      builder.addCase(getNftOwners.pending, handlePending("getNftOwners"));
      builder.addCase(getNftOwners.fulfilled, (state, { payload, meta: { arg } }) => {
         if (!payload?.getNftOwners) { return }
         state.fetchingStatus.getNftOwners = false;
         state.error.getNftOwners = null;
         // payload.getNftOwners.cursor
         state.nonListedTokensOwners = {
            count: payload.getNftOwners.count,
            data: payload.getNftOwners.cursor ?
               [...state.nonListedTokensOwners.data, ...payload.getNftOwners.data] :
               payload.getNftOwners.data
         };
      });
      builder.addCase(getNftOwners.rejected, handleReject("getNftOwners"));


      builder.addCase(getNftListingsOfSameToken.pending, handlePending("getNftListingsOfSameToken"));
      builder.addCase(getNftListingsOfSameToken.fulfilled, (state, { payload, meta: { arg } }) => {
         if (!payload?.getNftListingsOfSameToken) { return }
         state.fetchingStatus.getNftListingsOfSameToken = false;
         state.error.getNftListingsOfSameToken = null;
         state.listedTokensOwners = payload.getNftListingsOfSameToken.after ?
            [...state.listedTokensOwners, ...payload.getNftListingsOfSameToken.data] :
            payload.getNftListingsOfSameToken.data;
      });
      builder.addCase(getNftListingsOfSameToken.rejected, handleReject("getNftListingsOfSameToken"));


      builder.addCase(getListingDetailsOfListingType.fulfilled, (state, { payload, meta: { arg } }) => {
         // if (!payload) { return }
         if (payload?.auctionDetails) {
            state.auctionDetails = payload?.auctionDetails;
         }
         if (payload?.sellingDetails) {
            state.sellingDetails = payload?.sellingDetails;
         }
      });


   },
});

export const { clearAllState } = slice.actions;
export { getNftInfo, getNftOwners, getNftListingsOfSameToken, };

export default slice.reducer;



function handlePending(thunkName: string) {
   return (state: WritableDraft<StateType>, { meta: { arg } }) => {
      state.fetchingStatus[thunkName] = true;
   };
}

function handleReject(thunkName: string) {
   return (state: WritableDraft<StateType>, { error, meta: { arg } }) => {
      const err = JSON.parse(error.message || '{}') as GraphQLResult<any>;
      console.log(`${thunkName}_Error`, err);
      state.error[thunkName] = err.errors ? err.errors[0].message : err;
      state.fetchingStatus[thunkName] = false;
      arg.callback && arg.callback(err, null);
   };
}
