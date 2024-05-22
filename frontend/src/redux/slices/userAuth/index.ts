import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { useAppSelector } from '../../store';
import { signOut, signedInMetaMask, updateCurrentAuthUser } from './asyncThunks';
import { User, UserAuthData } from '../../../graphql/types';
import { CurrentToken } from '../../../utils/local-storage-handler';
import { uuid } from '../../../utils/helper';

export type AuthState = 'SIGNED_IN' | 'SIGNED_OUT' | 'PENDING';

type StateType = {
  authState: AuthState | null;
  userData: User | null
};

const initialState: StateType = {
  authState: null,
  userData: null,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAllState: (state) => initialState,
  },
  extraReducers: (builder) => {

    builder.addCase(signedInMetaMask.fulfilled, (state, { payload, meta }) => {
      if (!payload) {
        return;
      }
      // console.log("payload", payload);
      state.authState = 'SIGNED_IN';
      state.userData = payload.userData;
      // console.log(new CurrentToken().get().token);
      meta.arg.callback && meta.arg.callback(null, { userData: payload.userData });
    });
    builder.addCase(signedInMetaMask.rejected, (state, { error, meta }) => {
      error = JSON.parse(error?.message || "{}")
      state.authState = 'SIGNED_OUT';
      state.userData = null;
      console.log("signedInMetaMask_Error===>", error);
      // state.signInError = error.message
      meta.arg.callback && meta.arg.callback(error);
      // state.authData = null;
    });

    builder.addCase(updateCurrentAuthUser.fulfilled, (state, { payload, meta: { arg } }) => {
      if (!payload) {
        return;
      }
      const { profileImage , coverImage, username} = payload.userData
      state.authState = 'SIGNED_IN';
      state.userData = payload.userData;
      state.userData.profileImage = profileImage ? `user/${username}/profile?${uuid()}` : profileImage;
      state.userData.coverImage = coverImage ? `user/${username}/cover?${uuid()}` : coverImage;
      console.log(new CurrentToken().get().token);
      arg?.callback && arg.callback(null, { userData: payload.userData })
    });
    builder.addCase(updateCurrentAuthUser.pending, (state, { meta: { arg } }) => {
      if (arg?.authStatePending === true) {
        state.authState = 'PENDING';
      }
    }
    );
    builder.addCase(updateCurrentAuthUser.rejected, (state, { meta: { arg }, error }) => {
      state.authState = 'SIGNED_OUT';
      state.userData = null;
      // console.log("updateCurrentAuthUser_Error", error);
      new CurrentToken().remove();
      arg?.callback && arg.callback(error);
    });


    builder.addCase(signOut.fulfilled, () => {
      new CurrentToken().remove();
      return {
        ...initialState,
        authState: "SIGNED_OUT"
      }
    })

  },
});


export const { clearAllState } = slice.actions;
export { signedInMetaMask, updateCurrentAuthUser, signOut };
export default slice.reducer;

// function handlePending(thunkName: string) {
//   return (state: WritableDraft<StateType>, { meta: { arg } }) => {
  //     state.fetchingStatus[thunkName] = true
  //   }
  // }
  // function handleReject(thunkName: string) {
    //   return (state: WritableDraft<StateType>, { error, meta: { arg } }) => {
      //     const err = JSON.parse(error.message || "{}") as GraphQLResult<any>
      //     console.log(`${thunkName}_Error`, err);
      //     state.error[thunkName] = err.errors ? err.errors[0].message : err;
      //     state.fetchingStatus[thunkName] = false
//     arg.callback && arg.callback(err, null)
//   }
// }

// state.userData = {
//   bio: "",
//   refId: "",
//   coverImage: "",
//   displayName: "Zia Khan",
//   username: "zia-khan",
//   email: "zia@gmail.com",
//   publicAddress: "0x7eC90d13CE5437758F53F1C7c62a352da3D68df0",
//   profileImage: `https://media-exp1.licdn.com/dms/image/C4E03AQEbUWdZxS_8ig/profile-displayphoto-shrink_100_100/0/1638368405154?e=1648684800&v=beta&t=xmWS8_eY5NYWk1u_tUWZQRlKUvbdlGUih3UmvUr2p7I`,
// }