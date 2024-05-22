export const signup = /* GraphQL */ `
  mutation signup($address: ID!) {
    signup(address: $address) {
      joiningDate
      nonce
      publicAddress
    }
  }
`

export const authenticate = /* GraphQL */ `
  mutation authenticate($address: ID!, $signature: String!) {
    authenticate(address: $address, signature: $signature)
  }
`

export const refreshAccessToken = /* GraphQL */ `
  mutation refreshAccessToken($accessToken: String!) {
    refreshAccessToken(accessToken: $accessToken)
  }
`

export const updateProfile = /* GraphQL */ `
  mutation updateProfile($input: updateProfileInput!) {
    updateProfile(input: $input) {
      username
      displayName
      bio
      publicAddress
      email
      profileImage
      coverImage
    }
  }
`

export const followUser = /* GraphQL */ `
  mutation followUser($input: followUserInput!) {
    followUser(input: $input)
  }
`

export const createCollection = /* GraphQL */ `
  mutation createCollection($input: createCollectionInput!) {
    createCollection(input: $input) {
      id
      ref
      name
      description
      creatorRef
      royalityInfo {
        address
        percentage
      }
      category
      coverImage
      profileImage
      blockChainStatus
    }
  }
`

export const updateCollection = /* GraphQL */ `
  mutation updateCollection($input: updateCollectionInput!) {
    updateCollection(input: $input) {
      id
      name
      profileImage
      ref
      blockChainStatus
      category
      coverImage
      creatorRef
      description
      royalityInfo {
        address
        percentage
      }
    }
  }
`

export const mintNft = /* GraphQL */ `
  mutation mintNft($input: mintNftInput!) {
    mintNft(input: $input) {
      refId
      tokenId
      totalSupply
      tokenUri
      imageUrl
      collectionRef
      blockChainStatus
    }
  }
`

export const listNft = /* GraphQL */ `
  mutation listNft($input: listNftInput!) {
    listNft(input: $input) {
      amount
      blockChainStatus
      description
      duration
      imageUrl
      ipfsImageHash
      listedBy
      listingDate
      listingType
      name
      price
      tokenId
      tokenUri
      transactionHash
    }
  }
`
