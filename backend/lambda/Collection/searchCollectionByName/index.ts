import {SearchCollectionByNameInput, GetCollectionsOutput, Collection} from '../codegenTypes'
import * as AWS from "aws-sdk";
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import {query as q, Client} from 'faunadb'
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 

type outputType = ErrorStructure | { data: GetCollectionsOutput };

export async function SearchCollectionByName(input:SearchCollectionByNameInput, faunaClient:Client): Promise<outputType> {
    const {pageSize,after,before,name} = input;

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

    try {

        const getColls:any = await faunaClient.query(
            q.Map(
                q.Filter(
                  q.Paginate(
                    q.Match(q.Index("searchCollectionByName")),
                    { 
                        size: pageSize,
                        after : afterCursor,
                        before: beforeCursor
                    }
                  ),
                  q.Lambda("result",
                    q.ContainsStr(
                      q.LowerCase(q.Select(["data","name"],q.Get(q.Var("result")))),
                      name.toLowerCase()
                    )
                  )
                ),
                q.Lambda("result", q.Get(q.Var("result")))
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
    catch (e) {
        const err:any = e;
        console.log(err.message);
        return generateError(err.message, { errorCode: error_Codes.refused }, error_Types.refused);
    }

}

function createPaginationCursor(input:string[]){

    let afterArray = []
    afterArray[0] = q.Ref(q.Collection("collections"), input[0])
    return afterArray
}