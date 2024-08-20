
import { Context, AppSyncResolverEvent } from 'aws-lambda';
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import {createCollection} from './createCollection'
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError
import {query as q, Client} from 'faunadb'
import {blockChainListenerEvent} from '../../lambdaLayers/apiDependencies/commonTypes'
import {mintNft} from './mintNft'
import {listNft} from './listNft'

exports.handler = async (event: blockChainListenerEvent, context:Context) => {

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

        switch (event.type) {

            case "createCollection":
                return await createCollection(faunaClient,event.transactionHash,event.data,context,event.invokeCounter);
            case "mintNft":
                return await mintNft(faunaClient,event.transactionHash,event.data,context,event.invokeCounter);
            case "listNft":
                return await listNft(faunaClient,event.transactionHash,event.data,context,event.invokeCounter);

            default:
                throw new Error("invalid query");
        }

    }

    catch (e) {
        const err: any = e

        console.log("ERROR FROM MAIN", err);
        throw new Error('blockchain tx failed')
    }

}