import {CreateCollectionInput, Collection,GetBlockChainStatusOutput,GetBlockChainStatusInput} from '../codegenTypes'
import * as AWS from "aws-sdk";
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import {query as q, Client} from 'faunadb'
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 
import {blockChainListenerEvent} from '../../../lambdaLayers/apiDependencies/commonTypes'

type outputType = ErrorStructure | { data: GetBlockChainStatusOutput|null };

export async function getListNftStatus(faunaClient:Client, input:GetBlockChainStatusInput): Promise<outputType> {
    const {id} = input;



    try {

        const getListNftData:any = await faunaClient.query(
            q.Map(
               q.Paginate(q.Match(q.Index("getListedNftByToken"), id)),
               q.Lambda("result", q.Get(q.Var("result")))
               )
            )

        console.log('output',getListNftData);
        
        let output:GetBlockChainStatusOutput|null = null;
        if (getListNftData.data.length>0){
            const status = getListNftData.data[0].data.blockChainStatus;

            output = {status:status}
        
        }


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