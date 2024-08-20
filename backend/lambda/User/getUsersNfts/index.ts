import axios from "axios";
const errorHandlingTemplate = require("/opt/errorHandlingTemplate");
import {
  errorCodes,
  ErrorStructure,
  errorTypes,
  returnError,
} from "../../../lambdaLayers/apiDependencies/errorHandlingTemplate";
import { GetUsersNftsInput, GetUsersNftsOutput, Nft } from "../codegenTypes";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes;
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes;
const generateError = errorHandlingTemplate.returnError as typeof returnError;
import { query as q, Client } from "faunadb";

const contractInfo = require("/opt/contractInfo");
import {
  marketContractAbi,
  marketContractAddress,
  tokenContractAbi,
  tokenContractAddress,
} from "../../../lambdaLayers/apiDependencies/contractInfo";

const _tokenContractAbi =
  contractInfo.tokenContractAbi as typeof tokenContractAbi;
const _tokenContractAddress =
  contractInfo.tokenContractAddress as typeof tokenContractAddress;

type outputType = ErrorStructure | { data: GetUsersNftsOutput };

export async function getUsersNfts(
  input: GetUsersNftsInput,
  faunaClient: Client
): Promise<outputType> {
  console.log(input);

  const { userPublicAddress, username, refId, cursor, pageSize } = input;

  if (pageSize < 0) {
    return generateError(
      `Page Size should be 0 or greater`,
      { errorCode: error_Codes.badRequest },
      error_Types.badRequest
    );
  }

  if (userPublicAddress) {
    if (refId || username) {
      return generateError(
        `You can get user's nfts through 1 method only`,
        { errorCode: error_Codes.badRequest },
        error_Types.badRequest
      );
    }
  }

  if (refId) {
    if (userPublicAddress || username) {
      return generateError(
        `You can get user's nfts through 1 method only`,
        { errorCode: error_Codes.badRequest },
        error_Types.badRequest
      );
    }
  }

  if (username) {
    if (userPublicAddress || refId) {
      return generateError(
        `You can get user's nfts through 1 method only`,
        { errorCode: error_Codes.badRequest },
        error_Types.badRequest
      );
    }
  }

  if (!userPublicAddress && !username && !refId) {
    return generateError(
      `Select atleast one method to get the user's nfts`,
      { errorCode: error_Codes.badRequest },
      error_Types.badRequest
    );
  }

  let lowerCaseAddress;

  if (userPublicAddress) {
    lowerCaseAddress = userPublicAddress.toLocaleLowerCase();

    const getUser: any = await faunaClient.query(
      q.Map(
        q.Paginate(q.Match(q.Index("uniquePublicAddress"), lowerCaseAddress)),
        q.Lambda("result", q.Get(q.Var("result")))
      )
    );

    if (getUser.data.length === 0) {
      return generateError(
        `User with public address ${userPublicAddress} not found`,
        { errorCode: error_Codes.notFound },
        error_Types.notFound
      );
    }
  } else if (username) {
    const getUser: any = await faunaClient.query(
      q.Map(
        q.Paginate(q.Match(q.Index("uniqueUsername"), username)),
        q.Lambda("result", q.Get(q.Var("result")))
      )
    );

    if (getUser.data.length > 0) {
      const item = getUser.data[0];

      lowerCaseAddress = item.data.publicAddress;
    } else {
      return generateError(
        `User with username ${username} not found`,
        { errorCode: error_Codes.notFound },
        error_Types.notFound
      );
    }
  } else if (refId) {
    const getUser: any = await faunaClient.query(
      q.Get(q.Ref(q.Collection("users"), refId))
    );

    console.log("getUser", getUser);

    if (getUser) {
      lowerCaseAddress = getUser.data.publicAddress;
    } else {
      return generateError(
        `User with refId ${refId} not found`,
        { errorCode: error_Codes.notFound },
        error_Types.notFound
      );
    }
  } else {
    return generateError(
      `Enter a value for atleast 1 input`,
      { errorCode: error_Codes.badRequest },
      error_Types.badRequest
    );
  }

  try {
    let result;
    if (cursor) {
      result = await axios.get(
         `https://eth-sepolia.g.alchemy.com/nft/v3/${process.env.alchemyAPIKEY}/getNFTsForOwner?owner=${lowerCaseAddress}&contractAddresses[${_tokenContractAddress}]=&withMetadata=true&pageSize=${pageSize}&$pageKey=${cursor}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
    } else {
      result = await axios.get(
         `https://eth-sepolia.g.alchemy.com/nft/v3/${process.env.alchemyAPIKEY}/getNFTsForOwner?owner=${lowerCaseAddress}&contractAddresses[${_tokenContractAddress}]=&withMetadata=true&pageSize=${pageSize}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
    }

    console.log("result.data", result.data);

    let resp = result.data as any;
    const newcursor = resp.pageKey;
    resp = resp.ownedNfts;
    const faunaMatchArray = [];
    const NFTDataMoralis: any = {};

    if (resp.length > 0) {
      for (let res of resp) {
        NFTDataMoralis[res.tokenId] = res;
        faunaMatchArray.push(q.Match(q.Index("getNftByTokenId"), res.tokenId));
      }

      console.log("faunaMatchArray ", faunaMatchArray);

      const getUserNFTS: any = await faunaClient.query(
        q.Map(
          q.Paginate(q.Union(...faunaMatchArray)),
          q.Lambda("result", q.Get(q.Var("result")))
        )
      );
      console.log("getUserNFTS ", JSON.stringify(getUserNFTS, undefined, 2));

      let nfts: Nft[] = [];

      for (let list of getUserNFTS.data) {
        console.log("NFTDataMoralis ", NFTDataMoralis[list.data.tokenId]);
        const nft: Nft = { ...list.data, ref: list.ref.id };
        nft.contractType = NFTDataMoralis[list.data.tokenId].tokenType;
        nft.name = NFTDataMoralis[list.data.tokenId].name;
        nft.amount = NFTDataMoralis[list.data.tokenId].balance;
        nft.blockNumber = NFTDataMoralis[list.data.tokenId].mint.blockNumber;
        nft.syncedAt = NFTDataMoralis[list.data.tokenId].timeLastUpdated;
        nft.metadata = JSON.stringify(NFTDataMoralis[list.data.tokenId].raw.metadata);
        nft.blockNumberMinted =
          NFTDataMoralis[list.data.tokenId].mint.blockNumber;
        nfts.push(nft);
      }

      console.log("nfts ", JSON.stringify(nfts, undefined, 2));

      console.log("newcursor ", newcursor);

      return {
        data: {
          data: nfts,
          count: result.data.totalCount,
          cursor: newcursor ? newcursor : null,
        },
      };
    }

    return { data: { data: [], count: 0 } };
  } catch (e) {
    const err: any = e;
    console.log("err", err.response.data.message);

    return generateError(
      err.response.data.message,
      { errorCode: error_Codes.internalServerError },
      error_Types.internalServerError
    );
  }
}
