
import { getUserProfile } from "./getUserProfile";
import { Context, AppSyncResolverEvent } from 'aws-lambda';
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { followUser } from "./followUser";
import { usernameAvailable } from "./usernameAvailable";
import { updateProfile } from "./updateProfile";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError
import {query as q, Client} from 'faunadb'
import { getUsersNfts } from "./getUsersNfts";
import { getUserListedNfts } from "./getUserListedNfts";
//import { getUserListedNfts } from "./getUserListedNfts";
// import {addUserToAdminGroup} from "./addUserToAdminGroup";

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
            case "getUserProfile":
                return await getUserProfile(event.arguments.input, faunaClient, identity?.resolverContext.publicAddress!);
            case "followUser":
                return await followUser(event.arguments.input, faunaClient, identity?.resolverContext.publicAddress!, identity?.resolverContext.refId!);
            case "usernameAvailable":
                return await usernameAvailable(event.arguments, faunaClient); 
            // case "addUserToAdminGroup":
            //     return await addUserToAdminGroup(event.arguments.input, faunaClient, identity?.resolverContext.isAdmin!);
            case "updateProfile":
                return await updateProfile(event.arguments.input, faunaClient, identity?.resolverContext.publicAddress!, identity?.resolverContext.refId!);
            case "getUsersNfts":
                return await getUsersNfts(event.arguments.input, faunaClient);
            case "getUserListedNfts":
                    return await getUserListedNfts(event.arguments.input, faunaClient);
    


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