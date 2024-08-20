const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { GetCollectionsInput, GetCollectionsOutput } from "../codegenTypes";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError
import {query as q, Client} from 'faunadb'
import { Collection } from "../../Auth/codegenTypes";


type outputType = ErrorStructure | { data: GetCollectionsOutput }

export async function GetCollections(input: GetCollectionsInput, faunaClient: Client):Promise<outputType> {

    console.log("input ", input);
    const {pageSize,after,before} = input;

    if (after && before){
        return generateError('Invalid pagination cursor, you can either define after or before, not both!', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);
    }

    if (after && after.length!== 1){
        return generateError('Invalid after cursor for pagination', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);
    }

    if (before && before.length!== 1){
        return generateError('Invalid before cursor for pagination', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError); 
    }

    let afterCursor;
    let beforeCursor;

    if (after){
        afterCursor = createPaginationCursor(after)
    }
    if (before){
        beforeCursor = createPaginationCursor(before)
    }

    const getColls:any = await faunaClient.query(
        q.Map(
            q.Paginate(
                q.Documents(q.Collection('collections')),
                { 
                    size: pageSize,
                    after : afterCursor,
                    before: beforeCursor
                }
            ),
            q.Lambda('collectionRef', q.Get(q.Var('collectionRef')))
        )
    )

    console.log("getColls ", JSON.stringify(getColls, undefined , 2))

     let afterOutput:string[] = []
     let beforeOutput:string[] = []


     if (getColls.after){
         console.log('after', getColls.after[0].id)
        afterOutput[0] = getColls.after[0].id
     }

     if (getColls.before){
        console.log('before', getColls.before[0].id)
        beforeOutput[0] = getColls.before[0].id
    }

     let collOutput: Collection[] = []

     for (let list of getColls.data){
        console.log("list ", list.data)
        const collection : Collection = {...list.data, ref: list.ref.id}
        collOutput.push(collection)

     }

     console.log("collOutput ", collOutput);


     let output:GetCollectionsOutput = {collections:collOutput}

     if (afterOutput)
     output.after = afterOutput

     if(beforeOutput)
     output.before = beforeOutput

     console.log("output ", output)

     return {data:output}

}



function createPaginationCursor(input:string[]){

    let afterArray = []
    afterArray[0] = q.Ref(q.Collection("collections"), input[0])
    return afterArray
}