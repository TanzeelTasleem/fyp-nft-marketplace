import { DynamoDBDocumentClient, UpdateCommandOutput, UpdateCommand, UpdateCommandInput} from "@aws-sdk/lib-dynamodb";
import {UpdateProfileInput, User} from '../codegenTypes'
import * as AWS from "aws-sdk";
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import {query as q, Client} from 'faunadb'

const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 

type outputType = ErrorStructure | { data: User };

export async function updateProfile(input:UpdateProfileInput, faunaClient:Client, publicAddress: string,refId:string): Promise<outputType> {
    const {bio, email, username, displayName, coverImage, profileImage} = input;

    console.log("publicAddress ", publicAddress)

    let lowerCaseAddress = publicAddress.toLocaleLowerCase();

    if (!username){

        const getUser:any = await faunaClient.query(
            q.Get(
                q.Ref(q.Collection("users"), refId)
               )
             )
             
             console.log('getUser',getUser)
             if (!getUser.data.username){
                return generateError(`You cannot update your profie without entering a username`, { errorCode: error_Codes.unAuthorized }, error_Types.unAuthorized);
 
             }
         
    }


    let userProfileInfo: UpdateProfileInput = {}

    bio? userProfileInfo.bio = bio: null;
    email? userProfileInfo.email = email: null;
    displayName? userProfileInfo.displayName = displayName: null;
    username? userProfileInfo.username = username.toLowerCase(): null;
    coverImage? userProfileInfo.coverImage = coverImage : null;
    profileImage? userProfileInfo.profileImage = profileImage : null;


    // if(coverImage){

    //     let s3bucket = new AWS.S3({ params: { Bucket: `${process.env.BUCKET}` }});

    //     const options = {partSize: 10 * 1024 * 1024, queueSize: 1};
    //     const params = {
    //         Key: `users/${publicAddress}/cover_image.webp`,
    //         Body: Buffer.from(coverImage.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64'),
    //         ContentType: "image/webp",
    //         CacheControl: 'max-age=86400',
    //         Bucket: process.env.BUCKET!
    //     };
    //     const image_save = await s3bucket.upload(params, options).promise();

       
    //     userProfileInfo.coverImage = image_save.Key;

    // }

    // if(profileImage){

    //     let s3bucket = new AWS.S3({ params: { Bucket: `${process.env.BUCKET}` }});

    //     const options = {partSize: 10 * 1024 * 1024, queueSize: 1};
    //     const params = {
    //         Key: `users/${publicAddress}/profile_image.webp`,
    //         Body: Buffer.from(profileImage.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64'),
    //         ContentType: "image/webp",
    //         CacheControl: 'max-age=86400',
    //         Bucket: process.env.BUCKET!
    //     };
    //     const image_save = await s3bucket.upload(params, options).promise();
        
    //      userProfileInfo.profileImage = image_save.Key;

    // }


    try {

    const updateUser:any = await faunaClient.query(
        q.Update(
            q.Ref(q.Collection("users"), refId),
            {
                data:{
                   ...userProfileInfo
                }
            }
           )
        )


    console.log('updateUser',updateUser)


   

     
    const output:User = { publicAddress: lowerCaseAddress, refId: refId, ...updateUser.data }


    return {
        data: output
    };



}
catch (e) {
   const err:any = e;
   console.log(err.message);
   if (err.message === "instance not unique"){
       return generateError(`Username ${username} is not available`, { errorCode: error_Codes.refused }, error_Types.refused);
   }
   else {
       throw e
   }
 
 }

}