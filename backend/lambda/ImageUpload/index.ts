import type {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {S3} from 'aws-sdk';

if (!process.env.BUCKET_NAME)
    throw new Error('Environment variable Bucket name is required.');

type Event = APIGatewayProxyEventV2 & {
    queryStringParameters: {fileType: string, filePath: string};
};


interface resolverContext {
    publicAddress: string
    joiningDate: string
    username?: string
    refId:string
    isAdmin?:boolean
}

exports.handler = async (event: Event): Promise<APIGatewayProxyResultV2> => {
    console.log('Event is', JSON.stringify(event, null, 2));

    const identity: any = event.requestContext;


    try {

        if(!identity.authorizer?.isAdmin){
            throw new Error(
                'Only Admin can access it!',
            );
        }

        if (!event.queryStringParameters?.fileType)
            throw new Error(
                'Querystring parameter fileType must be provided when creating a presigned URL, i.e. ?fileType=image/png',
            );

        const {fileType, filePath} = event.queryStringParameters;
        const decodedPath = base64Parser(filePath, "Decode");
        console.log("decodedPath ", decodedPath)
        const presignedPost = await createPresignedPost({fileType, filePath: decodedPath});

        console.log("presignedPost ", presignedPost)

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
            },
            body: JSON.stringify({
            ...presignedPost,
            filePath,
            }),
        };
    } catch (error) {
        console.log('ERROR is:', error);
        if (error instanceof Error) {
            return {statusCode: 400, body: JSON.stringify({error: error.message})};
        }
        return {
            statusCode: 400,
            body: JSON.stringify({error: JSON.stringify(error)}),
        };
    }
}

type GetPresignedPostUrlParams = {
    fileType: string;
    filePath: string;
};


export function createPresignedPost({
    fileType,
    filePath,
  }: GetPresignedPostUrlParams): Promise<S3.PresignedPost> {
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Fields: {
          key: filePath,
          acl: 'public-read'
        },
      Conditions: [
        // content length restrictions: 0-1MB]
        // specify content-type to be more generic- images only
        // ['starts-with', '$Content-Type', 'image/'],
        // ['starts-with', '$Content-Type', 'video/'],
        ['starts-with', '$Content-Type', ''],

        // ['eq', '$Content-Type', fileType],
      ],
      // number of seconds for which the presigned policy should be valid
      Expires: 600,
    };
  
    const s3 = new S3();
    return (s3.createPresignedPost(
      params,
    ) as unknown) as Promise<S3.PresignedPost>;
}

export const base64Parser = (str: string, method: "Encode" | "Decode") => {
    if (method === "Encode") { return Buffer.from(str, 'utf-8').toString("base64") }
    else { return Buffer.from(str, "base64").toString("utf-8") }
 }
  
// function generateId() {
//     let result = '';
//     const characters =
//       'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!-.*()';
//     const length = 10;
  
//     const charactersLength = characters.length;
//     for (let i = 0; i < length; i += 1) {
//       result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }
  
//     const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
//     return `${result}`;
// }