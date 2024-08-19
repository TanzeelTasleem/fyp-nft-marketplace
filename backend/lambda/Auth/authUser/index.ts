import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { User, AuthUserOutput } from "../codegenTypes";

import { verify, decode } from "jsonwebtoken";
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
import { query as q, Client } from "faunadb";

type outputType = ErrorStructure | { data: AuthUserOutput };

export async function authUser(
  token: string,
  faunaClient: Client
): Promise<outputType> {
  const accessToken = token?.split(" ")[1] || "";
  console.log("getAuthUser auth header : ", accessToken);

  try {
    const decodeJwt: any = decode(accessToken);

    console.log("decodedjwt", decodeJwt);

    if (!decodeJwt) {
      return generateError(
        `Invalid token`,
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

    console.log(getUser);

    if (getUser.data.length > 0) {
      const item = getUser.data[0];
      var verifiedJwt: any = verify(accessToken, item.data.secretText);
      console.log("verifiedJwt = ", verifiedJwt);

      const getUserFollowersCount: any = await faunaClient.query(
        q.Count(
          q.Paginate(
            q.Match(
              q.Index("getUserFollowers"),
              verifiedJwt.payload.publicAddress
            ),
            { size: 10 }
          )
        )
      );

      const getUserFollowingCount: any = await faunaClient.query(
        q.Count(
          q.Paginate(
            q.Match(
              q.Index("getUserFollowings"),
              verifiedJwt.payload.publicAddress
            ),
            { size: 10 }
          )
        )
      );

      console.log("getUserFollowersCount ", getUserFollowersCount.data[0]);

      console.log("getUserFollowingCount ", getUserFollowingCount.data[0]);

      const output: AuthUserOutput = {
        userAuthData: {
          tokenExpiryDate: verifiedJwt.exp,
          nonce: verifiedJwt.payload.nonce,
          joiningDate: verifiedJwt.payload.joiningDate,
          publicAddress: verifiedJwt.payload.publicAddress,
        },
        userData: {
          ...verifiedJwt.payload,
          followersCount: getUserFollowersCount.data[0],
          followingsCount: getUserFollowingCount.data[0],
        },
      };

      console.log(output);

      return { data: output };
    } else {
      return generateError(
        `User with public address ${decodeJwt.payload?.publicAddress} not found`,
        { errorCode: error_Codes.notFound },
        error_Types.notFound
      );
    }
  } catch (e) {
    const err: any = e;
    return generateError(
      err.message,
      { errorCode: error_Codes.unAuthorized },
      error_Types.unAuthorized
    );
  }
}
