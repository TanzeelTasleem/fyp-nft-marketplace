import React, { FC, useEffect, useState } from "react"
import { RouteComponentProps } from "@reach/router"
import { createGlobalStyle } from "styled-components"
import { useProfileParams } from "../"
import { useAppSelector } from "../../../../redux/store"
import { API } from "aws-amplify"
import { getUserProfile } from "../../../../graphql/queries"
import {
  FollowUserInput,
  QueryGetUserProfileArgs,
  User,
  UserShow,
} from "../../../../graphql/types"
import { utils } from "ethers"
import { GraphQLResult } from "../../../../utils/global-types"
import { uuid } from "../../../../utils/helper"
import { Link } from "gatsby"
import { followUser } from "../../../../graphql/mutations"
import { Spinner } from "react-bootstrap"
import { S3_BUCKET } from '../../../../app-config'

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: black;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #111;
    }
    .item-dropdown .dropdown a{
      color: #111 !important;
    }
  }
`

declare global {
  var document: Document
}

const UserDetail: FC<RouteComponentProps> = () => {
  const [openMenu1, setOpenMenu1] = useState(true)
  const [openMenu, setOpenMenu] = useState(true)
  const { username } = useProfileParams()
  const [isCopied, setIsCopied] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [fLoad, setFLoad] = useState(false)
  const [isFollow, setIsFollow] = useState(false)
  let { data: userInfo, error, loading } = useFetchUserDetails(username)
  const userData = useAppSelector(s => s.userAuth.userData)
  const showDialog = useAppSelector(s => s.alerts.showDialog)

  // if (_userData?.username === username || _userData?.publicAddress === username) {
  //     userData = _userData
  // }

  useEffect(() => {
    userInfo?.followed ? setIsFollow(true) : setIsFollow(false)
  }, [userInfo, userData])

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
    copyTextToClipboard(userInfo?.publicAddress!)
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

  const handleFollow = async () => {
    setFLoad(true)
    try {
      const result = await API.graphql({
        query: followUser,
        variables: {
          input: {
            publicAddress: userInfo?.publicAddress,
          },
        },
      }) as GraphQLResult<{ followUser: string }>
      setFLoad(false);
      isFollow ? setIsFollow(false) : setIsFollow(true)
    } catch (err) {
      const error: any = err as any
      console.log("error from follow catch --->", err)
      setFLoad(false)
      showDialog("error", "Error in following a user", error.errors[0].message)
    }
  }

  const handleBtnClick = () => {
    setOpenMenu(!openMenu)
    setOpenMenu1(false)
    document.getElementById("Mainbtn")?.classList.add("active")
    document.getElementById("Mainbtn1")?.classList.remove("active")
  }
  const handleBtnClick1 = () => {
    setOpenMenu1(!openMenu1)
    setOpenMenu(false)
    document.getElementById("Mainbtn1")?.classList.add("active")
    document.getElementById("Mainbtn")?.classList.remove("active")
  }

  if (loading || (!loading && !userInfo && !error)) {
    return (
      <div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <h3 style={{ textAlign: "center" }}>Fetching user details ......</h3>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <h3 style={{ textAlign: "center" }}>{error.errors![0].message}</h3>
      </div>
    )
  }

  return (
    <div className="flex max-w-screen-3xl mx-auto flex-col items-center pb-2.5">
      {userInfo?.coverImage ? (
        <>
          <img
            src={`${S3_BUCKET.URL}/${userInfo?.coverImage}?${uuid()}`}
            className="object-cover bg-gray-200 w-full h-64"
            loading="lazy"
          />
        </>
      ) : (
        <div className="flex justify-center items-center w-full h-72 bg-zinc-200"></div>
      )}
      {userInfo?.profileImage ? (
        <img
          src={`${S3_BUCKET.URL}/${userInfo?.profileImage}?${uuid()}`}
          className="object-cover w-32 h-32 absolute top-64 rounded-full bg-zinc-200 border-4 border-white"
          loading="lazy"
        ></img>
      ) : (
        // <img src={`${S3_BUCKET.URL}/${userData?.profileImage}?${uuid()}`} className="object-cover  w-32 h-32 absolute top-64 rounded-full bg-gray-200 border-4 border-white"></img>
        <div className="w-32 h-32 absolute top-64 rounded-full bg-zinc-200 border-4 border-white"></div>
      )}
      <div className="flex justify-center items-center flex-col mt-20">
        <h1 className="font-sans font-semibold text-3xl capitalize mb-4">
          {userInfo?.displayName}
        </h1>
        <div
          className="flex justify-center items-center rounded-2xl bg-gray-100 h-5 w-28 cursor-pointer hover:bg-gray-200 mb-3"
          onClick={handleCopyClick}
        >
          <p className="text-xs  m-0" style={{ color: "rgb(128, 128, 128)" }}>
            {isCopied
              ? "Copied!"
              : `${userInfo?.publicAddress?.substring(
                0,
                6
              )}...${userInfo?.publicAddress?.substr(
                userInfo?.publicAddress.length - 4
              )}`}
          </p>
        </div>
        <p className="font-normal text-md mb-4">@{userInfo?.username}</p>
        {showMore ? (
          <p
            className="text-xs text-center max-w-md mb-4 whitespace-pre-wrap break-words"
            style={{ color: "rgb(128, 128, 128)" }}
          >
            {userInfo?.bio}
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
              {userInfo?.bio?.substring(0, 250)}
              {
                userInfo?.bio && userInfo?.bio?.length >= 250
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
            {userInfo?.followersCount}
            <span className="pl-1 font-medium font-sans">followers</span>
          </p>
          <p className="font-bold text-base cursor-pointer text-gray-700 hover:text-black">
            {userInfo?.followingsCount}
            <span className="pl-1 font-medium font-sans">followings</span>
          </p>
        </div>

        <div className="flex space-x-5">
          {
            userData &&
            (userInfo?.publicAddress == userData?.publicAddress ? (
              <Link to="/profile/edit-profile">
                <button className="capitalize rounded-full bg-zinc-50 w-32 h-9 text-gray-700 hover:text-gray-50 border-[#8364e2] hover:bg-[#8364e2] border-2 p-0.5 font-medium">
                  Edit Profile
                </button>
              </Link>
            ) : (
              <button
                disabled={fLoad ? true : false}
                onClick={handleFollow}
                className="capitalize space-x-2 rounded-full w-24 h-9 text-gray-700 hover:text-gray-50 border-[#8364e2] hover:bg-[#8364e2] bg-gray-50 border-2 font-bold"
              >
                {isFollow ? "unfollow" : "Follow"}
                {fLoad && <Spinner animation="grow" size="sm" />}
              </button>
            ))
          }

          <button className="capitalize rounded-full text-gray-700 px-1.5 py-1  border-[#8364e2] bg-gray-50 border-2 font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
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
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
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
    </div>
  )
}

export default UserDetail

const useFetchUserDetails = (userId: string) => {
  const [state, setState] = useState<{
    error: GraphQLResult<any> | null
    data: UserShow | null
    loading: boolean
  }>({ error: null, data: null, loading: false })
  // const [error, setError] = useState<GraphQLResult<any> | null>(null);
  const authState = useAppSelector(s => s.userAuth.authState)
  // const [loading, setLoading] = useState(false);
  // const [data, setData] = useState<User | null>(null);

  const loadData = async (userId: string) => {
    const username = !utils.isAddress(userId) ? userId : undefined
    const publicAddress = utils.isAddress(userId) ? userId : undefined
    setState(e => ({ ...e, loading: true }))
    try {
      const { data } = (await API.graphql({
        query: getUserProfile,
        variables: {
          input: { username, publicAddress },
        } as QueryGetUserProfileArgs,
      })) as GraphQLResult<{ getUserProfile: UserShow }>
      // setData(data?.getUserProfile!); setError(null);
      setState(e => ({
        ...e,
        loading: false,
        data: data?.getUserProfile!,
        error: null,
      }))
    } catch (error) {
      console.log("fetchUserDetails_Error", error)
      setState(e => ({ ...e, loading: false, data: null, error: error as any }))
      // setError(error as any); setData(null)
    }
    // setLoading(false)
  }

  useEffect(() => {
    authState && authState !== "PENDING" && loadData(userId)
  }, [userId, authState])

  // return { data, loading, error }
  return state
}

// <div>
//             <GlobalStyles />
//             {/* <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{ backgroundImage: `url("http://134.209.110.122:1337/uploads/author_banner_1d2c434cf5.jpg")` }}> */}
//             <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{ backgroundColor: "lightgray", backgroundImage: `url("${coverImage}")` }}>
//                 <div className='mainbreadcumb'>
//                 </div>
//             </section>

//             <section className='container d_coll no-top no-bottom'>
//                 <div className='row'>
//                     <div className="col-md-12">
//                         <div className="d_profile">
//                             <div className="profile_avatar">
//                                 <div className="d_profile_img">
//                                     <img src={`${S3_BUCKET.URL}/${userInfo?.profileImage}`} alt="" />
//                                     <i className="fa fa-check"></i>
//                                 </div>
//                                 <div className="profile_name">
//                                     <h4>
//                                         {"Abstraction"}
//                                         <div className="clearfix"></div>
//                                         {userInfo?.publicAddress &&
//                                             <span id="wallet" className="profile_wallet">{userInfo?.publicAddress}</span>
//                                         }
//                                         <button id="btn_copy" title="Copy Text">Copy</button>
//                                     </h4>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             <section className='container no-top'>
//                 <div className='row'>
//                     <div className='col-lg-12'>
//                         <div className="items_filter">
//                             <ul className="de_nav">
//                                 <li id='Mainbtn' className="active"><span onClick={handleBtnClick}>On Sale</span></li>
//                                 <li id='Mainbtn1' className=""><span onClick={handleBtnClick1}>Owned</span></li>
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//                 {/* {openMenu && (
//                     <div id='zero1' className='onStep fadeIn'>
//                         <ColumnNewRedux shuffle showLoadMore={false} authorId={hotCollections.author ? hotCollections.author.id : 1} />
//                     </div>
//                 )}
//                 {openMenu1 && (
//                     <div id='zero2' className='onStep fadeIn'>
//                         <ColumnNewRedux shuffle showLoadMore={false} />
//                     </div>
//                 )} */}
//             </section>
//             {/* <Footer /> */}
//         </div>
