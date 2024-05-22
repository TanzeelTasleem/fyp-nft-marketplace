import React, { FC, useState, useEffect } from "react";
import { RouteComponentProps } from "@reach/router";
import { createGlobalStyle } from "styled-components";
import { Layout, Seo } from "../../../../common";
import { PAGES } from "../../../../../app-config";
import { useAppSelector } from "../../../../../redux/store";
import { navigate } from "gatsby";
import { GroupBase, InputProps } from "react-select";
import { getBase64 } from "../../../../../utils/helper";
import CreateCollectionForm from './CreateCollectionForm';

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

const CreateCollection: FC<RouteComponentProps> = ({ }) => {
  const [files, setfiles] = useState<{ files: any[] }>({ files: [] })
  const [isActive, setisActive] = useState<boolean>(false)
  const { authState, userData } = useAppSelector(s => s.userAuth)
  const [isAvailableID, setIsAvailableID] = useState<boolean | null | string>(
    null
  )

  const unlockClick = () => {
    setisActive(true)
  }

  const unlockHide = () => {
    setisActive(false)
  }

  const checkUrlAvailable = async (value: string) => {
    return new Promise((resolve, reject) => {
      console.log("from promise")
      if (value === "tanzeel") {
        setTimeout(() => {
          resolve(true)
        }, 1000)
      } else {
        console.log("reject promise condition")
        setTimeout(() => {
          reject(true)
        }, 1000)
      }
    })
  }

  const handleChangeName = async (
    e: React.ChangeEvent<InputProps<unknown, boolean, GroupBase<unknown>>>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    console.log("from handle change name -->")
    if (e.target.name && typeof e.target.value === "string") {
      setFieldValue(e.target.name, e.target.value)
      if (e.target.value.length >= 4) {
        setIsAvailableID("process")
        console.log("inprocess console")
        try {
          const result = await checkUrlAvailable(e.target?.value)
          result && setIsAvailableID(true)
        } catch (error) {
          setIsAvailableID(false)
        }
        // to check given name is available or not
      } else {
        setIsAvailableID(null)
      }
    }
  }

  const handleImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    let img: any
    if (e?.target && e?.target.files) {
      img = await getBase64(e?.target?.files[0])
      console.log("from handle image handler", e.target.name)
      setFieldValue(e.target.name, img)
    }
  }

  useEffect(() => {
    if (authState && authState === "SIGNED_OUT") {
      navigate("/");
    }
    else if (!userData?.isAdmin) {
      console.log(!userData?.isAdmin , "userData ???");
      
      navigate("/");
    }

  }, [authState, userData])

  if (!authState || authState === "SIGNED_OUT" || authState === "PENDING") {
    return (
      <div>
        <Seo title={PAGES.COLLECTIONS.routes.CREATE.title} />
      </div>
    )
  }

  return (
    <div>
      <Seo title={PAGES.COLLECTIONS.routes.CREATE.title} />
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
                <h1 className="text-center">Create Collection</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
            <CreateCollectionForm />
          </div>
        </div>
      </section>
    </div>
  )
}

export default CreateCollection;
