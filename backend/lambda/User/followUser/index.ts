

const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { FollowUserInput } from "../codegenTypes";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 
import {query as q, Client} from 'faunadb'

type outputType = ErrorStructure | { data: string }


export async function followUser(input:FollowUserInput, faunaClient: Client, myPublicAddress: string,refId:string):Promise<outputType>{

    console.log(input)

    let userAddress = input.publicAddress.toLocaleLowerCase();
    let myAddress = myPublicAddress.toLocaleLowerCase();

    try{


        const getFollow : any = await faunaClient.query(
            q.Map(
               q.Paginate(q.Match(q.Index("checkFollowing"), myAddress, userAddress)),
               q.Lambda("result", q.Get(q.Var("result")))
               )
            )
          
        if(getFollow.data.length === 0){
            const follow :any = await faunaClient.query(
                q.Create(
                  q.Collection('followings'),
                  { data: { from: myAddress, to: userAddress } }
                )
            )

            return {data: "Followed"};
        }
        else{
            const deleteItem :any = await faunaClient.query(
                q.Delete(
                    getFollow?.data[0].ref
                )
            )

            return {data: "UnFollowed"};

        }

        // return {data: "UnFollowed"};        

    }

        catch (e) {
            const err:any = e;
            console.log(err.message);
            if (err.message === "The conditional request failed"){
                return generateError("You are already following this user", { errorCode: error_Codes.refused }, error_Types.refused);
            }
            else {
                throw e
            }
    
    }

}