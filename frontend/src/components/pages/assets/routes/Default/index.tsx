import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import Select from "react-select"
// import Footer from '../components/footer';
import { createGlobalStyle } from "styled-components"
import { APPSYNC_GRAPHQL, PAGES } from "../../../../../app-config"
import { Layout, Seo, Spinner } from "../../../../common"
import { RouteComponentProps } from "@reach/router"
import { API } from "aws-amplify"
import { getListedNfts } from "../../../../../graphql/queries"
import { GetListedNftsOutput, Category, Listing_Type, QueryGetListedNftsArgs, Sorting_Order, GetListedNftsInput } from "../../../../../graphql/types"
import { GraphQLResult } from "@aws-amplify/api-graphql"
import { NFTmeta } from "../../../../../utils/global-types"
import axios, { AxiosError } from "axios"
import NFTCard from "../../../../common/Card"
import { useAppSelector } from "../../../../../redux/store"
import { getCurrentBlockTime } from "../../../../../utils/helper"

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

const options = [
  { value: "All categories", label: "All categories" },
  { value: "Art", label: "Art" },
  { value: "Music", label: "Music" },
  { value: "Domain Names", label: "Domain Names" },
]
const options1 = [
  { value: "Buy Now", label: "Buy Now" },
  { value: "On Auction", label: "On Auction" },
  { value: "Has Offers", label: "Has Offers" },
]
const options2 = [
  { value: "All Items", label: "All Items" },
  { value: "Single Items", label: "Single Items" },
  { value: "Bundles", label: "Bundles" },
]


const Default: FC<RouteComponentProps> = ({ }) => {
  const [loading, setLoading] = useState(false);
  const [Error, setError] = useState<any>();
  const [nftInfo, setNftInfo] = useState<GetListedNftsOutput>({ listedNfts: [], });
  const [nftInput, setNftInput] = useState<GetListedNftsInput>({ pageSize: 12, SortingOrderByTime: Sorting_Order.DESC, });
  const [nftMeta, setNftmeta] = useState<NFTmeta>();
  const observer = useRef<any | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const web3Provider = useAppSelector(s => s.web3.provider);
  const [currentBlockTime, setCurrentBlockTime] = useState(0);


  const loadDataByFilter = async (i: { category?: string, listingType?: string, sortBy?: string }) => {
    const input: GetListedNftsInput = { ...nftInput }
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
    await fetchListedNfts(input, setNftInfo, setLoading, setError, setHasMore)
  }

  const handleLoadData = async () => {
    await fetchListedNfts(nftInput, setNftInfo, setLoading, setError, setHasMore)
  }

  const handleLoadMore = async (after: string[]) => {
    const input: GetListedNftsInput = { ...nftInput, after }
    const setData = (data: GetListedNftsOutput) => {
      setNftInfo(d => ({ ...data, listedNfts: [...d.listedNfts, ...data.listedNfts] }))
    }
    await fetchListedNfts(input, setData, setLoading, setError, setHasMore)
  }

  const lastPostElementRef = useCallback(
    node => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          console.log("pagination condition true", hasMore, nftInfo.after)
          //  setAfter(nftInfo.after)
          if (nftInfo.after && nftInfo.after?.length > 0) {
            handleLoadMore(nftInfo.after)
          }
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore]
  )

  useEffect(() => {
    handleLoadData()
  }, [])

  useEffect(() => {
    web3Provider &&
      getCurrentBlockTime(web3Provider).then(blockTime => setCurrentBlockTime(blockTime));
  }, [web3Provider])

  return (
    <div>
      <Seo title={PAGES.ASSETS.title} />
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
                <h1 className="text-center">Explore</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="items_filter">
              {/* <form className="row form-dark" id="form_quick_search" name="form_quick_search">
                <div className="col">
                  <input className="form-control" id="name_1" name="name_1" placeholder="search item here..." type="text" />
                  <button id="btn-submit">
                    <i className="fa fa-search bg-color-secondary"></i>
                  </button>
                  <div className="clearfix"></div>
                </div>
              </form> */}
              <div className="dropdownSelect one">
                Category:
                <Select
                  styles={customStyles}
                  defaultValue={categoryFilterOptions[0]}
                  options={categoryFilterOptions}
                  onChange={e => loadDataByFilter({ category: e?.value })}
                />
              </div>
              <div className="dropdownSelect two">
                Listing Type:
                <Select
                  styles={customStyles}
                  defaultValue={listingFilterOptions[0]}
                  options={listingFilterOptions}
                  onChange={e => loadDataByFilter({ listingType: e?.value })}
                />
              </div>
              <div className="dropdownSelect three">
                Sort By:
                <Select
                  styles={customStyles}
                  defaultValue={sortFilterOptions[1]}
                  options={sortFilterOptions}
                  onChange={e => loadDataByFilter({ sortBy: e?.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {currentBlockTime && nftInfo.listedNfts.map((data , index) => (
            <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4" key={index} ref={lastPostElementRef}>
              <NFTCard
                data={{ ...data, currentBlockTime }}
              // refrence = {lastPostElementRef}
              />
            </div>
          ))}

          {loading && (
            <span className="flex justify-center space-x-3">
              <Spinner width={25} height={25} color="primary" />
              <p className="font-medium">Fetching NFTs ...</p>
            </span>
          )}
        </div>
      </section>

      <br /><br />
    </div>
  )
}
export default Default


const fetchListedNfts = async (input: GetListedNftsInput, setData: (d: GetListedNftsOutput) => void, setLoading, setError, setHasMore) => {
  setLoading(true)
  setError(null)
  try {
    const { data } = await API.graphql({
      query: getListedNfts,
      variables: { input } as QueryGetListedNftsArgs,
    },
      { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
    ) as GraphQLResult<{ getListedNfts: GetListedNftsOutput }>
    data?.getListedNfts && setData(data.getListedNfts);

    if ((data?.getListedNfts?.after?.length || 0) > 0) { setHasMore(true) }
    else { setHasMore(false) }
    setLoading(false)
  } catch (error) {
    setError(error as any)
    setLoading(false)
    console.log("getListedNfts_Error", error)
  }
}