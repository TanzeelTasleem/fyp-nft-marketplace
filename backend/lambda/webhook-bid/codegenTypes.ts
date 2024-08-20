export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSEmail: any;
  AWSPhone: any;
  AWSTimestamp: any;
  AWSURL: any;
}

export enum Blockchain_Update_Status {
  Confirmed = 'CONFIRMED',
  Pending = 'PENDING',
  Started = 'STARTED'
}

export enum Category {
  Art = 'ART',
  Gaming = 'GAMING',
  Images = 'IMAGES'
}

export enum Contract_Type {
  Erc721 = 'ERC721',
  Erc1155 = 'ERC1155'
}

export interface Collection {
  __typename?: 'Collection';
  blockChainStatus?: Maybe<BlockChainStatus>;
  category?: Maybe<Category>;
  coverImage?: Maybe<Scalars['String']>;
  creatorRef?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  profileImage?: Maybe<Scalars['String']>;
  ref?: Maybe<Scalars['String']>;
  royalityInfo?: Maybe<Array<Maybe<RoyaltyInfo>>>;
}

export interface History {
  __typename?: 'History';
  bidPrice?: Maybe<Scalars['String']>;
  date?: Maybe<Scalars['String']>;
  from?: Maybe<Scalars['String']>;
  salePrice?: Maybe<Scalars['String']>;
  statusMoralis?: Maybe<Scalars['Boolean']>;
  to?: Maybe<Scalars['String']>;
  tokenId?: Maybe<Scalars['String']>;
  transactionHash?: Maybe<Scalars['String']>;
  type: Scalars['String'];
}

export enum Listing_Type {
  Auction = 'AUCTION',
  Sell = 'SELL'
}

export interface Mutation {
  __typename?: 'Mutation';
  authenticate: Scalars['String'];
  createCollection: Collection;
  followUser: Scalars['String'];
  listNft: NftListing;
  mintNft: Nft;
  refreshAccessToken: Scalars['String'];
  signup: UserAuthData;
  updateCollection: Collection;
  updateProfile: User;
}


export interface MutationAuthenticateArgs {
  address: Scalars['ID'];
  signature: Scalars['String'];
}


export interface MutationCreateCollectionArgs {
  input: CreateCollectionInput;
}


export interface MutationFollowUserArgs {
  input: FollowUserInput;
}


export interface MutationListNftArgs {
  input: ListNftInput;
}


export interface MutationMintNftArgs {
  input: MintNftInput;
}


export interface MutationRefreshAccessTokenArgs {
  accessToken: Scalars['String'];
}


export interface MutationSignupArgs {
  address: Scalars['ID'];
}


export interface MutationUpdateCollectionArgs {
  input: UpdateCollectionInput;
}


export interface MutationUpdateProfileArgs {
  input: UpdateProfileInput;
}

export interface Nft {
  __typename?: 'Nft';
  blockChainStatus?: Maybe<BlockChainStatus>;
  collectionRef: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  ipfsImageHash?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  refId?: Maybe<Scalars['String']>;
  tokenId?: Maybe<Scalars['String']>;
  tokenUri?: Maybe<Scalars['String']>;
  totalSupply?: Maybe<Scalars['Int']>;
}

export interface NftListing {
  __typename?: 'NftListing';
  amount?: Maybe<Scalars['Int']>;
  blockChainStatus: BlockChainStatus;
  description?: Maybe<Scalars['String']>;
  duration?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  ipfsImageHash?: Maybe<Scalars['String']>;
  listedBy: Scalars['ID'];
  listingDate?: Maybe<Scalars['String']>;
  listingType?: Maybe<Listing_Type>;
  name?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['String']>;
  tokenId: Scalars['String'];
  tokenUri?: Maybe<Scalars['String']>;
  transactionHash: Scalars['String'];
}

export interface Query {
  __typename?: 'Query';
  authUser: AuthUserOutput;
  collectionIdAvailable: Scalars['Boolean'];
  findUser: UserAuthData;
  getBlockChainStatus?: Maybe<GetBlockChainStatusOutput>;
  getCollectionInfo?: Maybe<Collection>;
  getCollectionNfts: GetCollectionNftsOutput;
  getCollections: GetCollectionsOutput;
  getListedNfts: GetListedNftsOutput;
  getNftInfo: Nft;
  getNftOwners: GetNftOwnersOutput;
  getUserListedNfts: GetUserListedNftsOutput;
  getUserProfile: UserShow;
  getUsersNfts: GetUsersNftsOutput;
  indexNftAddress: Scalars['String'];
  searchCollectionByName?: Maybe<GetCollectionsOutput>;
  usernameAvailable: Scalars['Boolean'];
}


export interface QueryCollectionIdAvailableArgs {
  id: Scalars['String'];
}


export interface QueryFindUserArgs {
  address: Scalars['ID'];
}


export interface QueryGetBlockChainStatusArgs {
  input: GetBlockChainStatusInput;
}


export interface QueryGetCollectionInfoArgs {
  input: GetCollectionInfoInput;
}


export interface QueryGetCollectionNftsArgs {
  input: GetCollectionNftsInput;
}


export interface QueryGetCollectionsArgs {
  input: GetCollectionsInput;
}


export interface QueryGetListedNftsArgs {
  input: GetListedNftsInput;
}


export interface QueryGetNftInfoArgs {
  input: GetNftInfoInput;
}


export interface QueryGetNftOwnersArgs {
  input: GetNftOwnersInput;
}


export interface QueryGetUserListedNftsArgs {
  input: GetUserListedNftsInput;
}


export interface QueryGetUserProfileArgs {
  input: GetUserProfileInput;
}


export interface QueryGetUsersNftsArgs {
  input: GetUsersNftsInput;
}


export interface QueryIndexNftAddressArgs {
  input: IndexNftAddressInput;
}


export interface QuerySearchCollectionByNameArgs {
  input?: InputMaybe<SearchCollectionByNameInput>;
}


export interface QueryUsernameAvailableArgs {
  username: Scalars['String'];
}

export interface RoyaltyInfo {
  __typename?: 'RoyaltyInfo';
  address?: Maybe<Scalars['String']>;
  percentage?: Maybe<Scalars['Int']>;
}

export interface RoyaltyInfoInput {
  address: Scalars['String'];
  percentage: Scalars['Int'];
}

export enum Sorting_Order {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum Sort_By {
  Date = 'date',
  Price = 'price'
}

export interface AuthUserOutput {
  __typename?: 'authUserOutput';
  userAuthData: UserAuthData;
  userData: User;
}

export enum BlockChainStatus {
  Confirmed = 'CONFIRMED',
  Failed = 'FAILED',
  Manipulated = 'MANIPULATED',
  Pending = 'PENDING',
  Started = 'STARTED'
}

export enum BlockChainStatus_Type {
  Collection = 'COLLECTION',
  Listnft = 'LISTNFT',
  Mintnft = 'MINTNFT'
}

export interface CreateCollectionInput {
  category?: InputMaybe<Category>;
  coverImage?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  profileImage?: InputMaybe<Scalars['String']>;
  royalityInfo: Array<RoyaltyInfoInput>;
  transactionhash: Scalars['String'];
}

export interface FollowUserInput {
  publicAddress: Scalars['ID'];
}

export interface GetBlockChainStatusInput {
  id: Scalars['ID'];
  statusType: BlockChainStatus_Type;
}

export interface GetBlockChainStatusOutput {
  __typename?: 'getBlockChainStatusOutput';
  data?: Maybe<Scalars['String']>;
  status: BlockChainStatus;
}

export interface GetCollectionInfoInput {
  id: Scalars['ID'];
}

export interface GetCollectionNftsInput {
  after?: InputMaybe<Array<Scalars['String']>>;
  before?: InputMaybe<Array<Scalars['String']>>;
  collectionRef: Scalars['String'];
  pageSize: Scalars['Int'];
}

export interface GetCollectionNftsOutput {
  __typename?: 'getCollectionNftsOutput';
  after?: Maybe<Array<Maybe<Scalars['String']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']>>>;
  nfts: Array<Nft>;
}

export interface GetCollectionsInput {
  after?: InputMaybe<Array<Scalars['String']>>;
  before?: InputMaybe<Array<Scalars['String']>>;
  pageSize: Scalars['Int'];
}

export interface GetCollectionsOutput {
  __typename?: 'getCollectionsOutput';
  after?: Maybe<Array<Maybe<Scalars['String']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']>>>;
  collections: Array<Collection>;
}

export interface GetListedNftsInput {
  SortingOrderByTime: Sorting_Order;
  after?: InputMaybe<Array<Scalars['String']>>;
  before?: InputMaybe<Array<Scalars['String']>>;
  category?: InputMaybe<Array<Category>>;
  listingType?: InputMaybe<Listing_Type>;
  pageSize: Scalars['Int'];
}

export interface GetListedNftsOutput {
  __typename?: 'getListedNftsOutput';
  after?: Maybe<Array<Maybe<Scalars['String']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']>>>;
  listedNfts: Array<NftListing>;
}

export interface GetNftInfoInput {
  tokenId: Scalars['ID'];
}

export interface GetNftOwnersInput {
  nftAddress: Scalars['String'];
  pageNumber: Scalars['Int'];
  pageSize: Scalars['Int'];
  tokenId: Scalars['String'];
}

export interface GetNftOwnersOutput {
  __typename?: 'getNftOwnersOutput';
  count: Scalars['Int'];
  data: Array<Maybe<NftOwner>>;
}

export interface GetUserListedNftsInput {
  after?: InputMaybe<Array<Scalars['String']>>;
  auctionEndingSoon?: InputMaybe<Scalars['Boolean']>;
  before?: InputMaybe<Array<Scalars['String']>>;
  category?: InputMaybe<Array<Category>>;
  listingType?: InputMaybe<Listing_Type>;
  pageSize: Scalars['Int'];
  sortBy: Sort_By;
  sortingOrder: Sorting_Order;
  status?: InputMaybe<Blockchain_Update_Status>;
  userRefId: Scalars['ID'];
}

export interface GetUserListedNftsOutput {
  __typename?: 'getUserListedNftsOutput';
  after?: Maybe<Array<Maybe<Scalars['String']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']>>>;
  nfts: Array<NftListing>;
}

export interface GetUserProfileInput {
  publicAddress?: InputMaybe<Scalars['ID']>;
  refId?: InputMaybe<Scalars['ID']>;
  username?: InputMaybe<Scalars['ID']>;
}

export interface GetUsersNftsInput {
  pageOffset: Scalars['Int'];
  pageSize: Scalars['Int'];
  refId?: InputMaybe<Scalars['ID']>;
  userPublicAddress?: InputMaybe<Scalars['ID']>;
  username?: InputMaybe<Scalars['ID']>;
}

export interface GetUsersNftsOutput {
  __typename?: 'getUsersNftsOutput';
  count: Scalars['Int'];
  data: Array<Maybe<Nft>>;
}

export interface IndexNftAddressInput {
  nftAddress: Scalars['String'];
}

export interface ListNftInput {
  tokenId: Scalars['String'];
  transactionHash: Scalars['String'];
}

export interface MintNftInput {
  collectionId: Scalars['String'];
  collectionRef: Scalars['String'];
  imageUrl: Scalars['String'];
  transactionhash: Scalars['String'];
}

export interface NftOwner {
  __typename?: 'nftOwner';
  amount: Scalars['Int'];
  user: User;
}

export interface SearchCollectionByNameInput {
  after?: InputMaybe<Array<Scalars['String']>>;
  before?: InputMaybe<Array<Scalars['String']>>;
  name: Scalars['String'];
  pageSize: Scalars['Int'];
}

export interface UpdateCollectionInput {
  category?: InputMaybe<Category>;
  coverImage?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  profileImage?: InputMaybe<Scalars['String']>;
  ref: Scalars['String'];
}

export interface UpdateProfileInput {
  bio?: InputMaybe<Scalars['String']>;
  coverImage?: InputMaybe<Scalars['String']>;
  displayName?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  profileImage?: InputMaybe<Scalars['String']>;
  username?: InputMaybe<Scalars['String']>;
}

export interface User {
  __typename?: 'user';
  bio?: Maybe<Scalars['String']>;
  coverImage?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  followersCount?: Maybe<Scalars['Int']>;
  followingsCount?: Maybe<Scalars['Int']>;
  isAdmin?: Maybe<Scalars['Boolean']>;
  profileImage?: Maybe<Scalars['String']>;
  publicAddress?: Maybe<Scalars['ID']>;
  refId?: Maybe<Scalars['ID']>;
  username?: Maybe<Scalars['String']>;
}

export interface UserAuthData {
  __typename?: 'userAuthData';
  joiningDate?: Maybe<Scalars['AWSTimestamp']>;
  nonce?: Maybe<Scalars['String']>;
  publicAddress: Scalars['ID'];
  tokenExpiryDate?: Maybe<Scalars['AWSTimestamp']>;
}

export interface UserShow {
  __typename?: 'userShow';
  bio?: Maybe<Scalars['String']>;
  coverImage?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  followed: Scalars['Boolean'];
  followersCount?: Maybe<Scalars['Int']>;
  followingsCount?: Maybe<Scalars['Int']>;
  profileImage?: Maybe<Scalars['String']>;
  publicAddress?: Maybe<Scalars['ID']>;
  refId?: Maybe<Scalars['ID']>;
  username?: Maybe<Scalars['String']>;
}
