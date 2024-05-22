import React, { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Link, navigate } from 'gatsby';
import MetaMaskOnboarding from '@metamask/onboarding';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
// import { metaMask, coinBase, useEagerConnect } from '../../utils/web3-config';
// import { signedInMetaMask } from '../../redux/slices/userAuth';
import { Button, Backdrop } from '../';
import WalletsModal from './WalletsModal';
// import * as config from '../../app-config';

declare global {
  interface Window {
    ethereum: any;
  }
}

function MetaMaskLogin() {
  const dispatch = useAppDispatch();
  const [openModal, setOpenModal] = useState(false);
  const authState = useAppSelector(s => s.userAuth.authState);
  const { deactivate } = useWeb3React();

  const handleOpenModal = () => { setOpenModal(true) }
  const handleCloseModal = () => { setOpenModal(false) }

  useEffect(() => {
    authState === "SIGNED_OUT" && deactivate();
  }, [authState])

  return (
    <>
      <Button onClick={handleOpenModal} >Connect</Button>

      <Backdrop open={openModal} zIndex={1000} >
        <WalletsModal handleClose={handleCloseModal} />
      </Backdrop>
    </>
  );
}

export default MetaMaskLogin;