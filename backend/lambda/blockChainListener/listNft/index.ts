import {
  DynamoDBDocumentClient,
  UpdateCommandOutput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import {
  UpdateProfileInput,
  User,
  BlockChainStatus,
  Listing_Type,
} from "../codegenTypes";
import * as AWS from "aws-sdk";
const errorHandlingTemplate = require("/opt/errorHandlingTemplate");
import {
  errorCodes,
  ErrorStructure,
  errorTypes,
  returnError,
} from "../../../lambdaLayers/apiDependencies/errorHandlingTemplate";
import { query as q, Client } from "faunadb";

const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes;
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes;
const generateError = errorHandlingTemplate.returnError as typeof returnError;
import { Context } from "aws-lambda";
import axios from "axios";
import web3 from "web3";
import { TransactionReceipt } from "web3-core";
const abiDecoder = require("abi-decoder");

const contractInfo = require("/opt/contractInfo");
import {
  marketContractAbi,
  marketContractAddress,
  tokenContractAbi,
  tokenContractAddress,
} from "../../../lambdaLayers/apiDependencies/contractInfo";

const _marketContractAbi =
  contractInfo.marketContractAbi as typeof marketContractAbi;
const _marketContractAddress =
  contractInfo.marketContractAddress as typeof marketContractAddress;

type listNftData = {
  tokenId: string;
  tokenUri: string;
  listNftRef: string;
};

export async function listNft(
  faunaClient: Client,
  transactionHash: string,
  listNftData: listNftData,
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
          console.log("logs", receipt.logs);

          if (
            receipt.to.toLocaleLowerCase() !==
            _marketContractAddress.toLocaleLowerCase()
          ) {
            throw new Error("invalid contract address");
          }

          if (!receipt.logs) {
            throw new Error("no logs found");
          }

          const filterLogs = receipt.logs.filter(
            (val) =>
              val.topics[0] ===
              "0x25fa87c7ce6f1874d9d70df6ebebabf36c8af873100126b8e11cbc02f243e306"
          );

          const decodedData = web3js.eth.abi.decodeParameters(
            ["uint256", "address", "uint256", "uint256"],
            filterLogs[0].data
          );

          const listingId = decodedData["2"];

          console.log("dedcodedLog", decodedData);

          const tx = await web3js.eth.getTransaction(transactionHash);

          console.log("tx", tx);

          abiDecoder.addABI(_marketContractAbi);

          const decodedInput = abiDecoder.decodeMethod(tx.input);

          const inputParams = decodedInput.params;

          console.log("INPUT PARAMS", inputParams);
          console.log("NFTDATA", listNftData);

          let listingType;

          const blockNumber = tx.blockNumber;
          console.log("blockNumber", blockNumber);

          const blockInfo = await web3js.eth.getBlock(blockNumber!);
          const listingDate = blockInfo.timestamp.toString();
          console.log("time", blockInfo.timestamp);

          if (inputParams.length !== 3) {
            listingType = Listing_Type.Auction;

            if (
              !(
                inputParams[0].name === "_basePrice" &&
                inputParams[1].name === "_tokenId" &&
                inputParams[1].value === listNftData.tokenId
              )
            ) {
              throw new Error("Invalid inputs");
            }

            console.log("inputParams", inputParams);

            const basePrice = inputParams[0].value;

            await updateStatusInDatabase(
              BlockChainStatus.Confirmed,
              faunaClient,
              listNftData.listNftRef,
              listNftData.tokenId,
              listNftData.tokenUri,
              basePrice,
              listingDate!,
              listingType,
              listingId
            );
          } else {
            listingType = Listing_Type.Sell;

            if (
              !(
                inputParams[0].name === "_price" &&
                inputParams[1].name === "_tokenId" &&
                inputParams[1].value === listNftData.tokenId &&
                inputParams[2].name === "_amount"
              )
            ) {
              throw new Error("Invalid inputs");
            }

            const price = inputParams[0].value;
            const amount = inputParams[2].value;

            await updateStatusInDatabase(
              BlockChainStatus.Confirmed,
              faunaClient,
              listNftData.listNftRef,
              listNftData.tokenId,
              listNftData.tokenUri,
              price,
              listingDate!,
              listingType,
              listingId,
              amount
            );
          }

          return;
        } catch (e) {
          console.log(e);
          console.log("manipulated");
          await deleteEntryInDatabase(faunaClient, listNftData.listNftRef);

          return;
        }
      } else if (receipt && receipt.status === false) {
        console.log("status failed");

        await deleteEntryInDatabase(faunaClient, listNftData.listNftRef);

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
          data: listNftData,
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
      await deleteEntryInDatabase(faunaClient, listNftData.listNftRef);

      return;
    }
  } catch (e) {
    console.log(e);
  }
}

const updateStatusInDatabase = async (
  status: BlockChainStatus,
  faunaClient: Client,
  listNftRef: string,
  tokenId: string,
  tokenUri: string,
  price: string,
  listingDate: string,
  listingType: Listing_Type,
  listingId: string,
  amount?: number
) => {
  let data: any = {
    blockChainStatus: status,
    tokenId: tokenId,
    totalSupply: amount,
    tokenUri: tokenUri,
    listingType: listingType,
    price: price,
    listingDate: listingDate,
    listingId: listingId,
  };

  if (amount) {
    data.amount = amount;
  }

  const updateNftListing: any = await faunaClient.query(
    q.Update(q.Ref(q.Collection("nftListings"), listNftRef), {
      data: { ...data },
    })
  );

  console.log("result", updateNftListing);
};

const deleteEntryInDatabase = async (
  faunaClient: Client,
  listNftRef: string
) => {
  const deleteNftListing: any = await faunaClient.query(
    q.Delete(q.Ref(q.Collection("nftListings"), listNftRef))
  );

  console.log("result", deleteNftListing);
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
