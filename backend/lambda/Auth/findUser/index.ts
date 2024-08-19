import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { QueryFindUserArgs, User, UserAuthData } from "../codegenTypes";

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

type outputType = ErrorStructure | { data: UserAuthData };

export async function findUser(
  input: QueryFindUserArgs,
  faunaClient: Client
): Promise<outputType> {
  let lowerCaseAddress = input.address.toLocaleLowerCase();

  const getUser: any = await faunaClient.query(
    q.Map(
      q.Paginate(q.Match(q.Index("uniquePublicAddress"), lowerCaseAddress)),
      q.Lambda("result", q.Get(q.Var("result")))
    )
  );

  if (getUser.data.length > 0) {
    const item = getUser.data[0];
    const output: UserAuthData = {
      joiningDate: item.ts,
      nonce: item.data.nonce,
      publicAddress: item.data.publicAddress,
    };

    return { data: output };
  } else {
    return generateError(
      `User with public address ${lowerCaseAddress} not found`,
      { errorCode: error_Codes.notFound },
      error_Types.notFound
    );
  }
}
