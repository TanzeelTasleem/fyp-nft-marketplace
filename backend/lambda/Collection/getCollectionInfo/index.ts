import {GetCollectionInfoInput, Collection,BlockChainStatus} from '../codegenTypes'
import * as AWS from "aws-sdk";
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import {query as q, Client} from 'faunadb'
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 
import {blockChainListenerEvent} from '../../../lambdaLayers/apiDependencies/commonTypes'

type outputType = ErrorStructure | { data: Collection };

export async function GetCollectionInfo(input:GetCollectionInfoInput, faunaClient:Client): Promise<outputType> {
    const {id} = input;



    try {

        const getCollection:any = await faunaClient.query(
            q.Map(
               q.Paginate(q.Match(q.Index("uniqueCollectionID"), id)),
               q.Lambda("result", q.Get(q.Var("result")))
               )
            )

        console.log('output',getCollection);

        if ( getCollection.data.length === 0){
            return generateError("collection not found", { errorCode: error_Codes.refused }, error_Types.refused);
        }
        
        const output:Collection = {...getCollection.data[0].data,ref:getCollection.data[0].ref.id};

        return {
            data: output
        };
    
    }
    catch (e) {
        const err:any = e;
        console.log(err.message);
        return generateError(err.message, { errorCode: error_Codes.refused }, error_Types.refused);
    }

}