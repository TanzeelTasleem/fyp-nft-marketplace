import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { useParams, RouteComponentProps } from "@reach/router"
import { createGlobalStyle } from "styled-components"
import { API } from "aws-amplify"
import {
  Collection,
  GetCollectionNftsOutput,
  QueryGetCollectionInfoArgs,
  QueryGetCollectionNftsArgs,
} from "../../../../../graphql/types"
import { getCollectionInfo, getCollectionNfts } from "../../../../../graphql/queries"
import { GraphQLResult } from "../../../../../utils/global-types"
import { APPSYNC_GRAPHQL, PAGES, S3_BUCKET } from "../../../../../app-config"
import { useAppSelector } from "../../../../../redux/store"
import { navigate } from "gatsby"
import { uuid } from "../../../../../utils/helper"
import NFTCard from "../../../../common/Card"
import { Spinner } from "../../../../common"

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
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

const CollectionDetail: FC<RouteComponentProps> = ({ }) => {
  const { CollectionId } = useParams()
  const [collectionInfo, setCollectionInfo] = useState<Collection>()
  const [collectionNfts, setCollectionNfts] = useState<GetCollectionNftsOutput>({ nfts: [], after: undefined })
  const { userData } = useAppSelector(s => s.userAuth)
  const [openMenu, setOpenMenu] = React.useState(true)
  const [isError, setIsError] = useState<GraphQLResult<any> | null>()
  const [loading, setLoading] = useState(false)
  const [openMenu1, setOpenMenu1] = React.useState(false)
  const [showMore, setShowMore] = useState(false)

  const handleBtnClick = () => {
    setOpenMenu(!openMenu)
    setOpenMenu1(false)
    document.getElementById("Mainbtn")?.classList.add("active")
    document.getElementById("Mainbtn1")?.classList.remove("active")
    document.getElementById("Mainbtn2")?.classList.remove("active")
  }
  const handleBtnClick1 = () => {
    setOpenMenu1(!openMenu1)
    setOpenMenu(false)
    document.getElementById("Mainbtn1")?.classList.add("active")
    document.getElementById("Mainbtn")?.classList.remove("active")
    document.getElementById("Mainbtn2")?.classList.remove("active")
  }

  const handleBtnClick2 = () => {
    document.getElementById("Mainbtn1")?.classList.remove("active")
    document.getElementById("Mainbtn")?.classList.remove("active")
    document.getElementById("Mainbtn2")?.classList.add("active")
    navigate(
      `${PAGES.COLLECTIONS.path}/${CollectionId}${PAGES.COLLECTIONS.routes.COLLECTION_DETAIL.routes.EDIT.path}`
    )
  }

  const handleMintNFT = () => {
    navigate(PAGES.ASSETS.routes.CREATE.fullpath, { state: { collectionInfo: collectionInfo } })
  }

  const fetchCollectionInfo = async () => {
    setLoading(true)
    try {
      const { data } = (await API.graphql(
        {
          query: getCollectionInfo,
          variables: {
            input: {
              id: CollectionId,
            },
          } as QueryGetCollectionInfoArgs,
        },
        { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
      )) as GraphQLResult<{ getCollectionInfo: Collection }>
      setCollectionInfo(data?.getCollectionInfo)
      setLoading(false)
      return data?.getCollectionInfo
    } catch (error) {
      setIsError(error as any)
      setLoading(false)
      console.log("getCollectionInfo_Error", error)
    }
  }

  useEffect(() => {
    console.log("collection id");

    (async () => {
      const result = await fetchCollectionInfo()
      // if(result?.ref){
      //   await fetchCollectionNFTs(result.ref)
      // }
    })()
  }, [CollectionId])


  return (
    <div>
      <GlobalStyles />
      {isError && !collectionInfo && (
        <h3 className="text-center mt-28">{isError.errors![0].message}</h3>
      )}
      {!isError && (
        <>
          {collectionInfo?.coverImage ? (
            <>
              <img
                src={`${S3_BUCKET.URL}/collection/${collectionInfo?.id}/cover?${uuid()}`}
                className="object-cover bg-gray-200 w-full h-80"
                loading="lazy"
              />
            </>
          ) : (
            <div
              className={
                loading
                  ? "flex justify-center animate-pulse items-center w-full h-80 bg-zinc-200"
                  : "flex justify-center items-center w-full h-80  bg-zinc-200"
              }
            ></div>
          )}
          <section className="container d_coll no-top no-bottom">
            <div className="row">
              <div className="col-md-12">
                <div className="d_profile">
                  <div className="profile_avatar">
                    {collectionInfo?.profileImage ? (
                      <div className="d_profile_img">
                        <img
                          src={`${S3_BUCKET.URL}/collection/${collectionInfo?.id}/profile?${uuid()}`}
                          className="object-cover w-32 h-32 rounded-full top-5 relative bg-gray-100 border-4 border-white"
                          alt="logo Image"
                          loading="lazy"
                        />
                        <i className="fa fa-check"></i>
                      </div>
                    ) : (
                      <div className="d_profile_img">
                        <div
                          className={
                            loading
                              ? "w-32 h-32 relative -top-16 rounded-full bg-zinc-200 border-4 border-white"
                              : "w-32 h-32 relative -top-16 rounded-full bg-zinc-200 border-4 border-white"
                          }
                        />
                      </div>
                    )}

                    <div className="profile_name">
                      <h4>
                        {collectionInfo?.name}
                        <div className="clearfix"></div>
                      </h4>
                    </div>
                    {showMore ? (
                      <p
                        className="text-base font-semibold text-center max-w-3xl text-gray-500 mb-2  inline-block "
                      // style={{ color: "rgb(128, 128, 128)" }}
                      >
                        {collectionInfo?.description}
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
                          className="text-base font-semibold text-gray-500 text-center max-w-xl mb-2 inline-block "
                        // style={{ color: "rgb(128, 128, 128)" }}
                        >
                          {collectionInfo?.description?.substring(0, 200)}
                          {collectionInfo?.description &&
                            collectionInfo?.description.length >= 200 && (
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
                            )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="container no-top   ">
            <div className="row">
              <div className="col-lg-12">
                <div className="items_filter">
                  <ul className="de_nav ">
                    {/* <li id="Mainbtn" className="active">
                      <span onClick={handleBtnClick}>On Sale</span>
                    </li>
                    <li id="Mainbtn1" className="">
                      <span onClick={handleBtnClick1}>Owned</span>
                    </li> */}
                    {userData && userData.isAdmin && (
                      <li id="Mainbtn2" className="">
                        <span onClick={handleBtnClick2}>Edit Collection</span>
                      </li>
                    )}
                    {userData && userData.isAdmin && (
                      <li id="Mainbtn2" className="">
                        <span onClick={handleMintNFT}>Mint NFT</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            <div className="row">

              {
                collectionInfo?.ref && (

                  <CollectionNfts collectionId={CollectionId} collectionRef={collectionInfo?.ref} />
                )
              }
            </div>
            {/* {collectionNfts.nfts.length && (
              <div >
                {collectionNfts?.nfts?.map((data) => (
                  <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
              <NFTCard
                data={{...data}}
                // refrence = {lastPostElementRef}
              />                
              </div>  
                ))}
              </div>
            )} */}
            {/* {
              collectionNfts.nfts.map(({...data }) => (
                    <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                    <NFTCard data={data} />
                    </div>
              ))
            } */}
            {/* {openMenu1 && ( */}
            <>
              {/* {dummyData.map(({ authorLink, bidLink, nftLink, ...data }) => (
                  <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4">
                  <NFTCard data={data} />
                  </div>
                ))} */}

            </>
            {/* )} */}
          </section>

        </>
      )}

      {/* <Footer /> */}
    </div>
  )
}

export default CollectionDetail



const CollectionNfts_: FC<{ collectionId: string, collectionRef: string }> = ({ collectionId, collectionRef }) => {

  const observer = useRef<any | null>(null);
  const [collectionNfts, setCollectionNfts] = useState<GetCollectionNftsOutput>({ nfts: [], after: undefined })
  const [after, setAfter] = useState<string[] | undefined>(undefined)
  const [isMore, setIsMore] = useState(false)
  const [loading, setLoading] = useState(false);
  const [Error, setError] = useState<any>();

  const fetchCollectionNFTs = async (ref: string) => {
    setLoading(true)
    try {
      const { data } = (await API.graphql(
        {
          query: getCollectionNfts,
          variables: {
            input: {
              collectionRef: ref,
              pageSize: 12,
              after: after,
            },
          } as QueryGetCollectionNftsArgs,
        },
        { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
      )) as GraphQLResult<{ getCollectionNfts: GetCollectionNftsOutput }>

      setLoading(false)
      if (data?.getCollectionNfts.nfts.length) {
        console.log("collection nfts ---->", data.getCollectionNfts);
        setCollectionNfts({ ...data.getCollectionNfts, nfts: [...collectionNfts.nfts, ...data?.getCollectionNfts.nfts] })
      }
      if (data?.getCollectionNfts.after?.length) {
        setIsMore(true)
        setAfter(data?.getCollectionNfts.after)
      } else {
        setIsMore(false)
        setAfter(undefined)
      }
    } catch (error) {
      setError(error as any)
      setLoading(false)
      console.log("fetchCollectionNFTs_Error", error)
    }
  }

  const lastPostElementRef = useCallback(
    node => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && isMore) {
          // alert("ismOre")
          // console.log("pagination condition true", isMore)
          //  setAfter(nftInfo.after)
          if (collectionNfts.after && after) {
            fetchCollectionNFTs(collectionRef)
          }
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, isMore, after]
  )


  useEffect(() => {
    (async () => {
      await fetchCollectionNFTs(collectionRef)
    })()
  }, [collectionId])

  return (

    <>
      {
        collectionNfts.nfts.map((data, index) => (
          <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4" ref={lastPostElementRef} key={index} >
            <NFTCard
              data={{ ...data, amount: data.totalSupply }}
            // refrence = {lastPostElementRef}
            />
          </div>
        ))
      }

      {loading ? (
        <span className="flex justify-center space-x-3">
          <Spinner width={20} height={20} color="primary" />
          <p className="font-medium">Fetching Collection NFTs ...</p>
        </span>
      ) : (!collectionNfts.nfts.length) && (
        <span className="flex justify-center space-x-3 ">
          <p className="font-medium">No Nfts ...</p>
        </span>
      )}

    </>

  )
}

const CollectionNfts = React.memo(CollectionNfts_);