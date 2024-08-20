import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
  UpdateCommand,
  UpdateCommandInput,
  UpdateCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { verify, decode } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sign as jwtSign } from "jsonwebtoken";
import { query as q, Client } from "faunadb";
import { MutationRefreshAccessTokenArgs } from "../codegenTypes";

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

export async function refreshAccessToken(
  input: MutationRefreshAccessTokenArgs,
  faunaClient: Client
): Promise<outputType> {
  const accessToken = input.accessToken;
  if (!accessToken) {
    return generateError(
      `Token is Required`,
      { errorCode: error_Codes.unAuthorized },
      error_Types.unAuthorized
    );
  }
  console.log("getAuthUser auth header : ", accessToken);

  try {
    const decodeJwt: any = decode(accessToken);

    console.log("decodedjwt", decodeJwt);

    if (!decodeJwt) {
      return generateError(
        `invalid token`,
        { errorCode: error_Codes.unAuthorized },
        error_Types.unAuthorized
      );
    }

    const getUser: any = await faunaClient.query(
      q.Map(
        q.Paginate(
          q.Match(
            q.Index("uniquePublicAddress"),
            decodeJwt.payload?.publicAddress
          )
        ),
        q.Lambda("result", q.Get(q.Var("result")))
      )
    );

    if (getUser.data.length === 0) {
      return generateError(
        `User with public address ${decodeJwt.payload?.publicAddress} not found`,
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

    var verifiedJwt: any = verify(accessToken, retrievedUserData.secretText);
    console.log("verifiedJwt = ", verifiedJwt);

    const newSecretText = uuidv4();

    const updateUser: any = await faunaClient.query(
      q.Update(item.ref, {
        data: {
          secretText: newSecretText,
        },
      })
    );

    let payload = { ...retrievedUserData };

    console.log("payload ", payload);

    const newAccessToken = jwtSign({ payload: payload }, newSecretText, {
      expiresIn: "7d",
    });

    console.log("accessToken ", newAccessToken);

    return { data: newAccessToken };
  } catch (e) {
    const err: any = e;
    return generateError(
      err.message,
      { errorCode: error_Codes.unAuthorized },
      error_Types.unAuthorized
    );
  }
}
