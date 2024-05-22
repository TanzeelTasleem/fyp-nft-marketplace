import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginMetaMask, signUpMetaMask, getAuthUser, refreshAuthUser, filterMetaMaskUserAuthData, Logout, } from './services';
import { CurrentToken } from '../../../utils/local-storage-handler';
import { User } from '../../../graphql/types';
import { RootStateType } from '../../store';
import { GraphQLResult } from '../../../utils/global-types';

type UpdateCurrentAuthUserProps = {
    authStatePending?: boolean,
    callback?: (err?: any, res?: { userData: Omit<User, '__typename'> }) => void;
};

export const updateCurrentAuthUser = createAsyncThunk(
    'updateCurrentAuthUser/MetaMask',
    async (data: UpdateCurrentAuthUserProps | undefined = { authStatePending: true, }, thunkAPI) => {
        try {
            const { token } = new CurrentToken().get();
            if (!token) {
                throw 'no auth token';
            }
            const newToken = await refreshAuthUser(token);
            new CurrentToken().remove();
            const userAuthData = await getAuthUser(newToken!);
            new CurrentToken().set({
                token: newToken!,
                expiry_date: userAuthData?.authUser.userAuthData.tokenExpiryDate!,
            });
            // const authData = filterMetaMaskUserAuthData({
            //     authData: userAuthData?.authUser!,
            // });
            // return authData;
            return userAuthData?.authUser!

        } catch (err) {
            const error: GraphQLResult<any> = err as any;
            if (!["invalid token", "invalid signature"].includes(error.errors![0].message)) {
                (thunkAPI.getState() as RootStateType).alerts
                    .showDialog("error", "Request Failed", error.errors![0].message)
            }
            throw JSON.stringify(error)
        }
    }
);

type signedInMetaMaskUserProps = {
    address: string;
    web3: any;
    callback?: (err?: any, res?: { userData: Omit<User, '__typename'> }) => void;
};
export const signedInMetaMask = createAsyncThunk(
    'signIn/MetaMask',
    async ({ address, web3, callback }: signedInMetaMaskUserProps, thunkAPI) => {
        try {
            console.log("before signUpMetaMask ::::::::::");
            
            const nonce = await signUpMetaMask(address);
            console.log("nonce::::::::" , nonce);
            const signature = await web3
                .getSigner(address)
                .signMessage(`My App Auth Service Signing nonce: ${nonce}`);

            const token = await loginMetaMask(address, signature);
            console.log("token",token);
            const userAuthData = await getAuthUser(token!);
            new CurrentToken().set({
                token: token!,
                expiry_date: userAuthData?.authUser.userAuthData.tokenExpiryDate!,
            });
            console.log(userAuthData.authUser);

            // return filterMetaMaskUserAuthData({
            //     authData: userAuthData?.authUser!,
            // });
            return userAuthData?.authUser!
        } catch (err) {
            const error: GraphQLResult<any> = err as any;

            if (error.errors && error.errors[0].message.includes("has already signed up")) {
                thunkAPI.dispatch(signedInMetaMask({ address, web3, callback }))
            } else {
                console.log("JSON.stringify :::::::::",JSON.stringify(error));
                (thunkAPI.getState() as RootStateType).alerts
                    .showDialog("error", "Connect Request Failed", error.errors![0].message)
                throw JSON.stringify(error)
            }
        }
    }
);

type signedOutProps = { callback?: (err?: any, res?: string) => void };
export const signOut = createAsyncThunk(
    'query/logout',
    async ({ callback }: signedOutProps | undefined = {}, thunkAPI) => {
        try {
            return await Logout();
        } catch (err) {
            const error: GraphQLResult<any> = err as any;
            (thunkAPI.getState() as RootStateType).alerts
                .showDialog("error", "Sign Out Request Failed", error.errors![0].message)
            throw JSON.stringify(error)
        }
    }
);
