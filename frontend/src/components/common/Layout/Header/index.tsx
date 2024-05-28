import React, { useEffect, useState, HTMLAttributes, FC } from "react";
import { BreakpointProvider, setDefaultBreakpoints, Breakpoint } from "react-socks";
//import { header } from 'react-bootstrap';
import Link, { navigate } from 'gatsby-link';
import useOnclickOutside from "react-cool-onclickoutside";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import { changeToSupportedNetwork, loadWeb3Items } from "../../../../redux/slices/web3";
import { signOut } from "../../../../redux/slices/userAuth";
// import auth from '../../../core/auth';
import { PAGES, S3_BUCKET, SUPPORTED_CHAINS } from '../../../../app-config';
// import { navigate } from '@reach/router';
import MetaMaskLogin from "../../MetaMaskLogin";
// import { uuid } from "../../../../utils/helper";
// import Logo from "../../../img/logo.png";
// import Logo2 from "../../../img/logo-2.png";
// import Logo3 from "../../../img/logo-3.png";
// import LogoLight from "../../../img/logo-light.png";
import { Button } from '../../';
// import styled from "styled-components";
import * as s from "./style";
import { useWeb3React } from "@web3-react/core";
import { ethers } from 'ethers';

declare global {
  var document: Document;
}

// const Breakpoint: any = _Breakpoint;

setDefaultBreakpoints([
  { xs: 0 },
  { l: 1199 },
  { xl: 1200 }
]);


const Header: FC<HTMLAttributes<HTMLHeadElement>> = ({ className = "" }) => {
  const [chainId, setChainId] = useState<number | null>(null);
  const { networkError } = useAppSelector(s => s.web3);
  const dispatch = useAppDispatch();
  // let unsupportedChainError = `The network you have selected is not supported. Please change it to `

  // if (SUPPORTED_CHAINS.length === 1) {
  //   unsupportedChainError = unsupportedChainError + `${SUPPORTED_CHAINS[0].name}.`;
  // } else if (SUPPORTED_CHAINS.length === 2) {
  //   unsupportedChainError = unsupportedChainError + `${SUPPORTED_CHAINS[0].name} or ${SUPPORTED_CHAINS[1].name}.`;
  // } else if (SUPPORTED_CHAINS.length > 2) {
  //   unsupportedChainError = unsupportedChainError +
  //     `${SUPPORTED_CHAINS.slice(0, -1).map(v => v.name).join(", ")} or ${SUPPORTED_CHAINS.slice(-1)[0].name}`;
  // }

  const handleChangeNetwork = () => {
    dispatch(changeToSupportedNetwork())
  }

  const listenChainChangeEvent = () => {
    try {
      const provider = new ethers.providers.Web3Provider(window?.ethereum, "any");
      provider.on("network", (newNetwork, oldNetwork) => {
        // setChainId(newNetwork.chainId);
        dispatch(loadWeb3Items({ chainId: newNetwork.chainId, provider }))
      });
    } catch (error) {
      setChainId(null)
      // console.log("No web3 object found");
    }
  }

  /* start listing chain change event */
  useEffect(() => {
    !chainId && listenChainChangeEvent()
  }, []);


  return (
    <>
      <s.Container id="myHeader" >
        {networkError &&
          <p className="text-red-600 text-center md:text-lg text-sm p-1 font-sans bg-slate-200" >
            {networkError} <button className="border-2 p-1 m-1 border-black text-black text-sm" onClick={handleChangeNetwork} >Change Network</button>
          </p>
        }
        <div>
          <LeftNav />
          <RightNav />
        </div>
      </s.Container>
    </>
  );
}
export default Header;

const LeftNav: FC = ({ }) => {

  return (
    <div className="py-[8px]" >
      <Link to='/'  ><h2 className="col-white">Logo here</h2></Link>
    </div>
  )
}

const RightNav: FC = ({ }) => {
  const authState = useAppSelector(s => s.userAuth.authState);
  const userData = useAppSelector(s => s.userAuth.userData);
  const [showpop, btn_icon_pop] = useState(false);
  const dispatch = useAppDispatch();
  const { deactivate } = useWeb3React();
  // const { } = useWeb3React();

  const handleLogout = () => {
    deactivate()
    dispatch(signOut())
  }
  const refpop = useOnclickOutside(() => {
    closePop();
  });
  const closePop = () => {
    btn_icon_pop(false);
  };


  return (
    <div>
      {authState === "SIGNED_OUT" && <MetaMaskLogin />}

      <s.ProfileMenu style={{ display: authState === "SIGNED_IN" ? undefined : "none" }}>

        {/* <Button onClick={() => { navigate(PAGES.ASSETS.routes.CREATE.fullpath) }} >Create</Button> */}
        <NavBarItem
          title={<>{"Explore"} <span className="arrow_carrot-down" /> </>}
          link={PAGES.ASSETS.path}
          listItems={[
            { link: PAGES.COLLECTIONS.path, title: "Collection" },
            { link: PAGES.ASSETS.path, title: "NFT" },
          ]} />

        {userData?.isAdmin &&
          <NavBarItem title={<>{"Create"} <span className="arrow_carrot-down" /> </>} listItems={[
            { link: PAGES.COLLECTIONS.routes.CREATE.fullpath, title: "Collection" },
            { link: PAGES.ASSETS.routes.CREATE.fullpath, title: "NFT" },
          ]} />}

        <div id="de-click-menu-profile" className="de-menu-profile" onClick={() => btn_icon_pop(!showpop)} ref={refpop}>

          {userData?.profileImage ?
            <img src={`${S3_BUCKET.URL}/${userData?.profileImage}`} alt="hero-image" /> :
            <i className="fa fa-user" style={{ backgroundColor: "lightgray", padding: '11px 12px', borderRadius: "50%" }} />}

          {showpop &&
            <div className="popshow">
              {
                userData?.displayName &&
                <div className="d-name">
                  <h4>Welcome {userData?.displayName}</h4>
                </div>
              }
              {/* <div className="d-balance">
                <h4>Balance</h4>
                12.858 ETH
              </div> */}
              <div className="d-wallet">
                <h4>My Wallet</h4>
                <span id="wallet" className="d-wallet-address">{userData?.publicAddress}</span>
                <button onClick={() => { navigator.clipboard.writeText(userData?.publicAddress || "") }} id="btn_copy" title="Copy Text">Copy</button>
              </div>
              <div className="d-line"></div>
              <ul className="de-submenu-profile">
                <li >
                  <span onClick={() => { navigate(PAGES.PROFILE.path) }} >
                    <i className="fa fa-user"></i> My profile
                  </span>
                </li>
                <li>
                  <span onClick={() => { navigate(`${PAGES.PROFILE.path}${PAGES.PROFILE.routes.EDIT_PROFILE.path}`) }}>
                    <i className="fa fa-pencil"></i> Edit profile
                  </span>
                </li>
                <li onClick={handleLogout}>
                  <span>
                    <i className="fa fa-sign-out"></i> Sign out
                  </span>
                </li>
              </ul>
            </div>
          }

        </div>
      </s.ProfileMenu>
    </div>
  )
}




interface NavBarItemProps {
  title: React.ReactNode;
  link?: string;
  listItems?: {
    title: string;
    link: string;
  }[]
}
export const NavBarItem: FC<NavBarItemProps> = ({ title, link, listItems }) => {
  return (
    <div className="navbar-item group flex flex-col" >
      <span onClick={e => { link && navigate(link) }} >{title}</span>
      <span className='lines'></span>
      <div className={`item-dropdown group-hover:flex hover:flex hidden`}>
        <div className="dropdown">
          {listItems?.map(({ title, link }, idx) => {
            return <Link className="block" to={link} key={idx} >{title}</Link>
          })
          }
        </div>
      </div>
    </div>
  )
}