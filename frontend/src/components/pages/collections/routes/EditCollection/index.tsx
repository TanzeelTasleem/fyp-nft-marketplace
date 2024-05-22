import React, { FC, useEffect } from "react"
import {  RouteComponentProps } from "@reach/router"
import {  PAGES } from "../../../../../app-config"
import { createGlobalStyle } from "styled-components"
import { Layout, Seo } from "../../../../common"
import UpdateCollectionForm from "./UpdateCollectionForm"
import { useAppSelector } from "../../../../../redux/store"
import { navigate } from "gatsby"

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

const EditCollection: FC<RouteComponentProps> = () => {
  const { authState, userData } = useAppSelector(s => s.userAuth)

  
  useEffect(() => {
    if (authState && authState === "SIGNED_OUT") {
      navigate("/");
    }
    else if (!userData?.isAdmin) {
      navigate("/");
    }

  }, [authState, userData])

  return (
    <div>
      <Seo
        title={PAGES.COLLECTIONS.routes.COLLECTION_DETAIL.routes.EDIT.title}
      />
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
                <h1 className="text-center">Update Collection</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
            <UpdateCollectionForm />
          </div>
        </div>
      </section>
    </div>
  )
}

export default EditCollection
