import React from 'react';
import { Provider } from 'react-redux';
import * as config from './app-config';
import { DialogRootWrapper } from './components/common/DialogAndAlerts'
import { Web3ReactProvider } from '@web3-react/core';
import { Amplify } from 'aws-amplify';
import store from './redux/store';
import { CurrentToken } from './utils/local-storage-handler';
import { refreshAuthUser, getAuthUser } from './redux/slices/userAuth/services';
import { getLibrary } from './utils/web3-config';

const getToken = () => {
  const { token } = new CurrentToken().get();
  if (token) {
    return token;
  }
  return null;
};

const getExpiryDate = () => {
  const { expiry_date } = new CurrentToken().get();
  if (expiry_date) {
    return expiry_date;
  }
  return null;
};

export default function ({ element }) {

  Amplify.configure({
    Auth: {
      identityPoolId: 'us-east-1:97c7b2bf-7017-46b6-95ad-d799e6141347', //REQUIRED - Amazon Cognito Identity Pool ID
      region: config.S3_BUCKET.REGION, // REQUIRED - Amazon Cognito Region
      userPoolId: 'us-east-1_t1SN3WV0F', //OPTIONAL - Amazon Cognito User Pool ID
      userPoolWebClientId: '2js58630qom92m05a2916pcq2r', //OPTIONAL - Amazon Cognito Web Client ID
    },
    API: {
      graphql_endpoint: config.APPSYNC_GRAPHQL.ENDPOINT,
      graphql_headers: async (e) => {
        const queryName = e.query.definitions[0].name.value;
        // console.log("e===>", queryName)

        const token = getToken();
        const expiry_date = getExpiryDate();
        const millis = (expiry_date && expiry_date * 1000 - Date.now()) || 0;
        const diff = Math.floor(millis / 60000);

        if (diff && diff <= 20) {
          const newToken = (token && (await refreshAuthUser(token))) || '';
          new CurrentToken().remove();
          const userAuthData = await getAuthUser(newToken);
          new CurrentToken().set({
            token: newToken,
            expiry_date: userAuthData?.authUser.userAuthData.tokenExpiryDate!,
          });
        }

        if (getToken() === null || queryName === 'refreshAccessToken') {
          return {
            /* if token is null use API_KEY instead for authorization */
            'x-api-key': config.APPSYNC_GRAPHQL.API_KEY,
          };
        }

        return {
          /* if token is null use API_KEY instead for authorization */
          Authorization: `bearer ${getToken()}` || undefined,
        };
      },
    },
    Storage: {
      AWSS3: {
        bucket: config.S3_BUCKET.NAME, //REQUIRED -  Amazon S3 bucket
        region: config.S3_BUCKET.REGION, //OPTIONAL -  Amazon service region
      },
    }
  });

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Provider store={store}>
        <DialogRootWrapper>
          {element}
        </DialogRootWrapper>
      </Provider>
    </Web3ReactProvider>
  );
}
