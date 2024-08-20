import { DynamoDBDocumentClient,QueryCommand,QueryCommandInput, QueryCommandOutput} from "@aws-sdk/lib-dynamodb";

const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { User, QueryUsernameAvailableArgs } from "../codegenTypes";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 
import {query as q, Client} from 'faunadb'

type outputType = ErrorStructure | { data: boolean }


export async function usernameAvailable(input:QueryUsernameAvailableArgs, faunaClient:Client): Promise<outputType> {
    console.log("input ", input)

    const {username} = input



    const getData:any = await faunaClient.query(
        q.Map(
           q.Paginate(q.Match(q.Index("uniqueUsername"), username.toLowerCase())),
           q.Lambda("result", q.Get(q.Var("result")))
           )
         )
         
console.log(getData.data)

       if (getData.data.length > 0){
   
        return {data:false}
       }

       else {
           return {data:true}
       }
   
}