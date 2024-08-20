import { signup } from "./signup";
import { findUser } from "./findUser";
import { authUser } from "./authUser";
import { authenticate } from "./authenticate";
import { AppSyncResolverEvent } from "aws-lambda";
const errorHandlingTemplate = require("/opt/errorHandlingTemplate");
import {
  errorCodes,
  errorTypes,
  returnError,
} from "../../lambdaLayers/apiDependencies/errorHandlingTemplate";
import { refreshAccessToken } from "./refreshAccessToken";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes;
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes;
const generateError = errorHandlingTemplate.returnError as typeof returnError;
import { query as q, Client } from "faunadb";

exports.handler = async (event: AppSyncResolverEvent<any>) => {
  console.log(JSON.stringify(event, null, 2));

  try {
    const faunaSecret = process.env.faunaSecret!;
    const faunaServer = process.env.faunaServer!;
    console.log("faunasecret", faunaSecret);
    console.log("faunaserver", faunaServer);

    var faunaClient = new Client({
      secret: faunaSecret,
      domain: faunaServer,
      // NOTE: Use the correct domain for your database's Region Group.
      port: 443,
      scheme: "https",
    });

    switch (event.info.fieldName) {
      case "findUser":
        return await findUser(event.arguments, faunaClient);
      case "signup":
        return await signup(event.arguments, faunaClient);
      case "authenticate":
        return await authenticate(event.arguments, faunaClient);
      case "authUser":
        return await authUser(
          event.request.headers?.authorization!,
          faunaClient
        );
      case "refreshAccessToken":
        return await refreshAccessToken(event.arguments, faunaClient);
      default:
        throw new Error("invalid query");
    }
  } catch (e) {
    const err: any = e;

    console.log("ERROR FROM MAIN", err);
    return generateError(
      err.message,
      { errorCode: error_Codes.internalServerError },
      error_Types.internalServerError
    );
  }
};
