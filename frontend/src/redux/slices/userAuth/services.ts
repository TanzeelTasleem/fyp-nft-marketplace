import { API, Auth } from 'aws-amplify';
import axios from 'axios';
import { findUser, authUser } from "../../../graphql/queries";
import { signup, authenticate, refreshAccessToken } from "../../../graphql/mutations";
import { AuthUserOutput, MutationRefreshAccessTokenArgs } from '../../../graphql/types';
import { GraphQLResult } from '../../../utils/global-types';

export const getAuthUser = async (token: string) => {

  const auth = await API.graphql({
    query: authUser,
    authMode: "AWS_LAMBDA",
    authToken: `Bearer ${token}`
  }) as GraphQLResult<{ authUser: AuthUserOutput }>
  return auth.data!;
  // return filterMetaMaskUserAuthData({ authData: auth.data?.authorizeUser! })
};

export const refreshAuthUser = async (token: string) => {
  const authen: any = await API.graphql({
    query: refreshAccessToken,
    variables: {accessToken: token} as MutationRefreshAccessTokenArgs,
  })
  return authen?.data?.refreshAccessToken;
};

export const signUpMetaMask = async (address: string) => {
  try {
    const find: any = await API.graphql({
      query: findUser,
      variables: { address },
    })

    return find?.data?.findUser?.nonce;
  } catch (err) {
    const sign: any = await API.graphql({
      query: signup,
      variables: { address },
    })

    return sign?.data.signup.nonce;
  }
};

export const loginMetaMask = async (address: string, signature: string) => {
  const logins: any = await API.graphql({
    query: authenticate,
    variables: { address, signature },
  })
  return logins.data.authenticate;
};

export const filterMetaMaskUserAuthData = ({ authData, }: { authData: any; }) => ({
  id: authData.payload?.username,
  authData: { publicAddress: authData.payload?.publicAddress },
  // firstName: authData.payload?.firstName,
  username: authData.payload?.username,
  email: authData.payload?.email,
  // emailVerified: authData.payload.emailVerified,    
});

export const Logout = async () => {
  return "log out"
}
  // (await API.graphql({
  //   query: logout,
  // })) as GraphQLResult<LogoutQuery>;
