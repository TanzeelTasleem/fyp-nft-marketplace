import { MutationSignupArgs, User, UserAuthData } from "../codegenTypes";
import { v4 as uuidv4 } from "uuid";
// import Moralis from 'moralis/node';
import { query as q, Client } from "faunadb";

const errorHandlingTemplate = require("/opt/errorHandlingTemplate");
import {
  errorCodes,
  ErrorStructure,
  errorTypes,
  returnError,
} from "../../../lambdaLayers/apiDependencies/errorHandlingTemplate";

const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes;
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes;
const generateError = errorHandlingTemplate.returnError as typeof returnError;

type outputType = ErrorStructure | { data: UserAuthData };

export async function signup(
  input: MutationSignupArgs,
  faunaClient: Client
): Promise<outputType> {
  console.log("input ", input);

  let lowerCaseAddress = input.address.toLocaleLowerCase();

  const nonce: string = Math.floor(Math.random() * 10000).toString();
  const secretText = uuidv4();

  //     q.CreateCollection({name: "users"})

  //     q.CreateIndex(

  // {
  //   name: "userAuthData",
  //   unique: true,
  //   serialized: true,
  //   source: "users",
  //   terms: [
  //     {
  //       field: ["ref"]
  //     },
  //     {
  //       field: ["data", "publicAddress"]
  //     }
  //   ],
  //   values: [
  //     {
  //       field: ["ref"]
  //     },
  //     {
  //       field: ["data", "publicAddress"]
  //     },
  //     {
  //       field: ["data", "nonce"]
  //     },
  //     {
  //       field: ["data", "joiningDate"]
  //     },
  //     {
  //       field: ["data", "secretText"]
  //     }
  //   ]
  // }

  //   )

  try {
    const createUser: any = await faunaClient.query(
      q.Create(q.Collection("users"), {
        data: {
          publicAddress: lowerCaseAddress,
          isAdmin: true,
          nonce: nonce,
          secretText: secretText,
        },
      })
    );

    console.log("output", createUser);

    // const serverUrl = process.env.moralisServerUrl!
    // const appId = process.env.moralisApiId!

    // Moralis.start({ serverUrl, appId });

    // await Moralis.Cloud.run("watchEthAddress", {address: lowerCaseAddress})

    return {
      data: {
        publicAddress: lowerCaseAddress,
        nonce: nonce,
        joiningDate: createUser.ts,
      },
    };
  } catch (e) {
    const err: any = e;
    console.log(err.message);
    if (err.message === "instance not unique") {
      return generateError(
        `Public Address ${lowerCaseAddress} has already signed up`,
        { errorCode: error_Codes.refused },
        error_Types.refused
      );
    } else {
      throw e;
    }
  }
}
