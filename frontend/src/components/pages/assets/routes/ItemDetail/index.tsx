import React, { FC, useEffect, useState } from "react";
import { Button, Seo } from "../../../../common";
import { createGlobalStyle } from "styled-components";
import Clock from "../../../../common/Clock";
import { RouteComponentProps, useParams } from '@reach/router';
import { S3_BUCKET, APPSYNC_GRAPHQL } from "../../../../../app-config"
import { Nft, QueryGetNftInfoArgs, GetNftInfoOutput, Listing_Type, GetNftOwnersOutput, GetNftListingsOfSameTokenOutput } from "../../../../../graphql/types";
// import { getNftInfo } from "../../../../../graphql/queries";
import { API } from "aws-amplify";
import { GraphQLResult, NFTmeta } from "../../../../../utils/global-types";
import { getCurrentBlockTime, uuid } from "../../../../../utils/helper";
import axios, { AxiosError } from "axios";
import { useAssetsParams } from "../..";
import { navigate } from "gatsby";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { BuyNft, PlaceBidModal } from '../../components'
import { ethers } from "ethers";
import { getNftInfo, getNftListingsOfSameToken, clearAllState } from "../../../../../redux/slices/nftDetail";
import CountDown from '../../components/CountDown';

enum TabsEnum {
    Owners = "Owners",
    Details = "Details",
    History = "History",
}

const ItemDetail: FC<RouteComponentProps> = ({ location }) => {
    const { assetId } = useAssetsParams();
    const userData = useAppSelector(s => s.userAuth.userData);
    const { marketContract, nftContract } = useAppSelector(s => s.contract);
    const { error, fetchingStatus, collectionInfo, info: nftInfo, auctionDetails, sellingDetails, listedTokensOwners, listingInfo, nonListedTokensOwners } = useAppSelector(s => s.nftDetail);
    console.log("nftDetail ==>", useAppSelector(s => s.nftDetail));
    // const [loading, setLoading] = useState(false);
    const windowState = (location?.state as { nftInfo: Nft, nftMeta: NFTmeta } | undefined);
    const [nftMeta, setNftmeta] = useState<NFTmeta | undefined>(windowState?.nftMeta);
    // const [isError, setIsError] = useState<GraphQLResult<any> | null>();
    const [selectedTab, setSelectedTab] = useState(TabsEnum.Owners);
    const [userNonListedTokenBalnace, setUserNonListedTokenBalance] = useState<number | null>(null);
    const web3Provider = useAppSelector(s => s.web3.provider);
    const [currentBlockTime, setCurrentBlockTime] = useState(0);
    const dispatch = useAppDispatch();

    useEffect(() => {
        // fetchNftInfo();
        dispatch(getNftInfo({ tokenId: assetId }))
    }, [assetId])

    useEffect(() => {

        return () => { dispatch(clearAllState()) }
    }, [])

    useEffect(() => {
        nftContract && userData?.publicAddress &&
            nftContract.balanceOf(userData.publicAddress, assetId).then(v => { setUserNonListedTokenBalance(v) });

        // marketContract?.getBidslist(listingInfo?.listingId)
    }, [userData?.publicAddress, nftContract])

    useEffect(() => {
        web3Provider &&
            getCurrentBlockTime(web3Provider).then(blockTime => setCurrentBlockTime(blockTime));
    }, [web3Provider])

    // if (!loading && isError?.errors) {
    if (error.getNftInfo) {
        return <div>
            <br /><br /><br /><br /><br />
            <h2 className="text-center" >{error.getNftInfo}</h2>
        </div>
    }

    return (
        <div>
            <Seo title={"Asset Detail"} />
            {/* <GlobalStyles /> */}
            <section className="container pt-5">
                {/* <CountDown endingTime={Date.now() + 86400000} /> */}
                <div className="row pt-md-1">
                    <div className="col-md-6 text-center">
                        <div aria-label="counter" className=""  >
                            {listingInfo?.listingType === Listing_Type.AUCTION && currentBlockTime && !!auctionDetails?.auction.endingDate &&
                                <CountDown endingTime={auctionDetails?.auction.endingDate} />
                            }
                        </div>
                        {nftInfo && <img
                            src={`${S3_BUCKET.URL}/${nftInfo.imageUrl}`}
                            // src="https://gigaland.on3-step.com/img/items/big-1.jpg"
                            className="img-fluid img-rounded mb-sm-30"
                            alt={nftInfo.name}
                            title={nftInfo.name}
                        />}
                    </div>
                    <div className="item_info col-md-6 space-x-2">
                        {/* Auctions ends in
                            <div className="de_countdown">
                                <Clock deadline="December, 30, 2021" />
                            </div> */}
                        {nftInfo && <h2 aria-label="asset-title" >{nftInfo.name}</h2>}

                        <p className="my-2">
                         <b className="font-bold">Total:</b> {nftInfo?.totalSupply}</p>
                         <a href={`https://sepolia.etherscan.io/tx/${nftInfo?.transactionHash}`} target="_blank" > <b className="font-bold underline">Trx Details</b></a>

                        {!!userNonListedTokenBalnace && <p className="my-2" ><b className="font-bold">Your Non Listed Token Balance:</b> {userNonListedTokenBalnace}</p>}

                        {!!sellingDetails && <p className="my-2" ><b className="font-bold">Token on sale:</b> {sellingDetails.amount}</p>}

                        <p>{nftInfo?.description}</p>

                        {/* 
                        {listingInfo?.price &&
                            <p className="my-2" >
                                <b>{listingInfo.listingType === Listing_Type.SELL ? "Price: " : "Base Price: "}</b>
                                {ethers.utils.formatEther(listingInfo.price.toString()).toString()} MATIC
                            </p>
                        } */}

                        {listingInfo?.price && listingInfo.listingType === Listing_Type.AUCTION &&
                            <p className="my-2" >
                                <b>{!!auctionDetails?.bid.highestBid ? "Highest Bid: " : "Base Price: "}</b>
                                {!!auctionDetails?.bid.highestBid ?
                                    ethers.utils.formatEther(auctionDetails.bid.highestBid.toString()).toString() :
                                    ethers.utils.formatEther(listingInfo.price.toString()).toString()
                                }
                                <span className="ml-2">MATIC</span>
                            </p>
                        }

                        {userData?.isAdmin && (userNonListedTokenBalnace || 0) > 0 &&
                            <Button onClick={() => navigate("./list", { state: { nftInfo: { ...nftInfo, amount: userNonListedTokenBalnace?.toString() } as typeof nftInfo, nftMeta } })}>List NFT</Button>}

                        <span>
                            {nftInfo && listingInfo && listingInfo.listingType === Listing_Type.SELL && sellingDetails &&
                                <BuyNft
                                    sellingSupply={sellingDetails.amount} assetId={nftInfo.tokenId!} assetName={nftInfo.name!}
                                    collectionName={collectionInfo?.name || ""} imgUrl={nftInfo.imageUrl} price={listingInfo.price!} listingId={listingInfo.listingId!}
                                />}

                            {nftInfo && listingInfo && listingInfo.listingType === Listing_Type.AUCTION &&
                                <PlaceBidModal
                                    assetId={nftInfo.tokenId!} assetName={nftInfo.name!} listingId={listingInfo.listingId!}
                                    collectionName={collectionInfo?.name || ""} imgUrl={nftInfo.imageUrl} baseprice={listingInfo.price!} highestPrice={auctionDetails?.bid.highestBid}
                                />}
                        </span>

                        <br /><br />

                        <div className="flex space-x-2" >
                            {/* <div className="flex flex-col items-center w-16">
                                <p className="text-sm mb-1 font-bold">Owner</p>
                                <img className="w-14 rounded-full" src={S3_BUCKET.URL + `/collection/${collectionInfo?.id}/profile`} />
                            </div> */}

                            <div className="flex flex-col min-w-16">
                                <p className="text-sm mb-1 font-bold">Collection</p>
                                <div className="flex items-center space-x-2" >
                                    <img className="w-14 rounded-full h-14" src={S3_BUCKET.URL + `/collection/${collectionInfo?.id}/profile`} />
                                    <p className="text-sm mb-1 font-bold">{collectionInfo?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* <div className="spacer-30"></div> */}
                        <hr className="bg-black my-3 border-2 border-black" />

                        {/* <div>
                            <h3 className="mb-0" >Description</h3>
                            
                        </div> */}
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
                            <div aria-label="tabs" className="flex space-x-2 text-[#8364E2] text-center" >
                                {Object.values(TabsEnum).map((v, idx) => {
                                    return <span onClick={() => { setSelectedTab(v) }} key={idx}
                                        className={`cursor-pointer py-2 w-24 ${v === selectedTab ? "text-white bg-[#403f83]" : "bg-[#eee]"} `}
                                    >
                                        {v}
                                    </span>
                                })}
                            </div>
                            {selectedTab === TabsEnum.Owners && <OwnersTab listingType={listingInfo?.listingType!} />}
                            {selectedTab === TabsEnum.Details && <DetailsTab />}
                            {selectedTab === TabsEnum.History && <HistoryTab />}

                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ItemDetail;


const OwnersTab = React.memo<{ listingType: Listing_Type }>(({ listingType }) => {
    const dispatch = useAppDispatch();
    const nftInfo = useAppSelector(s => s.nftDetail.info);
    const collectionInfo = useAppSelector(s => s.nftDetail.collectionInfo);
    const sellingDetails = useAppSelector(s => s.nftDetail.sellingDetails);
    const _listingInfo = useAppSelector(s => s.nftDetail.listingInfo);
    const listedTokensOwners = useAppSelector(s => s.nftDetail.listedTokensOwners);
    const nonListedTokensOwners = useAppSelector(s => s.nftDetail.nonListedTokensOwners);
    const { assetId } = useAssetsParams();

    // useEffect(() => {
    //     dispatch(getNftListingsOfSameToken({ tokenId: assetId }))
    // }, [])

    return (
        <div className="space-y-4 mt-4" >
            {listedTokensOwners.map(({ amount, displayName, listingInfo, profileImage, refId, userPublicAddress, username }, key) => {
                return <div key={key}>
                    <div className="flex">
                        <img src={S3_BUCKET.URL + "/" + profileImage} alt={displayName} className='rounded-full mr-2 w-14' />
                        <div className="text-sm" >
                            <p className="mb-1" >{displayName}</p>
                            {/* <p className="mb-1" >{listingInfo?.price}</p> */}
                            <p className="mb-1" >{userPublicAddress}</p>
                        </div>

                    </div>
                    {nftInfo && listingInfo && listingType === Listing_Type.SELL && sellingDetails &&
                        <div className="flex justify-evenly" >
                            <div>X {sellingDetails.amount}</div>
                            <BuyNft
                                sellingSupply={sellingDetails.amount} assetId={nftInfo.tokenId!} assetName={nftInfo.name!}
                                collectionName={collectionInfo?.name || ""} imgUrl={nftInfo.imageUrl} price={listingInfo.price!} listingId={`${listingInfo.listingId}`}
                            />
                        </div>}
                </div>
            })}
            {nonListedTokensOwners.data.map(({ amount, displayName, listingInfo, profileImage, refId, userPublicAddress, username }, key) => {
                return <div key={key} className="flex">
                    {profileImage ?
                        <img src={S3_BUCKET.URL + "/" + profileImage} alt={displayName} className='rounded-full mr-2 w-14' /> :
                        <div className="rounded-full mr-2 w-14 h-14 bg-gray-400" />}
                    <div className="text-sm" >
                        <p className="mb-1" >{displayName}</p>
                        {/* <p className="mb-1" >{listingInfo?.price}</p> */}
                        <p className="mb-1" >{userPublicAddress}</p>
                    </div>
                </div>
            })}
        </div>
    )
})

const DetailsTab: FC = ({ }) => {
    return (
        <div>Details Tab</div>
    )
}

const HistoryTab: FC = ({ }) => {
    return (
        <div>History Tab</div>
    )
}