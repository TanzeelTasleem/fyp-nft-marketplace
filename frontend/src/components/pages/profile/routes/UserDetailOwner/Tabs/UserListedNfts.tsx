import { GraphQLResult } from '@aws-amplify/api-graphql'
import { API } from 'aws-amplify'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { APPSYNC_GRAPHQL } from '../../../../../../app-config'
import { getUserListedNfts, getUsersNfts } from '../../../../../../graphql/queries'
import { Category, GetUserListedNftsInput, GetUserListedNftsOutput, Listing_Type, NftListing, QueryGetUserListedNftsArgs, Sorting_Order, Sort_By } from '../../../../../../graphql/types'
import { useAppSelector } from '../../../../../../redux/store'
import { Spinner } from '../../../../../common'
import Select from "react-select"
import { createGlobalStyle } from 'styled-components'
import NFTCard from '../../../../../common/Card'

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
    color: rgba(255, 255, 255, .5);;
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

const customStyles = {
  option: (base, state) => ({
    ...base,
    background: "#fff",
    color: "#333",
    borderRadius: state.isFocused ? "0" : 0,
    "&:hover": {
      background: "#eee",
    },
  }),
  menu: base => ({
    ...base,
    borderRadius: 0,
    marginTop: 0,
  }),
  menuList: base => ({
    ...base,
    padding: 0,
  }),
  control: (base, state) => ({
    ...base,
    padding: 2,
  }),
}

const categoryFilterOptions = Object.values(Category).map((v) => (
  { value: v.toString(), label: v[0].toUpperCase() + v.slice(1).toLowerCase() }
))
categoryFilterOptions.unshift({ label: "All", value: "all" });

const listingFilterOptions = Object.values(Listing_Type).map((v) => (
  { value: v.toString(), label: v[0].toUpperCase() + v.slice(1).toLowerCase() }
))
listingFilterOptions.unshift({ label: "All", value: "all" });

const sortFilterOptions = Object.values(Sorting_Order).map((v) => (
  { value: v.toString(), label: v[0].toUpperCase() + v.slice(1).toLowerCase() }
))

const UserListedNfts: FC<{ refId: string }> = ({ refId }) => {
  const { userData } = useAppSelector(s => s.userAuth);
  const [loading, setLoading] = useState(false);
  const observer = useRef<any | null>(null);
  const [isError, setIsError] = useState<any>();
  const [after, setAfter] = useState<string[] | undefined>(undefined)
  const [listedNfts, setlistedNfts] = useState<NftListing[]>([]);
  const [nftInput, setNftInput] = useState<GetUserListedNftsInput>({ pageSize: 2, SortingOrderByTime: Sorting_Order.DESC , publicAddress:""});
  const [hasMore, setHasMore] = useState(false);

  const loadDataByFilter = async (i: { category?: string, listingType?: string, sortBy?: string }) => {
    const input: GetUserListedNftsInput = { ...nftInput }
    if (i.category) {
      if (categoryFilterOptions[0].value === i.category) { input.category = undefined }
      else { input.category = [i.category as any] }
    }
    if (i.listingType) {
      if (listingFilterOptions[0].value === i.listingType) { input.listingType = undefined }
      else { input.listingType = i.listingType as any }
    }
    if (i.sortBy) { input.SortingOrderByTime = i.sortBy as any }
    setNftInput(input);
    setHasMore(false);
    setAfter(undefined);
    console.log("input ::::" , input);
    await fetchUserListedNfts({...input , after:undefined});
    // await fetchListedNfts(input, setNftInfo, setLoading, setError, setHasMore)
  }

  const lastPostElementRef = useCallback(
    node => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          // console.log("pagination condition true", hasMore, nftInfo.after)
          //  setAfter(nftInfo.after)
          if (after?.length) {
            // fetchUserListedNfts(nftInput , true)
            // alert("hello world")
          }
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore]
  )


  const fetchUserListedNfts = async (inputsArgs:GetUserListedNftsInput , loadMore:boolean = false) => {
    setLoading(true);
    try {
      const {publicAddress , ...inputs} = inputsArgs
      const { data } = await API.graphql({
        query: getUserListedNfts,
        variables: {
          input: {
            ...inputs,
            publicAddress:userData?.publicAddress,
          }
        } as QueryGetUserListedNftsArgs
      },
        { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
      ) as GraphQLResult<{ getUserListedNfts: GetUserListedNftsOutput }>
      if(data?.getUserListedNfts.listedNfts.length){
        if(loadMore){
          setlistedNfts([...listedNfts,...data?.getUserListedNfts.listedNfts])
        }else{
          setlistedNfts(data?.getUserListedNfts.listedNfts)
        }
      }else{
        setlistedNfts([]);
      }
      if(data?.getUserListedNfts.after?.length){
        setHasMore(true)
        setAfter(data?.getUserListedNfts.after)
      }else{
        setHasMore(false)
        setAfter(undefined)
      }
      setLoading(false)
      console.log("getUserListedNfts ::::", data?.getUserListedNfts)
    } catch (error) {
      setIsError(error as any);
      setLoading(false);
      console.log("getUserListedNfts_Error", error);
    }
  }

  useEffect(() => {
    fetchUserListedNfts(nftInput)
  }, [userData?.publicAddress])

  return (
    <>
          <GlobalStyles />
          <section className="container pt-5 mx-auto m-0 p-0">
          <div className="row">
          <div className="col-lg-12">
            <div className="items_filter flex justify-evenly w-full flex-wrap">
              {/* <form className="row form-dark" id="form_quick_search" name="form_quick_search">
                <div className="col">
                  <input className="form-control" id="name_1" name="name_1" placeholder="search item here..." type="text" />
                  <button id="btn-submit">
                    <i className="fa fa-search bg-color-secondary"></i>
                  </button>
                  <div className="clearfix"></div>
                </div>
              </form> */}
              <div className="dropdownSelect one " >
                Category:
                <Select
                  className="lg:w-72 "
                  styles={customStyles}
                  defaultValue={categoryFilterOptions[0]}
                  options={categoryFilterOptions}
                  onChange={e => loadDataByFilter({ category: e?.value })}
                />
              </div>
              <div className="dropdownSelect two" >
                Listing Type:
                <Select
                  styles={customStyles}
                  className="lg:w-72 "
                  defaultValue={listingFilterOptions[0]}
                  options={listingFilterOptions}
                  onChange={e => loadDataByFilter({ listingType: e?.value })}
                />
              </div>
              <div className="dropdownSelect three" >
                Sort By:
                <Select
                  className="lg:w-72 "
                  styles={customStyles}
                  defaultValue={sortFilterOptions[1]}
                  options={sortFilterOptions}
                  onChange={e => loadDataByFilter({ sortBy: e?.value })}
                />
              </div>
            </div>
          </div>
        </div>
        </section>

      {loading ? (
        <span className="flex justify-center space-x-3">
          <Spinner width={20} height={20} color="primary" />
          <p className="font-medium">Fetching User Listed NFTs ...</p>
        </span>
      ) : (!listedNfts.length) && (
        <span className="flex justify-center space-x-3 h-24">
          <p className="font-medium">No listed Nfts ...</p>
        </span>
      )}

      {listedNfts.length && (
        <div className=" row mx-auto max-w-7xl ">
          {
            [...listedNfts ].map((nft , index)=>(
              <div className='d-item col-lg-3 col-md-4 col-sm-6 col-xs-12 mb-4 '>
                <NFTCard data={nft}  />
              </div>
            ))
          }
      </div>
      )
      }

    </>
  )
}

export default UserListedNfts