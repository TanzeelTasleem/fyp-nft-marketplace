export const findUser = /* GraphQL */ `
  query findUser($address: ID!) {
    findUser(address: $address) {
      joiningDate
      nonce
      publicAddress
    }
  }
`

export const getUserProfile = /* GraphQL */ `
  query getUserProfile($input: getUserProfileInput!) {
    getUserProfile(input: $input) {
      bio
      coverImage
      displayName
      email
      profileImage
      publicAddress
      refId
      username
      followersCount
      followingsCount
      followed
    }
  }
`

export const getUsersNfts = /* GraphQL */ `
query getUsersNfts($input:getUsersNftsInput!){
  getUsersNfts(input: $input) {
    count
    cursor
    data {
      ipfsImageHash
      name
      imageUrl
      description
      collectionRef
      blockChainStatus
      tokenId
      refId
      tokenUri
      totalSupply
      amount
      blockNumber
      blockNumberMinted
      contractType
      metadata
      syncedAt
    }
  }
}
`

export const authUser = /* GraphQL */ `
  query authUser {
    authUser {
      userAuthData {
        joiningDate
        nonce
        publicAddress
        tokenExpiryDate
      }
      userData {
        isAdmin
        username
        refId
        publicAddress
        profileImage
        followingsCount
        followersCount
        email
        displayName
        coverImage
        bio
      }
    }
  }
`

export const usernameAvailable = /* GraphQL */ `
  query usernameAvailable($username: String!) {
    usernameAvailable(username: $username)
  }
`

export const collectionIdAvailable = /* GraphQL */ `
  query collectionIdAvailable($id: String!) {
    collectionIdAvailable(id: $id)
  }
`

export const getCollectionInfo = /* GraphQL */ `
  query getCollectionInfo($input: getCollectionInfoInput!) {
    getCollectionInfo(input: $input) {
      id
      ref
      name
      description
      creatorRef
      royalityInfo {
        address
        percentage
      }
      blockChainStatus
      category
      coverImage
      profileImage
    }
  }
`

export const getBlockChainStatus = /* GraphQL */ `
  query getBlockChainStatus($input: getBlockChainStatusInput!) {
    getBlockChainStatus(input: $input) {
      data
      status
    }
  }
`

export const getCollections = /* GraphQL */ `
  query getCollections($input: getCollectionsInput!) {
    getCollections(input: $input) {
      collections {
        id
        blockChainStatus
        category
        coverImage
        creatorRef
        description
        name
        profileImage
        ref
        royalityInfo {
          address
          percentage
        }
      }
      before
      after
    }
  }
`

export const getNftInfo = /* GraphQL */ `
  query MyQuery($input: getNftInfoInput!) {
    getNftInfo(input: $input) {
      listingInfo {
        isListed
        listingId
        listingType
        price
      }
      nftInfo {
        tokenId
        name
        tokenUri
        totalSupply
        syncedAt
        refId
        metadata
        ipfsImageHash
        imageUrl
        transactionHash
        description
        contractType
        collectionRef
        blockNumberMinted
        blockNumber
        blockChainStatus
        amount
      }
      collectionInfo {
        blockChainStatus
        category
        coverImage
        creatorRef
        description
        id
        name
        profileImage
        ref
      }
    }
  }
`
export const searchCollectionByName = /* GraphQL */ `
  query searchCollectionByName($input: searchCollectionByNameInput!) {
    searchCollectionByName(input: $input) {
      collections {
        id
        description
        creatorRef
        coverImage
        category
        blockChainStatus
        profileImage
        name
        ref
        royalityInfo {
          address
          percentage
        }
      }
      before
      after
    }
  }
`

export const getListedNfts = /* GraphQL */ `
query getListedNfts($input: getListedNftsInput!) {
  getListedNfts(input: $input) {
    listedNfts {
      amount
      blockChainStatus
      description
      duration
      ipfsImageHash
      listedBy
      imageUrl
      listingType
      listingDate
      name
      tokenId
      listingId
      price
      transactionHash
      tokenUri
    }
    before
    after
  }
}
`
export const getCollectionNfts = /* GraphQL */ `
  query getCollectionNfts($input: getCollectionNftsInput!) {
    getCollectionNfts(input: $input) {
      nfts {
        refId
        tokenId
        tokenUri
        totalSupply
        name
        ipfsImageHash
        imageUrl
        description
        collectionRef
        blockChainStatus
      }
      before
      after
    }
  }
`

export const getUserListedNfts = /* GraphQL */ `
query getUserListedNfts($input:getUserListedNftsInput!){
  getUserListedNfts(input:$input) {
    after
    before
    listedNfts {
      amount
      blockChainStatus
      description
      duration
      imageUrl
      listedBy
      ipfsImageHash
      listingDate
      listingId
      listingType
      name
      price
      tokenId
      tokenUri
      transactionHash
    }
  }
}
`

export const getNftOwners = /* GraphQL */ `
query MyQuery($input: getNftOwnersInput!) {
  getNftOwners(input: $input) {
    data {
      amount
      profileImage
      refId
      userPublicAddress
      username
      displayName
    }
    count
    cursor
  }
}
`

export const getNftListingsOfSameToken = /* GraphQL */ `
query MyQuery($input: getNftListingsOfSameTokenInput!) {
  getNftListingsOfSameToken(input: $input) {
    after
    before
    data {
      amount
      displayName
      listingInfo {
        amount
        listingId
        price
      }
      profileImage
      refId
      userPublicAddress
      username
    }
  }
}
`
