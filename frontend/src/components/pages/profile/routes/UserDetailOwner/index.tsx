import React, { FC, useEffect, useState } from "react"
import { RouteComponentProps } from "@reach/router"
import { createGlobalStyle } from "styled-components"
import { useAppSelector } from "../../../../../redux/store"
import { getUserProfile } from "../../../../../graphql/queries"
import { navigate } from "gatsby-link"
import { API } from "aws-amplify"
import { Seo } from "../../../../common"
import { Link } from "gatsby"
import { User } from "../../../../../graphql/types"
import { S3_BUCKET } from "../../../../../app-config"
import { Tab } from '@headlessui/react'
import GetUserCollections from "./GetUserCollections"
import UserListedNfts from "./Tabs/UserListedNfts"
import UserOwnedNfts from "./Tabs/UserOwnedNfts"
// import { Tabs } from "react-bootstrap"
// import GetUserCollections from "./GetUserCollections"

declare global {
  var document: Document
}



const UserDetailOwner: FC<RouteComponentProps> = () => {
  const [isCopied, setIsCopied] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const authState = useAppSelector(s => s.userAuth.authState)
  const userData = useAppSelector(s => s.userAuth.userData)
  const [fetchLoad, setFetchLoad] = useState(true)
  const [data, setData] = useState<User>()

  async function copyTextToClipboard(text: string) {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text)
    } else {
      return (
        document &&
        document !== undefined &&
        document.execCommand("copy", true, text)
      )
    }
  }

  const handleCopyClick = () => {
    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(userData?.publicAddress!)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true)
        setTimeout(() => {
          setIsCopied(false)
        }, 1500)
      })
      .catch(err => {
        console.log(err)
      })
  }


  const fetchDetails = async () => {
    setFetchLoad(true)
    try {
      const getProfile: any = await API.graphql({
        query: getUserProfile,
        variables: { input: { publicAddress: userData?.publicAddress } },
      })
      setData(getProfile.data.getUserProfile)
      console.log("result from get userProfile ---->", getProfile)
      setFetchLoad(false)
    } catch (err) {
      console.log("err", err)
      setFetchLoad(false)
    }
  }


  useEffect(() => {
    if (authState && authState === "SIGNED_OUT") {
      navigate("/");
    }
    ; (async () => {
      await fetchDetails()
    })()
  }, [authState])

  if (!authState || authState === "SIGNED_OUT" || authState === "PENDING") {
    return (
      <div>
        <Seo title="My Profile" />
      </div>
    )
  }

  return (
    <div className="flex max-w-screen-3xl mx-auto flex-col items-center pb-2.5">
      {userData?.coverImage ? (
        <>
          <img
            src={`${S3_BUCKET.URL}/${userData?.coverImage}`}
            className="object-cover bg-gray-200 w-full h-64"
            loading="lazy"
          />
        </>
      ) : (
        <div className="flex justify-center items-center w-full h-64 bg-zinc-200"></div>
      )}
      {userData?.profileImage ? (
        <img src={`${S3_BUCKET.URL}/${userData?.profileImage}`}
          className="object-cover w-32 h-32 absolute top-64 rounded-full bg-gray-200 border-4 border-white"
          loading="lazy"
        >
        </img>
      ) : (
        <div className="w-32 h-32 absolute top-52 rounded-full bg-zinc-200 border-4 border-white"></div>
      )}
      <div className="flex justify-center items-center flex-col mt-20">
        <h1 className="font-sans font-semibold text-3xl capitalize mb-4">
          {userData?.displayName}
        </h1>
        <div
          className="flex justify-center items-center rounded-2xl bg-gray-100 h-5 w-28 cursor-pointer hover:bg-gray-200 mb-3"
          onClick={handleCopyClick}
        >
          <p className="text-xs  m-0" style={{ color: "rgb(128, 128, 128)" }}>
            {isCopied
              ? "Copied!"
              : `${userData?.publicAddress?.substring(
                0,
                6
              )}...${userData?.publicAddress?.substring(
                userData?.publicAddress.length - 4
              )}`}
          </p>
        </div>
        <p className="font-normal text-md mb-4">{userData?.username && `@${userData?.username}`}</p>
        {showMore ? (
          <p
            className="text-xs text-center max-w-md mb-4 whitespace-pre-wrap break-words"
            style={{ color: "rgb(128, 128, 128)" }}
          >
            {userData?.bio}
            <button
              className="no-underline hover:underline inline-block ml-1.5"
              style={{ color: "rgb(0, 102, 255)" }}
              onClick={() => setShowMore(!showMore)}
            >
              Read less
            </button>
          </p>
        ) : (
          <div>
            <p
              className="text-xs text-center max-w-md mb-4 inline-block whitespace-pre-wrap"
              style={{ color: "rgb(128, 128, 128)" }}
            >
              {userData?.bio?.substring(0, 250)}
              {
                userData?.bio && userData?.bio?.length >= 250
                &&
                <>
                  ...
                  <button
                    className="no-underline hover:underline inline-block ml-1.5"
                    style={{ color: "rgb(0, 102, 255)" }}
                    onClick={() => setShowMore(!showMore)}
                  >
                    Read more
                  </button>
                </>
              }
            </p>
          </div>
        )}

        <div className="flex max-w-[220px] p-2 md:mb-2 justify-between space-x-5 w-full items-center">
          <p className="font-bold text-base cursor-pointer text-gray-700 hover:text-black">
            {data?.followersCount}<span className="pl-1 font-medium font-sans">followers</span>
          </p>
          <p className="font-bold text-base cursor-pointer text-gray-700 hover:text-black">
            {data?.followingsCount}<span className="pl-1 font-medium font-sans">followings</span>
          </p>
        </div>

        <div className="flex space-x-5">
          <Link to="/profile/edit-profile">
            <button className="capitalize rounded-full bg-gray-50 w-32 h-9 text-gray-700 hover:text-gray-50 border-[#8364e2] hover:bg-[#8364e2] border-2 p-0.5 font-medium">
              Edit Profile
            </button>
          </Link>

          <button className="capitalize rounded-full text-gray-700 px-1.5 py-1  border-[#8364e2] bg-gray-50 border-2 font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>

          <button className="capitalize rounded-full text-gray-700 p-1  border-[#8364e2] bg-gray-50 border-2 font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </button>
          {/* <button
            className="capitalize rounded-full  w-24 h-9 text-gray-700 hover:text-gray-50 border-[#8364e2] hover:bg-[#8364e2] bg-gray-50 border-2 font-bold"
          >
            unfollow
          </button> */}
        </div>
      </div>
      <Tab.Group>
        <Tab.List className="capitalize border-b-2 border-gray-200 flex w-full p-2 mt-7 px-0 space-x-12 justify-center ">
          <Tab className={({ selected }) =>
            selected ? 'text-black capitalize lg:text-sm md:text-base sm:text-sm text-xs font-sans sm:font-semibold font-bold' : 'capitalize lg:text-sm md:text-base sm:text-sm text-xs font-sans sm:font-semibold font-bold text-gray-400'
          } >
             <span className="md:text-lg sm:text-sm text-xs"> onSale </span> 
            {/* <span>46</span> */}
          </Tab>
          <Tab className={({ selected }) =>
            selected ? 'text-black capitalize font-sans sm:font-semibold font-bold' : 'capitalize lg:text-sm md:text-base sm:text-sm text-xs font-sans sm:font-semibold font-bold text-gray-400'
          } > <span className="md:text-lg sm:text-sm text-xs"> Owned </span> 
          </Tab>

          {/* <Tab className={({ selected }) =>
    selected ? 'text-black capitalize lg:text-sm md:text-base text-sm  font-sans sm:font-semibold font-bold' : 'capitalize lg:text-sm md:text-base sm:text-sm text-xs font-sans sm:font-semibold font-bold text-gray-400'
  } > <span className="md:text-lg sm:text-sm text-xs">NFTS</span> </Tab> */}

        </Tab.List>
        <Tab.Panels className="w-full">

          <Tab.Panel>
            {
              data?.refId && (
                <UserListedNfts refId={data?.refId!} />
              )
            }
          </Tab.Panel>

          <Tab.Panel>
            {
              data?.refId && (
                <UserOwnedNfts refId={data?.refId!} />
              )
            }
          </Tab.Panel>

        </Tab.Panels>
      </Tab.Group>
      
    </div>
  )
}

export default UserDetailOwner


// <div>
//     <Seo title={PAGES.PROFILE.title} />
//     <GlobalStyles />
//     <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{ backgroundColor: "lightgray", backgroundImage: `url("${coverImage}")` }}>
//         <div className='mainbreadcumb'>
//         </div>
//     </section>

//     <section className='container d_coll no-top no-bottom'>
//         <div className='row'>
//             <div className="col-md-12">
//                 <div className="d_profile">
//                     <div className="profile_avatar">
//                         {
//                             userData?.profileImage
//                                 ?
//                                 <div className="d_profile_img">
//                                     <img src={`${S3_BUCKET.URL}/${userData?.profileImage}`} alt="" />
//                                     {/* <i className="fa fa-check"></i> */}
//                                 </div>
//                                 :
//                                 <div className="d_profile_img" style={{ width: "150px", backgroundColor: `slate-grey` }}>
//                                     <img src={userData?.profileImage} alt="" />
//                                     {/* <i className="fa fa-check"></i> */}
//                                 </div>
//                         }
//                         <div className="profile_name">
//                             <h4>
//                                 {"Abstraction"}
//                                 <div className="clearfix"></div>
//                                 {userData?.publicAddress &&
//                                     <span id="wallet" className="profile_wallet">{userData?.publicAddress}</span>
//                                 }
//                                 <button id="btn_copy" title="Copy Text" onClick={() => { navigator?.clipboard.writeText(userData?.publicAddress || "") }} >Copy</button>
//                             </h4>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </section>

//     <section className='container no-top'>
//         <div className='row'>
//             <div className='col-lg-12'>
//                 <div className="items_filter">
//                     <ul className="de_nav">
//                         <li id='Mainbtn' className="active"><span onClick={handleBtnClick}>On Sale</span></li>
//                         <li id='Mainbtn1' className=""><span onClick={handleBtnClick1}>Owned</span></li>
//                     </ul>
//                 </div>
//             </div>
//         </div>
//         {/* {openMenu && (
//             <div id='zero1' className='onStep fadeIn'>
//                 <ColumnNewRedux shuffle showLoadMore={false} authorId={hotCollections.author ? hotCollections.author.id : 1} />
//             </div>
//         )}
//         {openMenu1 && (
//             <div id='zero2' className='onStep fadeIn'>
//                 <ColumnNewRedux shuffle showLoadMore={false} />
//             </div>
//         )} */}
//     </section>
//     {/* <Footer /> */}
// </div>
