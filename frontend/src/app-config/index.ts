import PAGES from './pages.json';

const WEBSITE_DOMAIN = 'nft-market-place.com';
const WEBSITETITLE = 'NFT Market Place';
const WEBSITE_URL = 'https://' + WEBSITE_DOMAIN;

const SITE_METADATA = {
  title: `NFT Market Place`,
  description: `NFT Market Place, mint you NFTs here`,
  author: ``,
}

const APPSYNC_GRAPHQL = {
  REGION: process.env.AWS_REGION_API,
  ENDPOINT: process.env.APPSYNC_GRAPHQL_ENDPOINT,
  API_KEY: process.env.APPSYNC_GRAPHQL_API_KEY,
};

const S3_BUCKET = {
  REGION: process.env.AWS_REGION_API,
  NAME: process.env.S3_BUCKET_NAME,
  URL: process.env.S3_URL,
};

const COGNITO = {
  IDENTITY_POOL_ID: process.env.IDENTITY_POOL_ID,
  USER_POOL_ID: process.env.USER_POOL_ID,
  USER_POOL_WEB_CLIENT_ID: process.env.USER_POOL_WEB_CLIENT_ID,
}

const SUPPORTED_CHAINS =
// [
// { id: 1, name: "Mainet" },
// { id: 3, name: "Ropsten" },
// { id: 4, name: "Rinkeby" },
// { id: 137, name: "Polygon" },
// { id: 5, name: "Goerli" },
// { id: 42, name: "Kovan" },
{
  id: 11155111, // Sepolia testnet chain ID
  name: "Sepolia",
  walletDetails: {
    chainId: '0xaa36a7', // Sepolia testnet chain ID in hexadecimal
    rpcUrls: ["https://rpc.sepolia.org/"], // Replace with your Infura project ID
    chainName: "Sepolia",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://sepolia.etherscan.io/"]
  }
}
// ]


export {
  WEBSITE_DOMAIN,
  APPSYNC_GRAPHQL,
  SUPPORTED_CHAINS,
  WEBSITETITLE,
  WEBSITE_URL,
  PAGES,
  SITE_METADATA,
  S3_BUCKET,
  COGNITO
};
