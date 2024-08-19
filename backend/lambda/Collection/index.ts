
import { CreateCollection } from "./createCollection";
import { UpdateCollection } from "./UpdateCollection";
import { collectionIdAvailable } from "./collectionIdAvailable";
import { GetCollections } from "./GetCollections";
import { GetCollectionInfo } from "./getCollectionInfo";
import { SearchCollectionByName } from "./searchCollectionByName";
import { Context, AppSyncResolverEvent } from 'aws-lambda';
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../lambdaLayers/apiDependencies/errorHandlingTemplate'
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError
import {query as q, Client} from 'faunadb'
import { GetCollectionNfts } from "./getCollectionNfts";

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

        switch (event.info.fieldName) {
            case "collectionIdAvailable":
                return await collectionIdAvailable(event.arguments, faunaClient, identity?.resolverContext.isAdmin!); 
            case "createCollection":
                return await CreateCollection(event.arguments.input, faunaClient, identity?.resolverContext.publicAddress!, identity?.resolverContext.refId!, identity?.resolverContext.isAdmin!);
            case "updateCollection":
                return await UpdateCollection(event.arguments.input, faunaClient, identity?.resolverContext.publicAddress!, identity?.resolverContext.refId!, identity?.resolverContext.isAdmin!);
            case "getCollectionInfo":
                return await GetCollectionInfo(event.arguments.input, faunaClient);
            case "getCollections":
                return await GetCollections(event.arguments.input, faunaClient);
            case "searchCollectionByName":
                return await SearchCollectionByName(event.arguments.input, faunaClient);
            case "getCollectionNfts":
                    return await GetCollectionNfts(event.arguments.input, faunaClient);
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