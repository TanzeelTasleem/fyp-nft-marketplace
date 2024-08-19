
import { Context, AppSyncResolverEvent } from 'aws-lambda';
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../lambdaLayers/apiDependencies/errorHandlingTemplate'
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError
import {query as q, Client} from 'faunadb'
import {BlockChainStatus_Type} from './codegenTypes'
import {getCreateCollectionStatus} from './createCollection'
import {getMintNftStatus} from './mintNft'
import { getListNftStatus } from './listNft';

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

    if(!identity?.resolverContext.isAdmin){
        return generateError(`API will be only run by Admin`, { errorCode: error_Codes.unAuthorized }, error_Types.unAuthorized);
    }


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

          console.log(event)


        switch (event.arguments.input.statusType) {
            case BlockChainStatus_Type.Collection:
                return await getCreateCollectionStatus(faunaClient,event.arguments.input ); 
            case BlockChainStatus_Type.Mintnft:
                    return await getMintNftStatus(faunaClient,event.arguments.input ); 
            case BlockChainStatus_Type.Listnft:
                return await getListNftStatus(faunaClient,event.arguments.input ); 
    
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