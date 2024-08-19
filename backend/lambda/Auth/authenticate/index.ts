import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { MutationAuthenticateArgs, User } from "../codegenTypes";
import { bufferToHex } from "ethereumjs-util";
import { recoverPersonalSignature } from "eth-sig-util";
import { sign as jwtSign } from "jsonwebtoken";
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

type outputType = ErrorStructure | { data: string };

export async function authenticate(
  input: MutationAuthenticateArgs,
  faunaClient: Client
): Promise<outputType> {
  console.log("input ", input);
  const { address, signature } = input;

  let lowerCaseAddress = address.toLocaleLowerCase();

  const getUser: any = await faunaClient.query(
    q.Map(
      q.Paginate(q.Match(q.Index("uniquePublicAddress"), lowerCaseAddress)),
      q.Lambda("result", q.Get(q.Var("result")))
    )
  );

  console.log(getUser);

  if (getUser.data.length === 0) {
    return generateError(
      `User with public address ${lowerCaseAddress} not found`,
      { errorCode: error_Codes.notFound },
      error_Types.notFound
    );
  }

  const item = getUser.data[0];
  const retrievedUserData = {
    joiningDate: item.ts,
    refId: item.ref.id,
    ...item.data,
  };

  console.log("retrievedData", retrievedUserData);

  const message = `My App Auth Service Signing nonce: ${retrievedUserData.nonce}`;
  const msgBufferHex = bufferToHex(Buffer.from(message, "utf8"));
  console.log("msgBufferHex ", msgBufferHex);
  const addr = recoverPersonalSignature({
    data: msgBufferHex,
    sig: signature,
  });

  console.log("addr ", addr);

  if (lowerCaseAddress !== addr.toLowerCase()) {
    return generateError(
      `Signature does not match`,
      { errorCode: error_Codes.unAuthorized },
      error_Types.unAuthorized
    );
  }

  const newNonce = Math.floor(Math.random() * 10000);

  const updateUser: any = await faunaClient.query(
    q.Update(item.ref, {
      data: {
        nonce: newNonce,
        // isAdmin: true
      },
    })
  );

  console.log("updateUser", updateUser);

  const secretText = retrievedUserData.secretText;
  let payload = { ...retrievedUserData };

  console.log("payload ", payload);
  console.log("secretText ", secretText);

  const accessToken = jwtSign({ payload: payload }, secretText, {
    expiresIn: "7d",
  });

  console.log("accessToken ", accessToken);

  return { data: accessToken };
}
