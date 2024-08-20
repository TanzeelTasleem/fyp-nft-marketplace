import { DynamoDBDocumentClient,QueryCommand,QueryCommandInput, QueryCommandOutput} from "@aws-sdk/lib-dynamodb";

const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { User, QueryCollectionIdAvailableArgs } from "../codegenTypes";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 
import {query as q, Client} from 'faunadb'

type outputType = ErrorStructure | { data: boolean }


export async function collectionIdAvailable(input:QueryCollectionIdAvailableArgs, faunaClient:Client, isAdmin: boolean): Promise<outputType> {
    console.log("input ", input)

    const {id} = input

    if(!isAdmin){
        return generateError(`API will be only run by Admin`, { errorCode: error_Codes.unAuthorized }, error_Types.unAuthorized);
    }

    const getData:any = await faunaClient.query(
        q.Map(
           q.Paginate(q.Match(q.Index("uniqueCollectionID"), id.toLowerCase())),
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