import {
  CreateCollectionInput,
  Collection,
  BlockChainStatus,
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
import { blockChainListenerEvent } from "../../../lambdaLayers/apiDependencies/commonTypes";

type outputType = ErrorStructure | { data: Collection };

export async function CreateCollection(
  input: CreateCollectionInput,
  faunaClient: Client,
  publicAddress: string,
  refId: string,
  isAdmin: boolean
): Promise<outputType> {
  const {
    name,
    description,
    id,
    category,
    royalityInfo,
    coverImage,
    profileImage,
    transactionhash,
  } = input;

  console.log("publicAddress ", publicAddress);

  // let lowerCaseAddress = publicAddress.toLocaleLowerCase();

  if (!isAdmin) {
    return generateError(
      `API will be only run by Admin`,
      { errorCode: error_Codes.unAuthorized },
      error_Types.unAuthorized
    );
  }

  if (
    !id ||
    !description ||
    !name ||
    !category ||
    !royalityInfo ||
    !coverImage ||
    !profileImage
  ) {
    return generateError(
      `Some required fields are missing`,
      { errorCode: error_Codes.unAuthorized },
      error_Types.unAuthorized
    );
  }

  let collectionInput: Collection = {};

  name ? (collectionInput.name = name) : null;
  description ? (collectionInput.description = description) : null;
  id ? (collectionInput.id = id) : null;
  category ? (collectionInput.category = category) : null;
  royalityInfo ? (collectionInput.royalityInfo = royalityInfo) : [];
  coverImage ? (collectionInput.coverImage = coverImage) : null;
  profileImage ? (collectionInput.profileImage = profileImage) : null;
  collectionInput.creatorRef = refId;

  collectionInput.blockChainStatus = BlockChainStatus.Started;

  try {
    const createCollection: any = await faunaClient.query(
      q.Create(q.Collection("collections"), { data: { ...collectionInput } })
    );

    console.log("createCollection", createCollection);

    const output: Collection = { ...createCollection.data };

    const royaltyHolders = royalityInfo.map((val) => val.address);
    const royaltyPercentages = royalityInfo.map((val) => val.percentage);

    const lambda = new AWS.Lambda();

    const Payload: blockChainListenerEvent = {
      type: "createCollection",
      transactionHash: transactionhash!,
      data: {
        name: name,
        collectionId: id,
        refId: createCollection.ref.id,
        royaltyHolders: royaltyHolders,
        royaltyPercentages: royaltyPercentages,
      },
    };

    let lambdaParams = {
      FunctionName: process.env.blockChainListenerName!,
      InvocationType: "Event",
      Payload: JSON.stringify(Payload),
    };

    console.log("Invoked", lambdaParams);
    const invokeLambda = await lambda.invoke(lambdaParams).promise();

    console.log(invokeLambda);

    return {
      data: output,
    };
  } catch (e) {
    const err: any = e;
    console.log(err.message);
    return generateError(
      err.message,
      { errorCode: error_Codes.refused },
      error_Types.refused
    );
  }
}
