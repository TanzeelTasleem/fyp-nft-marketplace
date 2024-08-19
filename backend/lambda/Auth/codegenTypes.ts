export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  AWSEmail: { input: any; output: any; }
  AWSPhone: { input: any; output: any; }
  AWSTimestamp: { input: any; output: any; }
  AWSURL: { input: any; output: any; }
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
  coverImage?: Maybe<Scalars['String']['output']>;
  creatorRef?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  ref?: Maybe<Scalars['String']['output']>;
  royalityInfo?: Maybe<Array<Maybe<RoyaltyInfo>>>;
}

export interface History {
  __typename?: 'History';
  bidPrice?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  from?: Maybe<Scalars['String']['output']>;
  listPrice?: Maybe<Scalars['String']['output']>;
  salePrice?: Maybe<Scalars['String']['output']>;
  statusMoralis?: Maybe<Scalars['Boolean']['output']>;
  to?: Maybe<Scalars['String']['output']>;
  tokenId?: Maybe<Scalars['String']['output']>;
  transactionHash?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
}

export enum Listing_Type {
  Auction = 'AUCTION',
  Sell = 'SELL'
}

export interface Mutation {
  __typename?: 'Mutation';
  authenticate: Scalars['String']['output'];
  createCollection: Collection;
  followUser: Scalars['String']['output'];
  listNft: NftListing;
  mintNft: Nft;
  refreshAccessToken: Scalars['String']['output'];
  signup: UserAuthData;
  updateCollection: Collection;
  updateProfile: User;
}


export interface MutationAuthenticateArgs {
  address: Scalars['ID']['input'];
  signature: Scalars['String']['input'];
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
  accessToken: Scalars['String']['input'];
}


export interface MutationSignupArgs {
  address: Scalars['ID']['input'];
}


export interface MutationUpdateCollectionArgs {
  input: UpdateCollectionInput;
}


export interface MutationUpdateProfileArgs {
  input: UpdateProfileInput;
}

export interface Nft {
  __typename?: 'Nft';
  amount?: Maybe<Scalars['String']['output']>;
  blockChainStatus?: Maybe<BlockChainStatus>;
  blockNumber?: Maybe<Scalars['Int']['output']>;
  blockNumberMinted?: Maybe<Scalars['Int']['output']>;
  collectionRef?: Maybe<Scalars['String']['output']>;
  contractType?: Maybe<Contract_Type>;
  description?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  ipfsImageHash?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  refId?: Maybe<Scalars['String']['output']>;
  syncedAt?: Maybe<Scalars['String']['output']>;
  tokenId?: Maybe<Scalars['String']['output']>;
  tokenUri?: Maybe<Scalars['String']['output']>;
  totalSupply?: Maybe<Scalars['Int']['output']>;
  transactionHash?: Maybe<Scalars['String']['output']>;
}

export interface NftListing {
  __typename?: 'NftListing';
  amount?: Maybe<Scalars['Int']['output']>;
  blockChainStatus: BlockChainStatus;
  description?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  ipfsImageHash?: Maybe<Scalars['String']['output']>;
  listedBy: Scalars['ID']['output'];
  listingDate?: Maybe<Scalars['String']['output']>;
  listingId?: Maybe<Scalars['Int']['output']>;
  listingType?: Maybe<Listing_Type>;
  name?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  tokenId: Scalars['String']['output'];
  tokenUri?: Maybe<Scalars['String']['output']>;
  transactionHash: Scalars['String']['output'];
}

export interface NftListingInfo {
  __typename?: 'NftListingInfo';
  isListed?: Maybe<Scalars['Boolean']['output']>;
  listingId?: Maybe<Scalars['String']['output']>;
  listingType?: Maybe<Listing_Type>;
  price?: Maybe<Scalars['String']['output']>;
}

export interface Query {
  __typename?: 'Query';
  authUser: AuthUserOutput;
  collectionIdAvailable: Scalars['Boolean']['output'];
  findUser: UserAuthData;
  getBlockChainStatus?: Maybe<GetBlockChainStatusOutput>;
  getCollectionInfo?: Maybe<Collection>;
  getCollectionNfts: GetCollectionNftsOutput;
  getCollections: GetCollectionsOutput;
  getHistoryByNFT?: Maybe<GetHistoryByNftOutput>;
  getListedNfts: GetListedNftsOutput;
  getNftInfo: GetNftInfoOutput;
  getNftListingsOfSameToken: GetNftListingsOfSameTokenOutput;
  getNftOwners: GetNftOwnersOutput;
  getUserListedNfts: GetUserListedNftsOutput;
  getUserProfile: UserShow;
  getUsersNfts: GetUsersNftsOutput;
  indexNftAddress: Scalars['String']['output'];
  refreshMetaData: Scalars['Boolean']['output'];
  searchCollectionByName?: Maybe<GetCollectionsOutput>;
  usernameAvailable: Scalars['Boolean']['output'];
}


export interface QueryCollectionIdAvailableArgs {
  id: Scalars['String']['input'];
}


export interface QueryFindUserArgs {
  address: Scalars['ID']['input'];
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


export interface QueryGetHistoryByNftArgs {
  input?: InputMaybe<GetHistoryByNftInput>;
}


export interface QueryGetListedNftsArgs {
  input: GetListedNftsInput;
}


export interface QueryGetNftInfoArgs {
  input: GetNftInfoInput;
}


export interface QueryGetNftListingsOfSameTokenArgs {
  input: GetNftListingsOfSameTokenInput;
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


export interface QueryRefreshMetaDataArgs {
  input: RefreshMetaDataInput;
}


export interface QuerySearchCollectionByNameArgs {
  input?: InputMaybe<SearchCollectionByNameInput>;
}


export interface QueryUsernameAvailableArgs {
  username: Scalars['String']['input'];
}

export interface RoyaltyInfo {
  __typename?: 'RoyaltyInfo';
  address?: Maybe<Scalars['String']['output']>;
  percentage?: Maybe<Scalars['Int']['output']>;
}

export interface RoyaltyInfoInput {
  address: Scalars['String']['input'];
  percentage: Scalars['Int']['input'];
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
  coverImage?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  profileImage?: InputMaybe<Scalars['String']['input']>;
  royalityInfo: Array<RoyaltyInfoInput>;
  transactionhash: Scalars['String']['input'];
}

export interface FollowUserInput {
  publicAddress: Scalars['ID']['input'];
}

export interface GetBlockChainStatusInput {
  id: Scalars['ID']['input'];
  statusType: BlockChainStatus_Type;
}

export interface GetBlockChainStatusOutput {
  __typename?: 'getBlockChainStatusOutput';
  data?: Maybe<Scalars['String']['output']>;
  status: BlockChainStatus;
}

export interface GetCollectionInfoInput {
  id: Scalars['ID']['input'];
}

export interface GetCollectionNftsInput {
  after?: InputMaybe<Array<Scalars['String']['input']>>;
  before?: InputMaybe<Array<Scalars['String']['input']>>;
  collectionRef: Scalars['String']['input'];
  pageSize: Scalars['Int']['input'];
}

export interface GetCollectionNftsOutput {
  __typename?: 'getCollectionNftsOutput';
  after?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  nfts: Array<Nft>;
}

export interface GetCollectionsInput {
  after?: InputMaybe<Array<Scalars['String']['input']>>;
  before?: InputMaybe<Array<Scalars['String']['input']>>;
  pageSize: Scalars['Int']['input'];
}

export interface GetCollectionsOutput {
  __typename?: 'getCollectionsOutput';
  after?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  collections: Array<Collection>;
}

export interface GetHistoryByNftInput {
  SortingOrderByTime: Sorting_Order;
  after?: InputMaybe<Array<Scalars['String']['input']>>;
  before?: InputMaybe<Array<Scalars['String']['input']>>;
  pageSize: Scalars['Int']['input'];
  tokenId: Scalars['String']['input'];
}

export interface GetHistoryByNftOutput {
  __typename?: 'getHistoryByNFTOutput';
  after?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  history: Array<History>;
}

export interface GetListedNftsInput {
  SortingOrderByTime: Sorting_Order;
  after?: InputMaybe<Array<Scalars['String']['input']>>;
  before?: InputMaybe<Array<Scalars['String']['input']>>;
  category?: InputMaybe<Array<Category>>;
  listingType?: InputMaybe<Listing_Type>;
  pageSize: Scalars['Int']['input'];
}

export interface GetListedNftsOutput {
  __typename?: 'getListedNftsOutput';
  after?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  listedNfts: Array<NftListing>;
}

export interface GetNftInfoInput {
  tokenId: Scalars['ID']['input'];
}

export interface GetNftInfoOutput {
  __typename?: 'getNftInfoOutput';
  collectionInfo: Collection;
  listingInfo?: Maybe<NftListingInfo>;
  nftInfo: Nft;
}

export interface GetNftListingsOfSameTokenInput {
  after?: InputMaybe<Array<Scalars['String']['input']>>;
  before?: InputMaybe<Array<Scalars['String']['input']>>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  tokenId: Scalars['String']['input'];
}

export interface GetNftListingsOfSameTokenOutput {
  __typename?: 'getNftListingsOfSameTokenOutput';
  after?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  data: Array<Maybe<NftOwner>>;
}

export interface GetNftOwnersInput {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  tokenId: Scalars['String']['input'];
}

export interface GetNftOwnersOutput {
  __typename?: 'getNftOwnersOutput';
  count: Scalars['Int']['output'];
  cursor?: Maybe<Scalars['String']['output']>;
  data: Array<Maybe<NftOwner>>;
}

export interface GetUserListedNftsInput {
  SortingOrderByTime: Sorting_Order;
  after?: InputMaybe<Array<Scalars['String']['input']>>;
  before?: InputMaybe<Array<Scalars['String']['input']>>;
  category?: InputMaybe<Array<Category>>;
  listingType?: InputMaybe<Listing_Type>;
  pageSize: Scalars['Int']['input'];
  publicAddress: Scalars['String']['input'];
  status?: InputMaybe<Blockchain_Update_Status>;
}

export interface GetUserListedNftsOutput {
  __typename?: 'getUserListedNftsOutput';
  after?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  listedNfts: Array<NftListing>;
}

export interface GetUserProfileInput {
  publicAddress?: InputMaybe<Scalars['ID']['input']>;
  refId?: InputMaybe<Scalars['ID']['input']>;
  username?: InputMaybe<Scalars['ID']['input']>;
}

export interface GetUsersNftsInput {
  cursor?: InputMaybe<Scalars['String']['input']>;
  pageSize: Scalars['Int']['input'];
  refId?: InputMaybe<Scalars['ID']['input']>;
  userPublicAddress?: InputMaybe<Scalars['ID']['input']>;
  username?: InputMaybe<Scalars['ID']['input']>;
}

export interface GetUsersNftsOutput {
  __typename?: 'getUsersNftsOutput';
  count: Scalars['Int']['output'];
  cursor?: Maybe<Scalars['String']['output']>;
  data: Array<Maybe<Nft>>;
}

export interface IndexNftAddressInput {
  nftAddress: Scalars['String']['input'];
}

export interface ListNftInput {
  tokenId: Scalars['String']['input'];
  transactionHash: Scalars['String']['input'];
}

export interface MintNftInput {
  collectionId: Scalars['String']['input'];
  collectionRef: Scalars['String']['input'];
  imageUrl: Scalars['String']['input'];
  transactionhash: Scalars['String']['input'];
}

export interface NftOwner {
  __typename?: 'nftOwner';
  amount?: Maybe<Scalars['Int']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  listingInfo?: Maybe<NftOwnerListingInfo>;
  profileImage?: Maybe<Scalars['String']['output']>;
  refId?: Maybe<Scalars['String']['output']>;
  userPublicAddress?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
}

export interface NftOwnerListingInfo {
  __typename?: 'nftOwnerListingInfo';
  amount?: Maybe<Scalars['Int']['output']>;
  listingId?: Maybe<Scalars['Int']['output']>;
  price?: Maybe<Scalars['String']['output']>;
}

export interface RefreshMetaDataInput {
  tokenId: Scalars['String']['input'];
}

export interface SearchCollectionByNameInput {
  after?: InputMaybe<Array<Scalars['String']['input']>>;
  before?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  pageSize: Scalars['Int']['input'];
}

export interface UpdateCollectionInput {
  category?: InputMaybe<Category>;
  coverImage?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  profileImage?: InputMaybe<Scalars['String']['input']>;
  ref: Scalars['String']['input'];
}

export interface UpdateProfileInput {
  bio?: InputMaybe<Scalars['String']['input']>;
  coverImage?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  profileImage?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
}

export interface User {
  __typename?: 'user';
  bio?: Maybe<Scalars['String']['output']>;
  coverImage?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  followersCount?: Maybe<Scalars['Int']['output']>;
  followingsCount?: Maybe<Scalars['Int']['output']>;
  isAdmin?: Maybe<Scalars['Boolean']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  publicAddress?: Maybe<Scalars['ID']['output']>;
  refId?: Maybe<Scalars['ID']['output']>;
  username?: Maybe<Scalars['String']['output']>;
}

export interface UserAuthData {
  __typename?: 'userAuthData';
  joiningDate?: Maybe<Scalars['AWSTimestamp']['output']>;
  nonce?: Maybe<Scalars['String']['output']>;
  publicAddress: Scalars['ID']['output'];
  tokenExpiryDate?: Maybe<Scalars['AWSTimestamp']['output']>;
}

export interface UserShow {
  __typename?: 'userShow';
  bio?: Maybe<Scalars['String']['output']>;
  coverImage?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  followed: Scalars['Boolean']['output'];
  followersCount?: Maybe<Scalars['Int']['output']>;
  followingsCount?: Maybe<Scalars['Int']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  publicAddress?: Maybe<Scalars['ID']['output']>;
  refId?: Maybe<Scalars['ID']['output']>;
  username?: Maybe<Scalars['String']['output']>;
}
