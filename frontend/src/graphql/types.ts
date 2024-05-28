import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSEmail: string;
  AWSPhone: string;
  AWSTimestamp: number;
  AWSURL: string;
}

export enum Blockchain_Update_Status {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  STARTED = 'STARTED'
}

export enum Category {
  ART = 'ART',
  GAMING = 'GAMING',
  IMAGES = 'IMAGES'
}

export enum Contract_Type {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155'
}

export interface Collection {
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
  bidPrice?: Maybe<Scalars['String']>;
  date?: Maybe<Scalars['String']>;
  from?: Maybe<Scalars['String']>;
  listPrice?: Maybe<Scalars['String']>;
  salePrice?: Maybe<Scalars['String']>;
  statusMoralis?: Maybe<Scalars['Boolean']>;
  to?: Maybe<Scalars['String']>;
  tokenId?: Maybe<Scalars['String']>;
  transactionHash?: Maybe<Scalars['String']>;
  type: Scalars['String'];
}

export enum Listing_Type {
  AUCTION = 'AUCTION',
  SELL = 'SELL'
}

export interface Mutation {
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
  amount?: Maybe<Scalars['String']>;
  blockChainStatus?: Maybe<BlockChainStatus>;
  blockNumber?: Maybe<Scalars['Int']>;
  blockNumberMinted?: Maybe<Scalars['Int']>;
  collectionRef?: Maybe<Scalars['String']>;
  contractType?: Maybe<Contract_Type>;
  description?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  ipfsImageHash?: Maybe<Scalars['String']>;
  metadata?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  refId?: Maybe<Scalars['String']>;
  syncedAt?: Maybe<Scalars['String']>;
  tokenId?: Maybe<Scalars['String']>;
  tokenUri?: Maybe<Scalars['String']>;
  totalSupply?: Maybe<Scalars['Int']>;
  transactionHash?: Maybe<Scalars['String']>;
}

export interface NftListing {
  amount?: Maybe<Scalars['Int']>;
  blockChainStatus: BlockChainStatus;
  description?: Maybe<Scalars['String']>;
  duration?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  ipfsImageHash?: Maybe<Scalars['String']>;
  listedBy: Scalars['ID'];
  listingDate?: Maybe<Scalars['String']>;
  listingId?: Maybe<Scalars['Int']>;
  listingType?: Maybe<Listing_Type>;
  name?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['String']>;
  tokenId: Scalars['String'];
  tokenUri?: Maybe<Scalars['String']>;
  transactionHash: Scalars['String'];
}

export interface NftListingInfo {
  isListed?: Maybe<Scalars['Boolean']>;
  listingId?: Maybe<Scalars['String']>;
  listingType?: Maybe<Listing_Type>;
  price?: Maybe<Scalars['String']>;
}

export interface Query {
  authUser: AuthUserOutput;
  collectionIdAvailable: Scalars['Boolean'];
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
  indexNftAddress: Scalars['String'];
  refreshMetaData: Scalars['Boolean'];
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
  username: Scalars['String'];
}

export interface RoyaltyInfo {
  address?: Maybe<Scalars['String']>;
  percentage?: Maybe<Scalars['Int']>;
}

export interface RoyaltyInfoInput {
  address: Scalars['String'];
  percentage: Scalars['Int'];
}

export enum Sorting_Order {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum Sort_By {
  DATE = 'date',
  PRICE = 'price'
}

export interface AuthUserOutput {
  userAuthData: UserAuthData;
  userData: User;
}

export enum BlockChainStatus {
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  MANIPULATED = 'MANIPULATED',
  PENDING = 'PENDING',
  STARTED = 'STARTED'
}

export enum BlockChainStatus_Type {
  COLLECTION = 'COLLECTION',
  LISTNFT = 'LISTNFT',
  MINTNFT = 'MINTNFT'
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
  after?: Maybe<Array<Maybe<Scalars['String']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']>>>;
  collections: Array<Collection>;
}

export interface GetHistoryByNftInput {
  SortingOrderByTime: Sorting_Order;
  after?: InputMaybe<Array<Scalars['String']>>;
  before?: InputMaybe<Array<Scalars['String']>>;
  pageSize: Scalars['Int'];
  tokenId: Scalars['String'];
}

export interface GetHistoryByNftOutput {
  after?: Maybe<Array<Maybe<Scalars['String']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']>>>;
  history: Array<History>;
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
  after?: Maybe<Array<Maybe<Scalars['String']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']>>>;
  listedNfts: Array<NftListing>;
}

export interface GetNftInfoInput {
  tokenId: Scalars['ID'];
}

export interface GetNftInfoOutput {
  collectionInfo: Collection;
  listingInfo?: Maybe<NftListingInfo>;
  nftInfo: Nft;
}

export interface GetNftListingsOfSameTokenInput {
  after?: InputMaybe<Array<Scalars['String']>>;
  before?: InputMaybe<Array<Scalars['String']>>;
  pageSize?: InputMaybe<Scalars['Int']>;
  tokenId: Scalars['String'];
}

export interface GetNftListingsOfSameTokenOutput {
  after?: Maybe<Array<Maybe<Scalars['String']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']>>>;
  data: Array<Maybe<NftOwner>>;
}

export interface GetNftOwnersInput {
  cursor?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  tokenId: Scalars['String'];
}

export interface GetNftOwnersOutput {
  count: Scalars['Int'];
  cursor?: Maybe<Scalars['String']>;
  data: Array<Maybe<NftOwner>>;
}

export interface GetUserListedNftsInput {
  SortingOrderByTime: Sorting_Order;
  after?: InputMaybe<Array<Scalars['String']>>;
  before?: InputMaybe<Array<Scalars['String']>>;
  category?: InputMaybe<Array<Category>>;
  listingType?: InputMaybe<Listing_Type>;
  pageSize: Scalars['Int'];
  publicAddress: Scalars['String'];
  status?: InputMaybe<Blockchain_Update_Status>;
}

export interface GetUserListedNftsOutput {
  after?: Maybe<Array<Maybe<Scalars['String']>>>;
  before?: Maybe<Array<Maybe<Scalars['String']>>>;
  listedNfts: Array<NftListing>;
}

export interface GetUserProfileInput {
  publicAddress?: InputMaybe<Scalars['ID']>;
  refId?: InputMaybe<Scalars['ID']>;
  username?: InputMaybe<Scalars['ID']>;
}

export interface GetUsersNftsInput {
  cursor?: InputMaybe<Scalars['String']>;
  pageSize: Scalars['Int'];
  refId?: InputMaybe<Scalars['ID']>;
  userPublicAddress?: InputMaybe<Scalars['ID']>;
  username?: InputMaybe<Scalars['ID']>;
}

export interface GetUsersNftsOutput {
  count: Scalars['Int'];
  cursor?: Maybe<Scalars['String']>;
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
  amount?: Maybe<Scalars['Int']>;
  displayName?: Maybe<Scalars['String']>;
  listingInfo?: Maybe<NftOwnerListingInfo>;
  profileImage?: Maybe<Scalars['String']>;
  refId?: Maybe<Scalars['String']>;
  userPublicAddress?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
}

export interface NftOwnerListingInfo {
  amount?: Maybe<Scalars['Int']>;
  listingId?: Maybe<Scalars['Int']>;
  price?: Maybe<Scalars['String']>;
}

export interface RefreshMetaDataInput {
  tokenId: Scalars['String'];
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
  joiningDate?: Maybe<Scalars['AWSTimestamp']>;
  nonce?: Maybe<Scalars['String']>;
  publicAddress: Scalars['ID'];
  tokenExpiryDate?: Maybe<Scalars['AWSTimestamp']>;
}

export interface UserShow {
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AWSEmail: ResolverTypeWrapper<Scalars['AWSEmail']>;
  AWSPhone: ResolverTypeWrapper<Scalars['AWSPhone']>;
  AWSTimestamp: ResolverTypeWrapper<Scalars['AWSTimestamp']>;
  AWSURL: ResolverTypeWrapper<Scalars['AWSURL']>;
  BLOCKCHAIN_UPDATE_STATUS: Blockchain_Update_Status;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CATEGORY: Category;
  CONTRACT_TYPE: Contract_Type;
  Collection: ResolverTypeWrapper<Collection>;
  History: ResolverTypeWrapper<History>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  LISTING_TYPE: Listing_Type;
  Mutation: ResolverTypeWrapper<{}>;
  Nft: ResolverTypeWrapper<Nft>;
  NftListing: ResolverTypeWrapper<NftListing>;
  NftListingInfo: ResolverTypeWrapper<NftListingInfo>;
  Query: ResolverTypeWrapper<{}>;
  RoyaltyInfo: ResolverTypeWrapper<RoyaltyInfo>;
  RoyaltyInfoInput: RoyaltyInfoInput;
  SORTING_ORDER: Sorting_Order;
  SORT_BY: Sort_By;
  String: ResolverTypeWrapper<Scalars['String']>;
  authUserOutput: ResolverTypeWrapper<AuthUserOutput>;
  blockChainStatus: BlockChainStatus;
  blockChainStatus_type: BlockChainStatus_Type;
  createCollectionInput: CreateCollectionInput;
  followUserInput: FollowUserInput;
  getBlockChainStatusInput: GetBlockChainStatusInput;
  getBlockChainStatusOutput: ResolverTypeWrapper<GetBlockChainStatusOutput>;
  getCollectionInfoInput: GetCollectionInfoInput;
  getCollectionNftsInput: GetCollectionNftsInput;
  getCollectionNftsOutput: ResolverTypeWrapper<GetCollectionNftsOutput>;
  getCollectionsInput: GetCollectionsInput;
  getCollectionsOutput: ResolverTypeWrapper<GetCollectionsOutput>;
  getHistoryByNFTInput: GetHistoryByNftInput;
  getHistoryByNFTOutput: ResolverTypeWrapper<GetHistoryByNftOutput>;
  getListedNftsInput: GetListedNftsInput;
  getListedNftsOutput: ResolverTypeWrapper<GetListedNftsOutput>;
  getNftInfoInput: GetNftInfoInput;
  getNftInfoOutput: ResolverTypeWrapper<GetNftInfoOutput>;
  getNftListingsOfSameTokenInput: GetNftListingsOfSameTokenInput;
  getNftListingsOfSameTokenOutput: ResolverTypeWrapper<GetNftListingsOfSameTokenOutput>;
  getNftOwnersInput: GetNftOwnersInput;
  getNftOwnersOutput: ResolverTypeWrapper<GetNftOwnersOutput>;
  getUserListedNftsInput: GetUserListedNftsInput;
  getUserListedNftsOutput: ResolverTypeWrapper<GetUserListedNftsOutput>;
  getUserProfileInput: GetUserProfileInput;
  getUsersNftsInput: GetUsersNftsInput;
  getUsersNftsOutput: ResolverTypeWrapper<GetUsersNftsOutput>;
  indexNftAddressInput: IndexNftAddressInput;
  listNftInput: ListNftInput;
  mintNftInput: MintNftInput;
  nftOwner: ResolverTypeWrapper<NftOwner>;
  nftOwnerListingInfo: ResolverTypeWrapper<NftOwnerListingInfo>;
  refreshMetaDataInput: RefreshMetaDataInput;
  searchCollectionByNameInput: SearchCollectionByNameInput;
  updateCollectionInput: UpdateCollectionInput;
  updateProfileInput: UpdateProfileInput;
  user: ResolverTypeWrapper<User>;
  userAuthData: ResolverTypeWrapper<UserAuthData>;
  userShow: ResolverTypeWrapper<UserShow>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AWSEmail: Scalars['AWSEmail'];
  AWSPhone: Scalars['AWSPhone'];
  AWSTimestamp: Scalars['AWSTimestamp'];
  AWSURL: Scalars['AWSURL'];
  Boolean: Scalars['Boolean'];
  Collection: Collection;
  History: History;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Mutation: {};
  Nft: Nft;
  NftListing: NftListing;
  NftListingInfo: NftListingInfo;
  Query: {};
  RoyaltyInfo: RoyaltyInfo;
  RoyaltyInfoInput: RoyaltyInfoInput;
  String: Scalars['String'];
  authUserOutput: AuthUserOutput;
  createCollectionInput: CreateCollectionInput;
  followUserInput: FollowUserInput;
  getBlockChainStatusInput: GetBlockChainStatusInput;
  getBlockChainStatusOutput: GetBlockChainStatusOutput;
  getCollectionInfoInput: GetCollectionInfoInput;
  getCollectionNftsInput: GetCollectionNftsInput;
  getCollectionNftsOutput: GetCollectionNftsOutput;
  getCollectionsInput: GetCollectionsInput;
  getCollectionsOutput: GetCollectionsOutput;
  getHistoryByNFTInput: GetHistoryByNftInput;
  getHistoryByNFTOutput: GetHistoryByNftOutput;
  getListedNftsInput: GetListedNftsInput;
  getListedNftsOutput: GetListedNftsOutput;
  getNftInfoInput: GetNftInfoInput;
  getNftInfoOutput: GetNftInfoOutput;
  getNftListingsOfSameTokenInput: GetNftListingsOfSameTokenInput;
  getNftListingsOfSameTokenOutput: GetNftListingsOfSameTokenOutput;
  getNftOwnersInput: GetNftOwnersInput;
  getNftOwnersOutput: GetNftOwnersOutput;
  getUserListedNftsInput: GetUserListedNftsInput;
  getUserListedNftsOutput: GetUserListedNftsOutput;
  getUserProfileInput: GetUserProfileInput;
  getUsersNftsInput: GetUsersNftsInput;
  getUsersNftsOutput: GetUsersNftsOutput;
  indexNftAddressInput: IndexNftAddressInput;
  listNftInput: ListNftInput;
  mintNftInput: MintNftInput;
  nftOwner: NftOwner;
  nftOwnerListingInfo: NftOwnerListingInfo;
  refreshMetaDataInput: RefreshMetaDataInput;
  searchCollectionByNameInput: SearchCollectionByNameInput;
  updateCollectionInput: UpdateCollectionInput;
  updateProfileInput: UpdateProfileInput;
  user: User;
  userAuthData: UserAuthData;
  userShow: UserShow;
};

export interface AwsEmailScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['AWSEmail'], any> {
  name: 'AWSEmail';
}

export interface AwsPhoneScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['AWSPhone'], any> {
  name: 'AWSPhone';
}

export interface AwsTimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['AWSTimestamp'], any> {
  name: 'AWSTimestamp';
}

export interface AwsurlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['AWSURL'], any> {
  name: 'AWSURL';
}

export type CollectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Collection'] = ResolversParentTypes['Collection']> = {
  blockChainStatus?: Resolver<Maybe<ResolversTypes['blockChainStatus']>, ParentType, ContextType>;
  category?: Resolver<Maybe<ResolversTypes['CATEGORY']>, ParentType, ContextType>;
  coverImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  creatorRef?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profileImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ref?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  royalityInfo?: Resolver<Maybe<Array<Maybe<ResolversTypes['RoyaltyInfo']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HistoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['History'] = ResolversParentTypes['History']> = {
  bidPrice?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  from?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  listPrice?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  salePrice?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  statusMoralis?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  to?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tokenId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  transactionHash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  authenticate?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationAuthenticateArgs, 'address' | 'signature'>>;
  createCollection?: Resolver<ResolversTypes['Collection'], ParentType, ContextType, RequireFields<MutationCreateCollectionArgs, 'input'>>;
  followUser?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationFollowUserArgs, 'input'>>;
  listNft?: Resolver<ResolversTypes['NftListing'], ParentType, ContextType, RequireFields<MutationListNftArgs, 'input'>>;
  mintNft?: Resolver<ResolversTypes['Nft'], ParentType, ContextType, RequireFields<MutationMintNftArgs, 'input'>>;
  refreshAccessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationRefreshAccessTokenArgs, 'accessToken'>>;
  signup?: Resolver<ResolversTypes['userAuthData'], ParentType, ContextType, RequireFields<MutationSignupArgs, 'address'>>;
  updateCollection?: Resolver<ResolversTypes['Collection'], ParentType, ContextType, RequireFields<MutationUpdateCollectionArgs, 'input'>>;
  updateProfile?: Resolver<ResolversTypes['user'], ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'input'>>;
};

export type NftResolvers<ContextType = any, ParentType extends ResolversParentTypes['Nft'] = ResolversParentTypes['Nft']> = {
  amount?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  blockChainStatus?: Resolver<Maybe<ResolversTypes['blockChainStatus']>, ParentType, ContextType>;
  blockNumber?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  blockNumberMinted?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  collectionRef?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contractType?: Resolver<Maybe<ResolversTypes['CONTRACT_TYPE']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ipfsImageHash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  syncedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tokenId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tokenUri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalSupply?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  transactionHash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NftListingResolvers<ContextType = any, ParentType extends ResolversParentTypes['NftListing'] = ResolversParentTypes['NftListing']> = {
  amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  blockChainStatus?: Resolver<ResolversTypes['blockChainStatus'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duration?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ipfsImageHash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  listedBy?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  listingDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  listingId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  listingType?: Resolver<Maybe<ResolversTypes['LISTING_TYPE']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tokenId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tokenUri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NftListingInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['NftListingInfo'] = ResolversParentTypes['NftListingInfo']> = {
  isListed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  listingId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  listingType?: Resolver<Maybe<ResolversTypes['LISTING_TYPE']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  authUser?: Resolver<ResolversTypes['authUserOutput'], ParentType, ContextType>;
  collectionIdAvailable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<QueryCollectionIdAvailableArgs, 'id'>>;
  findUser?: Resolver<ResolversTypes['userAuthData'], ParentType, ContextType, RequireFields<QueryFindUserArgs, 'address'>>;
  getBlockChainStatus?: Resolver<Maybe<ResolversTypes['getBlockChainStatusOutput']>, ParentType, ContextType, RequireFields<QueryGetBlockChainStatusArgs, 'input'>>;
  getCollectionInfo?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType, RequireFields<QueryGetCollectionInfoArgs, 'input'>>;
  getCollectionNfts?: Resolver<ResolversTypes['getCollectionNftsOutput'], ParentType, ContextType, RequireFields<QueryGetCollectionNftsArgs, 'input'>>;
  getCollections?: Resolver<ResolversTypes['getCollectionsOutput'], ParentType, ContextType, RequireFields<QueryGetCollectionsArgs, 'input'>>;
  getHistoryByNFT?: Resolver<Maybe<ResolversTypes['getHistoryByNFTOutput']>, ParentType, ContextType, Partial<QueryGetHistoryByNftArgs>>;
  getListedNfts?: Resolver<ResolversTypes['getListedNftsOutput'], ParentType, ContextType, RequireFields<QueryGetListedNftsArgs, 'input'>>;
  getNftInfo?: Resolver<ResolversTypes['getNftInfoOutput'], ParentType, ContextType, RequireFields<QueryGetNftInfoArgs, 'input'>>;
  getNftListingsOfSameToken?: Resolver<ResolversTypes['getNftListingsOfSameTokenOutput'], ParentType, ContextType, RequireFields<QueryGetNftListingsOfSameTokenArgs, 'input'>>;
  getNftOwners?: Resolver<ResolversTypes['getNftOwnersOutput'], ParentType, ContextType, RequireFields<QueryGetNftOwnersArgs, 'input'>>;
  getUserListedNfts?: Resolver<ResolversTypes['getUserListedNftsOutput'], ParentType, ContextType, RequireFields<QueryGetUserListedNftsArgs, 'input'>>;
  getUserProfile?: Resolver<ResolversTypes['userShow'], ParentType, ContextType, RequireFields<QueryGetUserProfileArgs, 'input'>>;
  getUsersNfts?: Resolver<ResolversTypes['getUsersNftsOutput'], ParentType, ContextType, RequireFields<QueryGetUsersNftsArgs, 'input'>>;
  indexNftAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryIndexNftAddressArgs, 'input'>>;
  refreshMetaData?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<QueryRefreshMetaDataArgs, 'input'>>;
  searchCollectionByName?: Resolver<Maybe<ResolversTypes['getCollectionsOutput']>, ParentType, ContextType, Partial<QuerySearchCollectionByNameArgs>>;
  usernameAvailable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<QueryUsernameAvailableArgs, 'username'>>;
};

export type RoyaltyInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['RoyaltyInfo'] = ResolversParentTypes['RoyaltyInfo']> = {
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  percentage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthUserOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['authUserOutput'] = ResolversParentTypes['authUserOutput']> = {
  userAuthData?: Resolver<ResolversTypes['userAuthData'], ParentType, ContextType>;
  userData?: Resolver<ResolversTypes['user'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetBlockChainStatusOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['getBlockChainStatusOutput'] = ResolversParentTypes['getBlockChainStatusOutput']> = {
  data?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['blockChainStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetCollectionNftsOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['getCollectionNftsOutput'] = ResolversParentTypes['getCollectionNftsOutput']> = {
  after?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  before?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  nfts?: Resolver<Array<ResolversTypes['Nft']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetCollectionsOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['getCollectionsOutput'] = ResolversParentTypes['getCollectionsOutput']> = {
  after?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  before?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  collections?: Resolver<Array<ResolversTypes['Collection']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetHistoryByNftOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['getHistoryByNFTOutput'] = ResolversParentTypes['getHistoryByNFTOutput']> = {
  after?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  before?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  history?: Resolver<Array<ResolversTypes['History']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetListedNftsOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['getListedNftsOutput'] = ResolversParentTypes['getListedNftsOutput']> = {
  after?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  before?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  listedNfts?: Resolver<Array<ResolversTypes['NftListing']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetNftInfoOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['getNftInfoOutput'] = ResolversParentTypes['getNftInfoOutput']> = {
  collectionInfo?: Resolver<ResolversTypes['Collection'], ParentType, ContextType>;
  listingInfo?: Resolver<Maybe<ResolversTypes['NftListingInfo']>, ParentType, ContextType>;
  nftInfo?: Resolver<ResolversTypes['Nft'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetNftListingsOfSameTokenOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['getNftListingsOfSameTokenOutput'] = ResolversParentTypes['getNftListingsOfSameTokenOutput']> = {
  after?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  before?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['nftOwner']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetNftOwnersOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['getNftOwnersOutput'] = ResolversParentTypes['getNftOwnersOutput']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['nftOwner']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetUserListedNftsOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['getUserListedNftsOutput'] = ResolversParentTypes['getUserListedNftsOutput']> = {
  after?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  before?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  listedNfts?: Resolver<Array<ResolversTypes['NftListing']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetUsersNftsOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['getUsersNftsOutput'] = ResolversParentTypes['getUsersNftsOutput']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['Nft']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NftOwnerResolvers<ContextType = any, ParentType extends ResolversParentTypes['nftOwner'] = ResolversParentTypes['nftOwner']> = {
  amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  listingInfo?: Resolver<Maybe<ResolversTypes['nftOwnerListingInfo']>, ParentType, ContextType>;
  profileImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userPublicAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NftOwnerListingInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['nftOwnerListingInfo'] = ResolversParentTypes['nftOwnerListingInfo']> = {
  amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  listingId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['user'] = ResolversParentTypes['user']> = {
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  coverImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  followersCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  followingsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isAdmin?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  profileImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publicAddress?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  refId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserAuthDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['userAuthData'] = ResolversParentTypes['userAuthData']> = {
  joiningDate?: Resolver<Maybe<ResolversTypes['AWSTimestamp']>, ParentType, ContextType>;
  nonce?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publicAddress?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  tokenExpiryDate?: Resolver<Maybe<ResolversTypes['AWSTimestamp']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserShowResolvers<ContextType = any, ParentType extends ResolversParentTypes['userShow'] = ResolversParentTypes['userShow']> = {
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  coverImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  followed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  followersCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  followingsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  profileImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publicAddress?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  refId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AWSEmail?: GraphQLScalarType;
  AWSPhone?: GraphQLScalarType;
  AWSTimestamp?: GraphQLScalarType;
  AWSURL?: GraphQLScalarType;
  Collection?: CollectionResolvers<ContextType>;
  History?: HistoryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Nft?: NftResolvers<ContextType>;
  NftListing?: NftListingResolvers<ContextType>;
  NftListingInfo?: NftListingInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RoyaltyInfo?: RoyaltyInfoResolvers<ContextType>;
  authUserOutput?: AuthUserOutputResolvers<ContextType>;
  getBlockChainStatusOutput?: GetBlockChainStatusOutputResolvers<ContextType>;
  getCollectionNftsOutput?: GetCollectionNftsOutputResolvers<ContextType>;
  getCollectionsOutput?: GetCollectionsOutputResolvers<ContextType>;
  getHistoryByNFTOutput?: GetHistoryByNftOutputResolvers<ContextType>;
  getListedNftsOutput?: GetListedNftsOutputResolvers<ContextType>;
  getNftInfoOutput?: GetNftInfoOutputResolvers<ContextType>;
  getNftListingsOfSameTokenOutput?: GetNftListingsOfSameTokenOutputResolvers<ContextType>;
  getNftOwnersOutput?: GetNftOwnersOutputResolvers<ContextType>;
  getUserListedNftsOutput?: GetUserListedNftsOutputResolvers<ContextType>;
  getUsersNftsOutput?: GetUsersNftsOutputResolvers<ContextType>;
  nftOwner?: NftOwnerResolvers<ContextType>;
  nftOwnerListingInfo?: NftOwnerListingInfoResolvers<ContextType>;
  user?: UserResolvers<ContextType>;
  userAuthData?: UserAuthDataResolvers<ContextType>;
  userShow?: UserShowResolvers<ContextType>;
};

