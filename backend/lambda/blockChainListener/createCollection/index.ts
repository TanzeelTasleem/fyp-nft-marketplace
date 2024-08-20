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

type collectionData = {
  name: string;
  collectionId: string;
  refId: string;
  royaltyHolders: string[];
  royaltyPercentages: number[];
};

export async function createCollection(
  faunaClient: Client,
  transactionHash: string,
  collectionData: collectionData,
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

      console.log("transactionHash ", transactionHash);

      const receipt = await getTransactionReceipt(web3js, transactionHash);
      /*  */
      console.log("receipt ", receipt);

      if (receipt && receipt.status === true) {
        console.log("status confirmed");

        try {
          if (
            receipt.to.toLocaleLowerCase() !==
            _tokenContractAddress.toLocaleLowerCase()
          ) {
            throw new Error("invalid contract address");
          }

          const tx = await web3js.eth.getTransaction(transactionHash);

          console.log("tx", tx);

          abiDecoder.addABI(_tokenContractAbi);

          const decodedInput = abiDecoder.decodeMethod(tx.input);

          const inputParams = decodedInput.params;

          console.log("inputParams", inputParams);
          console.log("collData", collectionData);

          if (
            !(
              inputParams[0].name === "_collectionId" &&
              inputParams[0].value === collectionData.collectionId &&
              inputParams[1].name === "_name" &&
              inputParams[1].value === collectionData.name &&
              inputParams[2].name === "_royaltyHolders" &&
              inputParams[3].name === "_royalty"
            )
          ) {
            throw new Error("invalid inputs");
          }

          for (let i = 0; i < collectionData.royaltyHolders.length; i++) {
            if (
              inputParams[2].value[i].toLocaleLowerCase() !=
              collectionData.royaltyHolders[i].toLocaleLowerCase()
            ) {
              throw new Error("invalid inputs");
            }
          }

          for (let i = 0; i < collectionData.royaltyPercentages.length; i++) {
            if (
              inputParams[3].value[i] != collectionData.royaltyPercentages[i]
            ) {
              throw new Error("invalid inputs");
            }
          }

          await updateStatusInDatabase(
            BlockChainStatus.Confirmed,
            faunaClient,
            collectionData.refId
          );

          return;
        } catch (e) {
          console.log(e);
          console.log("manipulated");

          await deleteEntryInDatabase(faunaClient, collectionData.refId);

          return;
        }
      } else if (receipt && receipt.status === false) {
        console.log("status failed");

        console.log(receipt);

        await deleteEntryInDatabase(faunaClient, collectionData.refId);

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
          data: collectionData,
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

      await deleteEntryInDatabase(faunaClient, collectionData.refId);

      return;
    }
  } catch (e) {
    console.log("we called");
    await deleteEntryInDatabase(faunaClient, collectionData.refId);

    console.log(e);
  }
}

const updateStatusInDatabase = async (
  status: BlockChainStatus,
  faunaClient: Client,
  collectionRef: string
) => {
  const updateCollection: any = await faunaClient.query(
    q.Update(q.Ref(q.Collection("collections"), collectionRef), {
      data: {
        blockChainStatus: status,
      },
    })
  );

  console.log("result", updateCollection);
};

const deleteEntryInDatabase = async (
  faunaClient: Client,
  collectionRef: string
) => {
  const deleteCollection: any = await faunaClient.query(
    q.Delete(q.Ref(q.Collection("collections"), collectionRef))
  );

  console.log("result", deleteCollection);
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
