import React, { FC, useEffect, useState } from "react";
import { Button, Seo } from "../../../../common";
import { createGlobalStyle } from "styled-components";
import Clock from "../../../../common/Clock";
import { RouteComponentProps, useParams } from '@reach/router';
import { S3_BUCKET, APPSYNC_GRAPHQL } from "../../../../../app-config"
import { Nft, QueryGetNftInfoArgs } from "../../../../../graphql/types";
import { getNftInfo } from "../../../../../graphql/queries"
import { API } from "aws-amplify";
import { GraphQLResult, NFTmeta } from "../../../../../utils/global-types";
import { uuid } from "../../../../../utils/helper";
import axios, { AxiosError } from "axios";
import { useAssetsParams } from "../..";
import { navigate } from "gatsby";
import { useAppSelector } from "../../../../../redux/store";

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
    border-bottom: solid 1px #dddddd;
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

const ItemDetail: FC<RouteComponentProps> = ({ location }) => {
    const userData = useAppSelector(s => s.userAuth.userData);
    const [openMenu, setOpenMenu] = useState(true);
    const [openMenu1, setOpenMenu1] = useState(false);
    const [loading, setLoading] = useState(false);
    const windowState = (location?.state as { nftInfo: Nft, nftMeta: NFTmeta } | undefined);
    // console.log("windowState", windowState?.nftInfo, windowState?.nftMeta);
    const [nftInfo, setNftInfo] = useState<Nft | undefined>(windowState?.nftInfo);
    const [nftMeta, setNftmeta] = useState<NFTmeta | undefined>(windowState?.nftMeta);
    // const nftContract = useAppSelector(s => s.contract.nftContract);
    const [isError, setIsError] = useState<GraphQLResult<any> | null>();
    const { assetId } = useAssetsParams();
    // console.log("assetId", assetId);

    const handleBtnClickHistory = () => {
        setOpenMenu(!openMenu)
        setOpenMenu1(false)
        document.getElementById("Mainbtn")?.classList.add("active")
        document.getElementById("Mainbtn1")?.classList.remove("active")
    }

    const handleBtnClickBids = () => {
        setOpenMenu1(!openMenu1)
        setOpenMenu(false)
        document.getElementById("Mainbtn1")?.classList.add("active")
        document.getElementById("Mainbtn")?.classList.remove("active")
    }

    const fetchNftInfo = async () => {
        setLoading(true)
        try {
            let data: { getNftInfo: Nft; } | undefined = undefined;
            if (!nftInfo) {
                data = (await API.graphql({
                    query: getNftInfo,
                    variables: { input: { tokenId: assetId }, } as QueryGetNftInfoArgs,
                },
                    { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
                ) as GraphQLResult<{ getNftInfo: Nft }>).data
                setNftInfo(data?.getNftInfo);
            }
            if (!nftMeta) {
                await fetchNftmetaFromIPFS(data?.getNftInfo.tokenUri || nftInfo?.tokenUri!);
            }
            setIsError(null)
            setLoading(false)
        } catch (error) {
            setIsError(error as any)
            setLoading(false)
            console.log("getCollectionInfo_Error", error)
        }
    }

    const fetchNftmetaFromIPFS = async (cid: string) => {
        try {
            // const { data } = await axios.get<NFTmeta>(`https://gateway.pinata.cloud/ipfs/${cid.replace("ipfs://", "")}`);
            const { data } = await axios.get<NFTmeta>(`https://gateway.moralisipfs.com/ipfs/${cid.replace("ipfs://", "")}`);
            setNftmeta(data);
        } catch (err) {
            const error: AxiosError = err as any;
            console.log("fetchNftmetaFromIPFS_Error", error.response?.data);
        }
    }

    useEffect(() => {
        fetchNftInfo();
    }, [assetId])

    if (!loading && isError?.errors) {
        return <div>
            <br /><br /><br /><br /><br />
            <h2 className="text-center" >{isError.errors[0].message}</h2>
        </div>
    }

    return (
        <div>
            <Seo title={"Asset Detail"} />
            <GlobalStyles />
            <section className="container pt-5">
                <div className="row pt-md-1">
                    <div className="col-md-6 text-center">
                        {nftInfo && <img
                            src={`${S3_BUCKET.URL}/${nftInfo?.imageUrl}`}
                            // src="https://gigaland.on3-step.com/img/items/big-1.jpg"
                            className="img-fluid img-rounded mb-sm-30"
                            alt={nftMeta?.name}
                            title={nftMeta?.name}
                        />}
                    </div>
                    <div className="col-md-6">
                        <div className="item_info">
                            {/* Auctions ends in
                            <div className="de_countdown">
                                <Clock deadline="December, 30, 2021" />
                            </div> */}
                            {nftMeta && <h2 aria-label="asset-title" >#{nftInfo?.tokenId} - {nftMeta?.name}</h2>}
                            {/* <div className="item_info_counts">
                                <div className="item_info_type">
                                    <i className="fa fa-image"></i>Art
                                </div>
                                <div className="item_info_views">
                                    <i className="fa fa-eye"></i>250
                                </div>
                                <div className="item_info_like">
                                    <i className="fa fa-heart"></i>18
                                </div>
                            </div> */}
                            <p className="my-2" ><b>Supply:</b> {nftInfo?.totalSupply}</p>

                            {userData?.isAdmin &&
                                <Button onClick={() => navigate("./list", { state: { nftInfo, nftMeta } })}>List NFT</Button>}

                            {/* <div className="spacer-30"></div> */}
                            <hr className="bg-black my-3 border-2 border-black" />

                            <div>
                                <h3 className="mb-0" >Description</h3>
                                <p>{nftMeta?.description}</p>
                            </div>
                            {/* <h6>Creator</h6>
                            <div className="item_author">
                                <div className="author_list_pp">
                                    <span>
                                        <img
                                            className="lazy"
                                            src="https://gigaland.on3-step.com/img/author/author-1.jpg"
                                            alt=""
                                        />
                                        <i className="fa fa-check"></i>
                                    </span>
                                </div>
                                <div className="author_list_info">
                                    <span>Monica Lucas</span>
                                </div>
                            </div> */}
                            <div className="de_tab">
                                {/* <ul className="de_nav">
                                    <li id="Mainbtn" className="active">
                                        <span onClick={handleBtnClickBids}>Bids</span>
                                    </li>
                                    <li id="Mainbtn1" className="">
                                        <span onClick={handleBtnClickHistory}>History</span>
                                    </li>
                                    <li className="Mainbtn2" >
                                        <span onClick={() => navigate("./list")}>List NFT</span>
                                    </li>
                                </ul> */}

                                <div className="de_tab_content">
                                    {/* {openMenu && (
                                        <div className="tab-1 onStep fadeIn">
                                            <div className="p_list">
                                                <div className="p_list_pp">
                                                    <span>
                                                        <img
                                                            className="lazy"
                                                            src="https://gigaland.on3-step.com/img/author/author-1.jpg"
                                                            alt=""
                                                        />
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                                </div>
                                                <div className="p_list_info">
                                                    Bid accepted <b>0.005 ETH</b>
                                                    <span>
                                                        by <b>Monica Lucas</b> at 6/15/2021, 3:20 AM
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p_list">
                                                <div className="p_list_pp">
                                                    <span>
                                                        <img
                                                            className="lazy"
                                                            src="https://gigaland.on3-step.com/img/author/author-2.jpg"
                                                            alt=""
                                                        />
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                                </div>
                                                <div className="p_list_info">
                                                    Bid <b>0.005 ETH</b>
                                                    <span>
                                                        by <b>Mamie Barnett</b> at 6/14/2021, 5:40 AM
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p_list">
                                                <div className="p_list_pp">
                                                    <span>
                                                        <img
                                                            className="lazy"
                                                            src="https://gigaland.on3-step.com/img/author/author-3.jpg"
                                                            alt=""
                                                        />
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                                </div>
                                                <div className="p_list_info">
                                                    Bid <b>0.004 ETH</b>
                                                    <span>
                                                        by <b>Nicholas Daniels</b> at 6/13/2021, 5:03 AM
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p_list">
                                                <div className="p_list_pp">
                                                    <span>
                                                        <img
                                                            className="lazy"
                                                            src="https://gigaland.on3-step.com/img/author/author-4.jpg"
                                                            alt=""
                                                        />
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                                </div>
                                                <div className="p_list_info">
                                                    Bid <b>0.003 ETH</b>
                                                    <span>
                                                        by <b>Lori Hart</b> at 6/12/2021, 12:57 AM
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )} */}

                                    {/* {openMenu1 && (
                                        <div className="tab-2 onStep fadeIn">
                                            <div className="p_list">
                                                <div className="p_list_pp">
                                                    <span>
                                                        <img
                                                            className="lazy"
                                                            src="https://gigaland.on3-step.com/img/author/author-5.jpg"
                                                            alt=""
                                                        />
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                                </div>
                                                <div className="p_list_info">
                                                    Bid <b>0.005 ETH</b>
                                                    <span>
                                                        by <b>Jimmy Wright</b> at 6/14/2021, 6:40 AM
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p_list">
                                                <div className="p_list_pp">
                                                    <span>
                                                        <img
                                                            className="lazy"
                                                            src="https://gigaland.on3-step.com/img/author/author-1.jpg"
                                                            alt=""
                                                        />
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                                </div>
                                                <div className="p_list_info">
                                                    Bid accepted <b>0.005 ETH</b>
                                                    <span>
                                                        by <b>Monica Lucas</b> at 6/15/2021, 3:20 AM
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p_list">
                                                <div className="p_list_pp">
                                                    <span>
                                                        <img
                                                            className="lazy"
                                                            src="https://gigaland.on3-step.com/img/author/author-2.jpg"
                                                            alt=""
                                                        />
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                                </div>
                                                <div className="p_list_info">
                                                    Bid <b>0.005 ETH</b>
                                                    <span>
                                                        by <b>Mamie Barnett</b> at 6/14/2021, 5:40 AM
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p_list">
                                                <div className="p_list_pp">
                                                    <span>
                                                        <img
                                                            className="lazy"
                                                            src="https://gigaland.on3-step.com/img/author/author-3.jpg"
                                                            alt=""
                                                        />
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                                </div>
                                                <div className="p_list_info">
                                                    Bid <b>0.004 ETH</b>
                                                    <span>
                                                        by <b>Nicholas Daniels</b> at 6/13/2021, 5:03 AM
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p_list">
                                                <div className="p_list_pp">
                                                    <span>
                                                        <img
                                                            className="lazy"
                                                            src="https://gigaland.on3-step.com/img/author/author-4.jpg"
                                                            alt=""
                                                        />
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                                </div>
                                                <div className="p_list_info">
                                                    Bid <b>0.003 ETH</b>
                                                    <span>
                                                        by <b>Lori Hart</b> at 6/12/2021, 12:57 AM
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )} */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ItemDetail;
