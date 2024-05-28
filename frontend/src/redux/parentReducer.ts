import { combineReducers } from '@reduxjs/toolkit';
import userAuthReducer from './slices/userAuth';
import alertsReducer from './slices/alerts';
import contractReducer from './slices/contract';
import web3Reducer from './slices/web3';
import nftDetailReducer from './slices/nftDetail';

const parentReducer = combineReducers({
  userAuth: userAuthReducer,
  alerts: alertsReducer,
  contract: contractReducer,
  web3: web3Reducer,
  nftDetail: nftDetailReducer,
});

export default parentReducer;
