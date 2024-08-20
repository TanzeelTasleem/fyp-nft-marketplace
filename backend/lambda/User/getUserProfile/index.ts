import { DynamoDBDocumentClient,GetCommand,GetCommandInput, GetCommandOutput} from "@aws-sdk/lib-dynamodb";

const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { UserShow, GetUserProfileInput } from "../codegenTypes";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 
import {query as q, Client} from 'faunadb'

type outputType = ErrorStructure | { data: UserShow }


export async function getUserProfile(input:GetUserProfileInput, faunaClient:Client, myPublicAddress?: string): Promise<outputType> {

    const {publicAddress,refId,username} = input

    if (publicAddress){

        if (refId || username){

            return generateError(`You can get user profile through 1 method only`, { errorCode: error_Codes.badRequest }, error_Types.badRequest);

        }
    }

    if (refId){

        if (publicAddress || username){

            return generateError(`You can get user profile through 1 method only`, { errorCode: error_Codes.badRequest }, error_Types.badRequest);

        }

    }

     if (username){

        if (publicAddress || refId){

            return generateError(`You can get user profile through 1 method only`, { errorCode: error_Codes.badRequest }, error_Types.badRequest);

        }

    }



    if (publicAddress){

        const getUser:any = await faunaClient.query(
            q.Map(
               q.Paginate(q.Match(q.Index("uniquePublicAddress"), publicAddress.toLowerCase())),
               q.Lambda("result", q.Get(q.Var("result")))
               )
            )
             
        if (getUser.data.length > 0){
            const item = getUser.data[0]

            delete item.data.nonce
            delete item.data.secretText

            // let userAddress = item.data.publicAddress.toLowerCase();
            // let myAddress = myPublicAddress.toLowerCase();
            let follow: boolean = false;
            if(myPublicAddress){
                const getFollow : any = await faunaClient.query(
                    q.Map(
                       q.Paginate(q.Match(q.Index("checkFollowing"), myPublicAddress.toLowerCase(), item.data.publicAddress.toLowerCase())),
                       q.Lambda("result", q.Get(q.Var("result")))
                       )
                    )
    
                if(getFollow.data.length === 0){
                    follow = false;
                }
                else{
                    follow = true;
                }
            }

            const getUserFollowersCount : any = await faunaClient.query(
                q.Count(
                   q.Paginate(q.Match(q.Index("getUserFollowers"), item.data.publicAddress.toLowerCase()), {size: 10})
                   )
                )

            const getUserFollowingCount : any = await faunaClient.query(
                q.Count(
                    q.Paginate(q.Match(q.Index("getUserFollowings"), item.data.publicAddress.toLowerCase()), {size: 10})
                    )
                )

            console.log("getUserFollowersCount ", getUserFollowersCount.data[0])

            console.log("getUserFollowingCount ", getUserFollowingCount.data[0])

           const output:UserShow = {refId: item.ref.id, ...item.data, followersCount: getUserFollowersCount.data[0], followingsCount: getUserFollowingCount.data[0], followed: follow}
       
           return {data:output}
        }

        else {
            return generateError(`User with public address ${publicAddress} not found`, { errorCode: error_Codes.notFound }, error_Types.notFound);
        }

    }

    if (username){

        const getUser:any = await faunaClient.query(
            q.Map(
               q.Paginate(q.Match(q.Index("uniqueUsername"), username.toLowerCase())),
               q.Lambda("result", q.Get(q.Var("result")))
               )
             )
             
            if (getUser.data.length > 0){
       
                const item = getUser.data[0]

                delete item.data.nonce
                delete item.data.secretText

                // let userAddress = item.data.publicAddress.toLowerCase();
                // let myAddress = myPublicAddress.toLowerCase();
                let follow: boolean = false;
                if(myPublicAddress){
                    const getFollow : any = await faunaClient.query(
                        q.Map(
                        q.Paginate(q.Match(q.Index("checkFollowing"), myPublicAddress.toLowerCase(), item.data.publicAddress.toLowerCase())),
                        q.Lambda("result", q.Get(q.Var("result")))
                        )
                        )
        
                    if(getFollow.data.length === 0){
                        follow = false;
                    }
                    else{
                        follow = true;
                    }
                }

                const getUserFollowersCount : any = await faunaClient.query(
                    q.Count(
                       q.Paginate(q.Match(q.Index("getUserFollowers"), item.data.publicAddress.toLowerCase()), {size: 10})
                       )
                    )
    
                const getUserFollowingCount : any = await faunaClient.query(
                    q.Count(
                        q.Paginate(q.Match(q.Index("getUserFollowings"), item.data.publicAddress.toLowerCase()), {size: 10})
                        )
                    )
    
                console.log("getUserFollowersCount ", getUserFollowersCount.data[0])
    
                console.log("getUserFollowingCount ", getUserFollowingCount.data[0])
    
                const output:UserShow = {refId: item.ref.id, ...item.data, followersCount: getUserFollowersCount.data[0], followingsCount: getUserFollowingCount.data[0], followed: follow}

                return {data:output}
            }

           else {
            return generateError(`User with username ${username} not found`, { errorCode: error_Codes.notFound }, error_Types.notFound);

           }
           

    }


    if (refId){

        const getUser:any = await faunaClient.query(
            q.Get(
                q.Ref(q.Collection("users"), refId)
               )
             )
             
             console.log('getUser',getUser)

            if (getUser){
                delete getUser.data.nonce
                delete getUser.data.secretText

                // let userAddress = getUser.data.publicAddress.toLowerCase();
                // let myAddress = myPublicAddress.toLowerCase();
                let follow: boolean = false;
                if(myPublicAddress){
                    const getFollow : any = await faunaClient.query(
                        q.Map(
                            q.Paginate(q.Match(q.Index("checkFollowing"), myPublicAddress.toLowerCase(), getUser.data.publicAddress.toLowerCase())),
                            q.Lambda("result", q.Get(q.Var("result")))
                        )
                    )
        
                    if(getFollow.data.length === 0){
                        follow = false;
                    }
                    else{
                        follow = true;
                    }
                }

                const getUserFollowersCount : any = await faunaClient.query(
                    q.Count(
                    q.Paginate(q.Match(q.Index("getUserFollowers"), getUser.data.publicAddress.toLowerCase()), {size: 10})
                    )
                    )

                const getUserFollowingCount : any = await faunaClient.query(
                    q.Count(
                        q.Paginate(q.Match(q.Index("getUserFollowings"), getUser.data.publicAddress.toLowerCase()), {size: 10})
                        )
                    )

                console.log("getUserFollowersCount ", getUserFollowersCount.data[0])

                console.log("getUserFollowingCount ", getUserFollowingCount.data[0])

                const output:UserShow = {refId: getUser.ref.id, ...getUser.data, followersCount: getUserFollowersCount.data[0], followingsCount: getUserFollowingCount.data[0], followed: follow}

                return {data:output}
            }

            else {
                return generateError(`User with refId ${refId} not found`, { errorCode: error_Codes.notFound }, error_Types.notFound);
    
            }
            

    }


    return generateError(`Enter a value for atleast 1 input`, { errorCode: error_Codes.badRequest }, error_Types.badRequest);



}