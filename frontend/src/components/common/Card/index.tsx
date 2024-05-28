import { ethers } from 'ethers';
import { navigate } from 'gatsby';
import React, { FC, useEffect, useState } from 'react'
import styled from 'styled-components';
import { PAGES, S3_BUCKET } from '../../../app-config';
import { Listing_Type, NftListing } from '../../../graphql/types';
import { useAppSelector } from '../../../redux/store';
import { uuid } from '../../../utils/helper';
import { Button } from '../../common';
import { BuyNft, PlaceBidModal } from "../../pages/assets/components";
import Clock from '../Clock';
import CountDown from '../../../components/pages/assets/components/CountDown';
import { AuctionDetailsResponse, SellingDetailsResponse, BiddingDetailsResposne } from '../../../block-chain/contract/Market';

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

interface CardProps {
    currentBlockTime?: number;
    totalSupply?: number;
    description?: string;
    duration?: string;
    imageUrl?: string;
    ipfsImageHash?: string;
    listedBy?: string;
    listingDate?: string;
    listingType?: Listing_Type;
    name?: string;
    price?: string;
    tokenId?: string;
    tokenUri?: string;
    listingId?: number;
    amount?: string | number;
}

const NFTCard: FC<{ data: CardProps }> = ({ data: { tokenId, listingId, listedBy, currentBlockTime, amount, imageUrl, totalSupply, duration, listingType, name, price } }) => {

    const [height, setHeight] = useState(0)
    const marketContract = useAppSelector(s => s.contract.marketContract);
    const web3Provider = useAppSelector(s => s.web3.provider);
    const [auctionDetails, setAuctionDetails] = useState<AuctionDetailsResponse | null>(null)
    const [sellingDetails, setSellingDetails] = useState<SellingDetailsResponse | null>(null)
    const [biddingDetails, setBiddingDetails] = useState<BiddingDetailsResposne | null>(null)

    const onImgLoad = ({ target: img }) => {
        // console.log("from image load --->",img);
        let currentHeight = height;
        if (currentHeight < img.offsetHeight) {
            // console.log("from onload Image condition --->");
            setHeight(img.offsetHeight)
        }
    }

    useEffect(() => {
        listingType === Listing_Type.AUCTION && listingId &&
            marketContract?.getAuctionDetails(listingId).then(v => { console.log("getAuctionDetails", v); setAuctionDetails(v) }).catch(e => console.log("getAuctionDetails_Error", e))

        listingType === Listing_Type.AUCTION && listingId &&
            marketContract?.getBiddingDetails(listingId).then(v => { console.log("getBiddingDetails", v); setBiddingDetails(v) }).catch(e => console.log("getBiddingDetails_Error", e))

        listingType === Listing_Type.SELL && typeof listingId === "number" &&
            marketContract?.getSellingDetails(listingId).then(v => { console.log("getSellingDetails", v); setSellingDetails(v) }).catch(e => console.log("getSellingDetails_Error", e))

    }, [listingId])

    // console.log(auctionDetails)

    return (
        <>
            <div className="h-full border border-gray-200 hover:shadow-xl cursor-pointer p-3 rounded-2xl max-w-xs" onClick={(e) => navigate(`${PAGES.ASSETS.path}/${tokenId}`)}>
                {/* { deadline &&
            <div className="de_countdown">
                <Clock deadline={deadline} />
            </div>
        } */}
                {/* <div className="author_list_pp">
         
            <span onClick={()=> navigate(`${PAGES.PROFILE.path}/${listedBy}`)}>
            {authorImg ?
                <img className="lazy" src={authorImg} alt="" /> 
                : 
                <img className="bg-gray-200 lazy w-28 min-h-[36px] "  alt=""/> 
            }                                    

                <i className="fa fa-check"></i>
            </span>
         
        </div> */}
                <div className='' >
                    {
                        imageUrl ? (
                            <img
                                onLoad={onImgLoad}
                                src={`${S3_BUCKET.URL}/${imageUrl}`}
                                className=" bg-gray-200 rounded-2xl max-h-64  mx-auto"
                                alt={name}
                            />
                        ) : (
                            <div className="bg-gray-200 mx-auto rounded-2xl max-h-64 mb-1.5" />
                        )
                    }

                    {/* <Outer>
            <span>
            {imageUrl ?
                <img onLoad={onImgLoad} src={`${S3_BUCKET.URL}/public/${imageUrl}`} className="lazy nft__item_preview" alt=""/>
                : 
                <div className="bg-gray-200 h-full"/> 
            }                                    
            </span>
          </Outer> */}
                </div>
                <div className="nft__item_info mb-0 mt-1.5" >
                    <div className='flex justify-between' >
                        <h4 className='m-0 pb-1'>{name}</h4>
                        {
                            !price && (
                                <span>x
                                    <span className='text-black pl-0.5' style={{ color: "black", fontWeight: "bold" }} >{listingType ? listingType === Listing_Type.AUCTION ? 1 : (amount || totalSupply) : (amount || totalSupply)}</span>
                                </span>
                            )
                        }
                    </div>
                    {listingType === Listing_Type.AUCTION && !biddingDetails?.highestBid && <div>Base Price</div>}
                    {listingType === Listing_Type.AUCTION && !!biddingDetails?.highestBid && <div>Highest Bid</div>}
                    {listingType === Listing_Type.SELL && <div>Price</div>}
                    <div className="flex justify-between w-full font-semibold text-sm">
                        {price && (
                            <>
                                <span>
                                    {biddingDetails?.highestBid ?
                                        ethers.utils.formatEther((biddingDetails.highestBid?.toString())) :
                                        ethers.utils.formatEther((price?.toString() || ""))
                                    }
                                    <span className='m-0 pl-0.5 tracking-wide text-black '> MATIC</span>
                                </span>
                                {listingType === Listing_Type.SELL && sellingDetails && <span>x
                                    <span className='text-black pl-0.5'>{(sellingDetails.amount - sellingDetails.soldAmount)}</span>
                                </span>}
                            </>
                        )
                        }

                    </div>

                    {listingType === Listing_Type.AUCTION && currentBlockTime && !!auctionDetails?.endingDate &&
                        // <div className='text-right text-sm'>
                        //     {getPassedTime(currentBlockTime, auctionDetails.endingUnix).unit}
                        //     {getPassedTime(currentBlockTime, auctionDetails.endingUnix).time} left: ;
                        // </div>
                        <CountDown endingTime={auctionDetails.endingDate} />

                    }
                    {listingType === Listing_Type.AUCTION && !auctionDetails?.endingDate &&
                        <div className='text-center mt-1 text-sm'>Be the first to bid</div>}
                    {/* <div className='mt-2' > */}
                    {/* <span onClick={()=> window.open("#", "_self")}>Buy Now</span> */}
                    {/* <Button className='text-sm' >Buy Now</Button> */}
                    {/* {price && tokenId && name && totalSupply && listingType === Listing_Type.SELL &&
                            <BuyNft
                                totalSupply={totalSupply} assetId={tokenId} assetName={name}
                                collectionName={""} imgUrl={imageUrl} price={price}
                            />}
                        {price && tokenId && name && listingType === Listing_Type.AUCTION &&
                            <PlaceBidModal
                                assetId={tokenId} assetName={name}
                                collectionName={""} imgUrl={imageUrl} price={price}
                            />} */}
                    {/* </div> */}
                    {/* <div className="nft__item_like">
                <i className="fa fa-heart"></i><span>{likes}</span>
            </div>                             */}
                </div>
            </div>
        </>)
}

export default NFTCard


const getPassedTime = (currentTime: number, endingTime: number): { time: number, unit: string } => {
    // const currentTime = Date.now();
    let timeDiff = endingTime - currentTime; //in ms
    timeDiff /= 1000;
    const seconds = Math.round(timeDiff);
    const min = Math.round(seconds / 60);
    const hour = Math.round(min / 60);
    const day = Math.round(hour / 24);
    const week = Math.round(day / 7);
    // const month = Math.round(day / 30);
    // const year = Math.round(month / 12);

    // moment(time).

    if (seconds < 60) {
        return { time: seconds, unit: seconds > 1 ? "seconds" : "second" }
    }
    else if (min < 60) {
        return { time: min, unit: min > 1 ? "minutes" : "minute" }
    }
    else if (hour < 24) {
        return { time: hour, unit: hour > 1 ? "hours" : "hour" }
    }
    else if (day < 7) {
        return { time: day, unit: day > 1 ? "days" : "day" }
    }
    else {
        return { time: week, unit: week > 1 ? "weeks" : "week" }
    }
}