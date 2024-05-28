import { ethers, } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
// NFT meta ref https://github.com/uzairbangee/Gigaland_Contracts/blob/main/artifacts/contracts/marketplace.sol/Marketplace.json
import contractmeta from '../abis/Market.json';
import { Market, } from '../types/Market';

export class MarketContract {
    readonly ADDRESS = contractmeta.contractAddress;
    private readonly ABI = contractmeta.abi;
    private contract: Market;

    constructor(signer: any) {
        this.contract = new ethers.Contract(this.ADDRESS, this.ABI, signer) as any as Market;
    }

    public async createAuction(basePrice: number | string, tokenId: number) {
        console.log("basePrice", basePrice, "\ntokenId", tokenId)
        // console.log("before", basePrice);
        const _basePrice = ethers.utils.parseEther(basePrice.toString()).toString();
        // console.log("after", _basePrice);
        const res = await this.contract.createAuction(_basePrice, tokenId)
        console.log("createAuction_res ==>", res);
        return res
    }

    public async sellNft(price: number, numberOfTokens: number, tokenId: number) {
        const _price = ethers.utils.parseEther(price.toString()).toString();
        const res = await this.contract.sellNft(_price, tokenId, numberOfTokens)
        console.log("sellNft_res ==>", res);
        return res
    }

    public async buyNft(listingId: string, amount: number, priceOfToken: string) {
        // const _price = ethers.utils.parseEther(price.toString()).toString();
        const res = await this.contract.buyNft(listingId, amount, { value: amount * Number(priceOfToken) })
        console.log("buyNft_res ==>", res);
        return res
    }

    public async placeBid(listingId: string, price: string) {
        const _price = ethers.utils.parseEther(price.toString()).toString();
        console.log("_price", _price)
        const res = await this.contract.bid(listingId, { value: _price })
        console.log("placeBid_res ==>", res);
        return res
    }

    public async getAuctionDetails(listingId: number | string): Promise<AuctionDetailsResponse> {
        const res = await this.contract.auctions(listingId);

        // console.log("auctions_res ==>", res);
        return {
            basePrice: BigNumber.from(res.basePrice._hex).toNumber(),
            cancelled: res.cancelled,
            endingDate: BigNumber.from(res.endingUnix._hex).toNumber() * 1000,
            seller: res.seller,
            startingDate: BigNumber.from(res.startingUnix._hex).toNumber() * 1000,
            tokenId: BigNumber.from(res.tokenId._hex).toNumber()
        }
    }

    public async getSellingDetails(listingId: number | string): Promise<SellingDetailsResponse> {
        const res = await this.contract.basicSelling(listingId)
        // console.log("basicSelling_res ==>", res);
        return {
            amount: BigNumber.from(res.amount._hex).toNumber(),
            cancelled: res.cancelled,
            listingDate: BigNumber.from(res.listingUnix._hex).toNumber() * 1000,
            seller: res.seller,
            price: BigNumber.from(res.price._hex).toString(),
            tokenId: BigNumber.from(res.tokenId._hex).toNumber(),
            soldAmount: BigNumber.from(res.soldAmount._hex).toNumber(),
        }
    }

    public async getBiddingDetails(listingId: number | string) {
        const res = await this.contract.bids(listingId);
        // console.log("getBidslist_res ==>", res);
        return {
            highestBidder: res.highestBidder,
            highestBid: BigNumber.from(res.highestBid._hex).toNumber(),
            tokenId: BigNumber.from(res.tokenId._hex).toNumber(),
            totalBids: BigNumber.from(res.totalBids._hex).toNumber(),
        };
    }

    // public async run(listingId: number) {
    //     const res = await this.contract.(listingId)
    //     console.log("auctions_res ==>", res);
    //     return res
    // }


}

export type SellingDetailsResponse = {
    amount: number
    cancelled: boolean
    listingDate: number
    seller: string
    price: string
    tokenId: number
    soldAmount: number
}

export type AuctionDetailsResponse = {
    basePrice: number
    cancelled: boolean
    endingDate: number
    seller: string
    startingDate: number
    tokenId: number
}

export type BiddingDetailsResposne = {
    highestBid: number
    highestBidder: string
    tokenId: number
    totalBids: number
}