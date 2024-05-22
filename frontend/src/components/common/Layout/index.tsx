import React, { FC, useEffect, useState } from "react";
// import Footer from "./Footer";
import Navbar from "./Header";
import * as appConfig from "../../../app-config";
import { createGlobalStyle } from 'styled-components';
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { metaMask, coinBase, useEagerConnect, useInactiveListener } from "../../../utils/web3-config";
import { signOut, updateCurrentAuthUser } from "../../../redux/slices/userAuth";
import { loadContract } from "../../../redux/slices/contract";
import { useWeb3React } from "@web3-react/core";
import Spinner from "../Spinner";
import { CurrentConnectedWallet } from "../../../utils/local-storage-handler";
// import { useWeb3React } from '@web3-react/core';
// import { ethers } from 'ethers';

const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: unset;
  }
`;

export const Layout: FC = ({ children }) => {
  const { account, library, activate } = useWeb3React();
  const dispatch = useAppDispatch();
  // const authState = null;
  const authState = useAppSelector(s => s.userAuth.authState);
  const userData = useAppSelector(s => s.userAuth.userData);
  const [chainId, setChainId] = useState<number | null>(null);

  (authState === "PENDING" || authState === null) && console.log("authState", authState)

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();
  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager);

  /* Checking if the user is authenticated or not */
  useEffect(() => {
    if (authState === null) {
      dispatch(updateCurrentAuthUser());
    }
  }, []);

  /* setting contract in redux state */
  useEffect(() => {
    if (library) {
      // console.log("library", library)
      dispatch(loadContract({ signer: library.getSigner(0) }))
    }
  }, [library, authState, account])

  /* checking if the user has changed or disconnect his account it should be logout */
  useEffect(() => {
    if (!userData?.publicAddress || authState === 'PENDING' || !account) {
      return
    }
    if (account?.toLocaleLowerCase() !== userData.publicAddress.toLocaleLowerCase()) {
      console.log("metamask account ===>", account?.toLocaleLowerCase());
      console.log("login user account ===>", userData.publicAddress.toLocaleLowerCase());
      console.log("========= signing out due to account change =========");
      dispatch(signOut())
    }
  }, [account, userData])

  useEffect(() => {
    (async () => {
      const currentConnectedWallet = new CurrentConnectedWallet().get();
      if (authState === "SIGNED_IN" && currentConnectedWallet) {
        if (currentConnectedWallet === "METAMASK") { await activate(metaMask); }
        else if (currentConnectedWallet === "COINBASE") { await activate(coinBase); }
      }
    })()
  }, [authState])

  // const listenChainChangeEvent = () => {
  //   try {
  //     const provider = new ethers.providers.Web3Provider(window?.ethereum, "any");
  //     provider.on("network", (newNetwork, oldNetwork) => {
  //       setChainId(newNetwork.chainId);
  //     });
  //   } catch (error) {
  //     setChainId(null)
  //     // console.log("No web3 object found");
  //   }
  // }

  // /* start listing chain change event */
  // useEffect(() => {
  //   !chainId && listenChainChangeEvent()
  // }, []);

  return (
    <div className="wraper">
      <GlobalStyles />
      <Navbar />
      <br /><br /><br />
      {authState === "PENDING" || authState === null ?
        <div className="flex justify-center items-center h-56" >
          <Spinner color="primary" />
        </div> :
        children
      }
    </div>
  );
};

export default Layout;