import {
  ContractTransaction,
  ContractInterface,
  BytesLike as Arrayish,
  BigNumber,
  BigNumberish,
} from "ethers"
import { EthersContractContextV5 } from "ethereum-abi-types-generator"

export type ContractContext = EthersContractContextV5<
  Market,
  MarketMethodNames,
  MarketEventsContext,
  MarketEvents
>

export declare type EventFilter = {
  address?: string
  topics?: Array<string>
  fromBlock?: string | number
  toBlock?: string | number
}

export interface ContractTransactionOverrides {
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number
  /**
   * The price (in wei) per unit of gas
   */
  gasPrice?: BigNumber | string | number | Promise<any>
  /**
   * The nonce to use in the transaction
   */
  nonce?: number
  /**
   * The amount to send with the transaction (i.e. msg.value)
   */
  value?: BigNumber | string | number | Promise<any>
  /**
   * The chain ID (or network ID) to use
   */
  chainId?: number
}

export interface ContractCallOverrides {
  /**
   * The address to execute the call as
   */
  from?: string
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number
}
export type MarketEvents = "Bid" | "List" | "Sale"
export interface MarketEventsContext {
  Bid(...parameters: any): EventFilter
  List(...parameters: any): EventFilter
  Sale(...parameters: any): EventFilter
}
export type MarketMethodNames =
  | "new"
  | "auctions"
  | "basicSelling"
  | "bid"
  | "bids"
  | "buyNft"
  | "cancelAuction"
  | "cancelSell"
  | "changeAuctionBasePrice"
  | "changeSellPrice"
  | "claimBalance"
  | "claimableAmount"
  | "concludeAuction"
  | "createAuction"
  | "listingId"
  | "nftContractAddress"
  | "onERC1155BatchReceived"
  | "onERC1155Received"
  | "onERC721Received"
  | "sellNft"
  | "supportsInterface"
export interface BidEventEmittedResponse {
  tokenId: BigNumberish
  listingId: BigNumberish
  bidPrice: BigNumberish
  bidder: string
}
export interface ListEventEmittedResponse {
  price: BigNumberish
  from: string
  listingId: BigNumberish
  tokenId: BigNumberish
}
export interface SaleEventEmittedResponse {
  price: BigNumberish
  to: string
  from: string
  tokenId: BigNumberish
}
export interface AuctionsResponse {
  seller: string
  0: string
  basePrice: BigNumber
  1: BigNumber
  endingUnix: BigNumber
  2: BigNumber
  startingUnix: BigNumber
  3: BigNumber
  tokenId: BigNumber
  4: BigNumber
  cancelled: boolean
  5: boolean
  length: 6
}
export interface BasicSellingResponse {
  seller: string
  0: string
  price: BigNumber
  1: BigNumber
  listingUnix: BigNumber
  2: BigNumber
  amount: BigNumber
  3: BigNumber
  tokenId: BigNumber
  4: BigNumber
  cancelled: boolean
  5: boolean
  length: 6
}
export interface BidsResponse {
  highestBid: BigNumber
  0: BigNumber
  highestBidder: string
  1: string
  totalBids: BigNumber
  2: BigNumber
  tokenId: BigNumber
  3: BigNumber
  length: 4
}
export interface Market {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param _nftContractAddress Type: address, Indexed: false
   */
  "new"(
    _nftContractAddress: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  auctions(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<AuctionsResponse>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  basicSelling(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BasicSellingResponse>
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param _listingId Type: uint256, Indexed: false
   */
  bid(
    _listingId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  bids(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BidsResponse>
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param _listingId Type: uint256, Indexed: false
   */
  buyNft(
    _listingId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param _listingId Type: uint256, Indexed: false
   */
  cancelAuction(
    _listingId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param _listingId Type: uint256, Indexed: false
   */
  cancelSell(
    _listingId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param _listingId Type: uint256, Indexed: false
   * @param _basePrice Type: uint256, Indexed: false
   */
  changeAuctionBasePrice(
    _listingId: BigNumberish,
    _basePrice: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _listingId Type: uint256, Indexed: false
   * @param _price Type: uint256, Indexed: false
   */
  changeSellPrice(
    _listingId: BigNumberish,
    _price: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  claimBalance(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  claimableAmount(
    parameter0: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _listingId Type: uint256, Indexed: false
   */
  concludeAuction(
    _listingId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _basePrice Type: uint256, Indexed: false
   * @param _tokenId Type: uint256, Indexed: false
   */
  createAuction(
    _basePrice: BigNumberish,
    _tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  listingId(overrides?: ContractCallOverrides): Promise<BigNumber>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  nftContractAddress(overrides?: ContractCallOverrides): Promise<string>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: address, Indexed: false
   * @param parameter2 Type: uint256[], Indexed: false
   * @param parameter3 Type: uint256[], Indexed: false
   * @param parameter4 Type: bytes, Indexed: false
   */
  onERC1155BatchReceived(
    parameter0: string,
    parameter1: string,
    parameter2: BigNumberish[],
    parameter3: BigNumberish[],
    parameter4: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: address, Indexed: false
   * @param parameter2 Type: uint256, Indexed: false
   * @param parameter3 Type: uint256, Indexed: false
   * @param parameter4 Type: bytes, Indexed: false
   */
  onERC1155Received(
    parameter0: string,
    parameter1: string,
    parameter2: BigNumberish,
    parameter3: BigNumberish,
    parameter4: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: address, Indexed: false
   * @param parameter2 Type: uint256, Indexed: false
   * @param parameter3 Type: bytes, Indexed: false
   */
  onERC721Received(
    parameter0: string,
    parameter1: string,
    parameter2: BigNumberish,
    parameter3: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _price Type: uint256, Indexed: false
   * @param _tokenId Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   */
  sellNft(
    _price: BigNumberish,
    _tokenId: BigNumberish,
    _amount: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param interfaceId Type: bytes4, Indexed: false
   */
  supportsInterface(
    interfaceId: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>
}
