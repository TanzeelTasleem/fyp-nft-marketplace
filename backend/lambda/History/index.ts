
import { Context, AppSyncResolverEvent } from 'aws-lambda';
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../lambdaLayers/apiDependencies/errorHandlingTemplate'
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError
import {query as q, Client} from 'faunadb'
import {GetHistoryByNFT} from './GetHistoryByNFT';

interface appsyncLambdaAuthContext {
    resolverContext: resolverContext
}

interface resolverContext {
    publicAddress: string
    joiningDate: string
    username?: string
    refId:string
    isAdmin?:boolean
}

exports.handler = async (event: AppSyncResolverEvent<any>) => {

    const identity = event.identity ? event.identity as unknown as appsyncLambdaAuthContext : undefined

    try {
   
        const faunaSecret = process.env.faunaSecret!
        const faunaServer = process.env.faunaServer!
        console.log('faunasecret',faunaSecret)
        console.log('faunaserver',faunaServer)


        var faunaClient = new Client({
            secret: faunaSecret,
            domain: faunaServer,
            // NOTE: Use the correct domain for your database's Region Group.
            port: 443,
            scheme: 'https',
          })

        console.log("event.info.fieldName ", event.info.fieldName)

        switch (event.info.fieldName) {
            case "getHistoryByNFT":
                    return await GetHistoryByNFT(event.arguments.input, faunaClient); 
            default:
                throw new Error("invalid query");
        }

    }

    catch (e) {
        const err: any = e

        console.log("ERROR FROM MAIN", err);
        return generateError(err.message, { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);
    }

}