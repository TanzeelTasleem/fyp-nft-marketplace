import {
  DynamoDBDocumentClient,
  UpdateCommandOutput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { UpdateProfileInput, User, BlockChainStatus } from "../codegenTypes";
import * as AWS from "aws-sdk";
const errorHandlingTemplate = require("/opt/errorHandlingTemplate");
import {
  errorCodes,
  ErrorStructure,
  errorTypes,
  returnError,
} from "../../../lambdaLayers/apiDependencies/errorHandlingTemplate";
import { query as q, Client } from "faunadb";
import { TransactionReceipt } from "web3-core";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes;
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes;
const generateError = errorHandlingTemplate.returnError as typeof returnError;
import { Context } from "aws-lambda";
import axios from "axios";
import web3 from "web3";
const abiDecoder = require("abi-decoder");

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

type nftData = {
  collectionId: string;
  nftRef: string;
};

export async function mintNft(
  faunaClient: Client,
  transactionHash: string,
  nftData: nftData,
  context: Context,
  invokeCounter?: number
) {
  const timeRemaining = context.getRemainingTimeInMillis();
  console.log(timeRemaining);

  try {
    const invocationCounter = invokeCounter ? invokeCounter : 1;

    const safeLimitMs = 780 * 1000;

    const timer = (ms: number | undefined) =>
      new Promise((res) => setTimeout(res, ms));

    while (timeRemaining > safeLimitMs) {
      console.log("loop starting");

      const web3js = new web3(
        "https://eth-sepolia.g.alchemy.com/v2/F8OcbsSaq9eXumFZZHDcifoxnyXURoNg"
      );

      const receipt = await getTransactionReceipt(web3js, transactionHash);

      console.log(receipt);

      if (receipt && receipt.status === true) {
        console.log("status confirmed");

        try {
          if (
            receipt.to.toLocaleLowerCase() !==
            _tokenContractAddress.toLocaleLowerCase()
          ) {
            throw new Error("invalid contract address");
          }

          if (!receipt.logs) {
            throw new Error("no logs found");
          }

          const filterLogs = receipt.logs.filter(
            (val) =>
              val.topics[0] ===
              "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62"
          );

          const decodedData = web3js.eth.abi.decodeParameters(
            ["uint256", "uint256"],
            filterLogs[0].data
          );

          const tx = await web3js.eth.getTransaction(transactionHash);

          console.log("tx", tx);

          abiDecoder.addABI(_tokenContractAbi);

          const decodedInput = abiDecoder.decodeMethod(tx.input);

          const inputParams = decodedInput.params;

          console.log("INPUT PARAMS", inputParams);
          console.log("NFTDATA", nftData);

          if (
            !(
              inputParams[0].name === "_amount" &&
              inputParams[1].name === "_collectionId" &&
              inputParams[1].value == nftData.collectionId &&
              inputParams[2].name === "_tokenUri"
            )
          ) {
            throw new Error("Invalid inputs");
          }

          console.log("dedcodedLog", decodedData);

          console.log("inputParams", inputParams);

          const tokenId = decodedData["0"];
          const amount = inputParams[0].value;
          const tokenUri = inputParams[2].value;
          let description;
          let ipfsImageHash;
          let name;

          try {
            // const result = await axios.get(`https://deep-index.moralis.io/api/v2/nft/${_tokenContractAddress}/${tokenId}?chain=mumbai&format=decimal`,{headers:{'X-API-Key':`wMYJMBsTsgfvyQjvWugJZzmive32oNvFSSScgrUIRdmDTuQ4M6jkRTfDEHpU8PhV`,'Accept':'application/json'}})

            // console.log('moralis Resp',result.data)

            const tokenUriHash = tokenUri.split("/").pop();

            const result = await axios.get(
              `https://ipfs.moralis.io:2053/ipfs/${tokenUriHash}`
            );

            console.log("metadata Resp", result.data);

            if (result.data) {
              description = result.data.description;
              name = result.data.name;
              ipfsImageHash = result.data.image;
            } else {
              throw new Error("metadata not found");
            }
          } catch (e) {
            throw new Error("metadata not found");
          }

          console.log("tokenId", tokenId);

          await updateStatusInDatabase(
            BlockChainStatus.Confirmed,
            faunaClient,
            nftData.nftRef,
            tokenId,
            amount,
            tokenUri,
            description,
            name,
            ipfsImageHash
          );

          return;
        } catch (e) {
          const err: any = e;

          console.log("errmsg", err.message);
          if (err.message !== "metadata not found") {
            console.log(e);
            console.log("manipulated");
            await deleteEntryInDatabase(faunaClient, nftData.nftRef);

            return;
          }
        }
      } else if (receipt && receipt.status === false) {
        console.log("status failed");

        await deleteEntryInDatabase(faunaClient, nftData.nftRef);

        console.log(receipt);

        return;
      }
      await timer(20000);
    }

    if (invocationCounter < 4) {
      let lambdaParams = {
        FunctionName: context.functionName,
        InvocationType: "Event",
        Payload: JSON.stringify({
          transactionHash: transactionHash,
          data: nftData,
          invokeCounter: invocationCounter + 1,
        }),
      };

      const lambda = new AWS.Lambda();

      console.log("Invoked", lambdaParams);
      const invokeLambda = await lambda.invoke(lambdaParams).promise();

      console.log(invokeLambda);

      return;
    } else {
      console.log("status failed");
      await deleteEntryInDatabase(faunaClient, nftData.nftRef);

      return;
    }
  } catch (e) {
    console.log(e);
  }
}

const updateStatusInDatabase = async (
  status: BlockChainStatus,
  faunaClient: Client,
  nftRef: string,
  tokenId: string,
  amount: number,
  tokenUri: string,
  description: string,
  name: string,
  ipfsImageHash: string
) => {
  const updateNft: any = await faunaClient.query(
    q.Update(q.Ref(q.Collection("nfts"), nftRef), {
      data: {
        blockChainStatus: status,
        tokenId: tokenId,
        totalSupply: amount,
        tokenUri: tokenUri,
        description: description,
        name: name,
        ipfsImageHash: ipfsImageHash,
      },
    })
  );

  console.log("result", updateNft);
};

const deleteEntryInDatabase = async (faunaClient: Client, nftRef: string) => {
  const deleteNft: any = await faunaClient.query(
    q.Delete(q.Ref(q.Collection("nfts"), nftRef))
  );

  console.log("result", deleteNft);
};

const getTransactionReceipt = async (
  web3js: web3,
  transactionHash: string,
  interval = 1000
): Promise<TransactionReceipt> => {
  const transactionReceiptAsync = async (resolve: any, reject: any) => {
    try {
      const receipt = await web3js.eth.getTransactionReceipt(transactionHash);
      if (receipt) {
        resolve(receipt);
      } else {
        setTimeout(() => transactionReceiptAsync(resolve, reject), interval);
      }
    } catch (error) {
      reject(error);
    }
  };

  return new Promise(transactionReceiptAsync);
};
