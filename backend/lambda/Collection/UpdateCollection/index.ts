import {CreateCollectionInput, Collection,BlockChainStatus} from '../codegenTypes'
import * as AWS from "aws-sdk";
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import {query as q, Client} from 'faunadb'
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 
import {blockChainListenerEvent} from '../../../lambdaLayers/apiDependencies/commonTypes'
import { UpdateCollectionInput } from '../../Auth/codegenTypes';

type outputType = ErrorStructure | { data: Collection };

export async function UpdateCollection(input:UpdateCollectionInput, faunaClient:Client, publicAddress: string, refId:string, isAdmin: boolean): Promise<outputType> {
    const {name, description, category, ref, coverImage, profileImage} = input;

    if(!isAdmin){
        return generateError(`API will be only run by Admin`, { errorCode: error_Codes.unAuthorized }, error_Types.unAuthorized);
    }

    let collectionInput: Collection = {}

    name? collectionInput.name = name: null;
    description? collectionInput.description = description: null;
    category? collectionInput.category = category : null;
    coverImage? collectionInput.coverImage = coverImage : null;
    profileImage? collectionInput.profileImage = profileImage : null;
    
    try {

        const updateCollection:any = await faunaClient.query(
            q.Update(
                q.Ref(q.Collection("collections"), ref),
                {
                    data:{
                       ...collectionInput
                    }
                }
               )
        )

        console.log('updateCollection',updateCollection)

        const output:Collection = { ...updateCollection.data }

        return {
            data: output
        };
    }
    catch (e) {
        const err:any = e;
        console.log("err ",err.message);
        return generateError(err.message, { errorCode: error_Codes.refused }, error_Types.refused);
    }

}