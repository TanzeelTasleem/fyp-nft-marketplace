import { ethers, } from 'ethers';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
// NFT meta ref https://github.com/uzairbangee/Gigaland_Contracts/blob/main/artifacts/contracts/erc1155.sol/MyToken.json
import contractmeta from '../abis/NFT.json';
import { NFT, } from '../types/NFT';

export class NftContract {
    readonly ADDRESS = contractmeta.contractAddress;
    private readonly ABI = contractmeta.abi;
    private contract: NFT;

    constructor(signer: any) {
        this.contract = new ethers.Contract(this.ADDRESS, this.ABI, signer) as any as NFT;
    }

    public async createCollection(id: string, name: string, royaltyHolders: string[], royalty: number[]) {
        // royalty = BigNumber.from(String(royalty))
        const res = await this.contract.createCollection(id, name, royaltyHolders, royalty)
        console.log("createCollection_res ==>", res);
        return res
    }

    public async mintNFT(amount: number, collectionId: string, tokenURI: string) {
        // royalty = BigNumber.from(String(royalty))
        const res = await this.contract.mint(amount, collectionId, tokenURI)
        console.log("mintNFT_res ==>", res);
        return res
    }

    public async setApprovalForAll(operator: string) {
        // royalty = BigNumber.from(String(royalty))
        const res = await this.contract.setApprovalForAll(operator, true)
        console.log("setApprovalForAll_res ==>", res);
        return res
    }

    public async isOwner(accountAddress: string) {
        // royalty = BigNumber.from(String(royalty))
        const res = await this.contract._isOwner(accountAddress)
        console.log("isOwner_res ==>", res);
        return res
    }
    // public async maxSupply() {
    //     const { _hex } = await this.contract.maxSupply()
    //     const _maxSupply = BigNumber.from(_hex).toNumber();
    //     console.log("maxSupply", _maxSupply);
    //     return _maxSupply;
    // }

    // public async totalSupplied() {
    //     const { _hex } = await this.contract.totalSupply()
    //     const _totalSupply = BigNumber.from(_hex).toNumber();
    //     console.log("totalSupplied", _totalSupply);
    //     return _totalSupply;
    // }

    // /* will return single NFT mint cost */
    // public async getNftMintCost() {
    //     const { _hex } = await this.contract.cost()
    //     const cost = BigNumber.from(_hex).toString() // will return cost in wei units;
    //     console.log("nftCost", ethers.utils.formatEther(cost), "eth");
    //     return {
    //         inWei: cost,
    //         inEth: ethers.utils.formatEther(cost),
    //     };
    // }

    // public async isMintingPaused() {
    //     const res = await this.contract.paused()
    //     // const _maxSupply = BigNumber.from(_hex).toNumber();
    //     console.log("isMintingPaused", res);
    //     return res as boolean;
    // }

    // public async mint(_mintQty: number /* range 1-20 */) {
    //     const mintQty = BigNumber.from(String(_mintQty));
    //     const cost = await this.getNftMintCost();
    //     const totalMintingCost = `${_mintQty * Number(cost.inWei)}`;
    //     const transaction = await this.contract.mint(mintQty, { value: totalMintingCost });
    //     await transaction.wait();
    //     console.log("Transaction completed successfully");
    // }

}