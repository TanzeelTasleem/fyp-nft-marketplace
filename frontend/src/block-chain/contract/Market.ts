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

    public async buyNft(tokenId: string, price: string) {
        const _price = ethers.utils.parseEther(price.toString()).toString();
        const res = await this.contract.buyNft(tokenId, { value: _price })
        console.log("buyNft_res ==>", res);
        return res
    }

    public async placeBid(tokenId: string, price: string) {
        const _price = ethers.utils.parseEther(price.toString()).toString();
        const res = await this.contract.bid(tokenId, { value: _price })
        console.log("placeBid_res ==>", res);
        return res
    }

    public async getAuctionDetails(listingId: number) {
        const res = await this.contract.auctions(listingId);

        // console.log("auctions_res ==>", res);
        return {
            basePrice: BigNumber.from(res.basePrice._hex).toNumber(),
            cancelled: res.cancelled,
            endingUnix: BigNumber.from(res.endingUnix._hex).toNumber(),
            seller: res.seller,
            startingUnix: BigNumber.from(res.startingUnix._hex).toNumber(),
            tokenId: BigNumber.from(res.tokenId._hex).toNumber()
        }
    }

    // public async run(listingId: number) {
    //     const res = await this.contract.(listingId)
    //     console.log("auctions_res ==>", res);
    //     return res
    // }


}