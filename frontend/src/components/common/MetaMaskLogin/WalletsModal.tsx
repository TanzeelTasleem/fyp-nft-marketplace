import React, { FC, useEffect, useState } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import { useWeb3React } from '@web3-react/core';
import { Link, navigate } from 'gatsby';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { metaMask, coinBase, useEagerConnect } from '../../../utils/web3-config';
import { signedInMetaMask } from '../../../redux/slices/userAuth';
import { Button, Backdrop, Spinner } from '../';
import MetamaskIcon from '../../../img/wallet/1.png';
import CoinbaseIcon from '../../../img/wallet/5.png';
import { WalletType } from '../../../utils/global-types';
import { CurrentConnectedWallet } from '../../../utils/local-storage-handler';


const WalletsModal: FC<{ handleClose: () => void }> = ({ handleClose }) => {
    const [loading, setLoading] = useState(false);
    const [modalInit, setModalInit] = useState(true);
    const [walletType, setWalletType] = useState<WalletType | null>(null);
    const dispatch = useAppDispatch();
    const { connector, library, account, chainId, activate, deactivate, active, error } = useWeb3React();

    // console.log("library", library)

    const installMetamask = () => {
        try {
            const onboarding = typeof window !== 'undefined' && new MetaMaskOnboarding();
            onboarding && onboarding.startOnboarding();
        } catch (err) {
            console.log("installMetamask_ERROR", err);
        }
        setLoading(false);
    };

    const signin = async (address: string, web3Library: any) => {
        try {
            setLoading(true);
            await new Promise((resolve, reject) => {
                dispatch(signedInMetaMask({
                    address, web3: web3Library, callback: (err, data) => {
                        if (err) {
                            reject(err); return
                        }
                        resolve(data || true)

                    },
                })
                );
            })
            // handleClose()
        } catch (err) {
            setLoading(false);
        }
    };

    const handleConnectMetamask = async () => {
        setLoading(true);
        setWalletType("METAMASK")
        try {
            if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
                installMetamask(); return
            }
            if (active && library && account) { await signin(account, library) }
            else { await activate(metaMask); setLoading(false); }
            new CurrentConnectedWallet().set({ wallet: "METAMASK" })
        } catch (err) {
            console.log("handleConnectMetamask_ERROR", err);
            setLoading(false);
        }
    }

    const handleConnectCoinbase = async () => {
        setLoading(true);
        setWalletType("COINBASE")
        try {
            if (active && library && account) { await signin(account, library) }
            else { await activate(coinBase); }
            new CurrentConnectedWallet().set({ wallet: "COINBASE" })
        } catch (err) {
            console.log("handleConnectCoinbase_ERROR", err);
        }
        setLoading(false);
    }

    const buttonContent = [
        { name: "MetaMask Wallet", icon: MetamaskIcon, walletType: "METAMASK" as WalletType, onClick: handleConnectMetamask },
        { name: "Coinbase Wallet", icon: CoinbaseIcon, walletType: "COINBASE" as WalletType, onClick: handleConnectCoinbase },
    ]

    useEffect(() => {
        if (active && library && account && !modalInit) {
            signin(account, library);
        }
        setModalInit(false);
    }, [library]);




    return (
        <div className='w-[450px] bg-color_less p-3' >
            <div className='flex justify-end mb-1 text-2xl' >
                <button><span className='icon_close' onClick={handleClose} /></button>
            </div>
            <div className='space-y-2' >
                {buttonContent.map(({ icon, name, onClick, walletType: _walletType }, idx) => {
                    return <div
                        className="w-full p-2 pt-3 cursor-pointer flex space-x-3 hover:bg-[#00000022]"
                        key={idx}
                        onClick={() => { !loading && onClick() }}
                        style={{ cursor: loading ? "not-allowed" : undefined }}
                    >
                        <span><img src={icon} width={50} /></span>
                        <h4 className='w-full leading-10' >{name}</h4>
                        <span>{loading && walletType === _walletType && <Spinner />}</span>
                    </div>
                })}
            </div>
        </div>
    );

};

export default WalletsModal;
