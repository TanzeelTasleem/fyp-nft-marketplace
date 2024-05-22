import { navigate } from "gatsby"
import React, { Component, FC, useEffect, useState } from "react"
// import Footer from '../components/footer';
import { createGlobalStyle } from "styled-components"
import { PAGES } from "../../../../../app-config"
import { useAppSelector } from "../../../../../redux/store"
import { Button, Layout, Seo, Spinner } from "../../../../common"
import { RouteComponentProps } from "@reach/router"
import Clock from "../../../../common/Clock"
import { getBase64 } from "../../../../../utils/helper"
import { Form, Formik } from "formik"
import Input from "../../../../common/Input"
import axios from 'axios';
import { Collection } from '../../../../../graphql/types';
import CreateNFTForm from "./Form"


const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background: #403f83;
    border-bottom: solid 1px #403f83;
  }
  header#myHeader.navbar .search #quick_search{
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  header#myHeader .dropdown-toggle::after{
    color: rgba(255, 255, 255, .5);
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`

const CreateNft: FC<RouteComponentProps> = ({ location }) => {
  const { authState, userData } = useAppSelector(s => s.userAuth);
  const collectionInfo = (location?.state as any)?.collectionInfo as Collection | undefined;

  useEffect(() => {
    if (authState && authState === "SIGNED_OUT") {
      navigate("/");
    }
    else if (!userData?.isAdmin) {
      navigate("/");
    }

  }, [authState, userData])

  if (!authState || authState === "SIGNED_OUT" || authState === "PENDING") {
    return (
      <>
        <Seo title={PAGES.ASSETS.routes.CREATE.title} />
      </>
    )
  }


  return (
    <div>
      <Seo title={PAGES.ASSETS.routes.CREATE.title} />
      <GlobalStyles />
      <section
        className="jumbotron breadcumb no-bg"
        style={{
          backgroundImage: `url(${"https://gigaland.on3-step.com/img/background/subheader.jpg"})`,
        }}
      >
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center">Create </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="col-lg-7 offset-lg-1 mb-5">
          <CreateNFTForm collectionInfo={collectionInfo} />
        </div>
      </section>

      {/* <Footer /> */}
    </div>
  )
}
// }

export default CreateNft
