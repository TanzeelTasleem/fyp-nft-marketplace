import { decode,verify } from 'jsonwebtoken'
import { Context } from 'aws-lambda';
import {query as q, Client} from 'faunadb';

function generateAuthResponse(
    principalId: any,
    effect: any,
    methodArn: any,
    context?: any
  ): any {
    const policyDocument = generatePolicyDocument(effect, methodArn);
    return {
      principalId,
      policyDocument,
      context,
    };
}
  
function generatePolicyDocument(effect: any, methodArn: any) {
    if (!effect || !methodArn) return null;
  
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: "arn:aws:execute-api:*:*:*",
        },
      ],
    };
  
    return policyDocument;
}

export async function handler(event: any, context: Context) {

    const faunaSecret = process.env.faunaSecret!
    const faunaServer = process.env.faunaServer!
  
    var faunaClient = new Client({
        secret: faunaSecret,
        domain: faunaServer,
        // NOTE: Use the correct domain for your database's Region Group.
        port: 443,
        scheme: 'https',
      })


    try{
        const { authorizationToken } = event;
        const accessToken = authorizationToken.split(" ")[1] || "";
        console.log("getAuthUser auth header : ", accessToken);
    
        const decodeJwt:any = decode(accessToken);
    
        console.log('decodedjwt',decodeJwt)
    
        if (!decodeJwt){
            throw new Error('invalid token')
        }
    
        const getUser:any = await faunaClient.query(
            q.Map(
                q.Paginate(q.Match(q.Index("uniquePublicAddress"), decodeJwt.payload?.publicAddress)),
                q.Lambda("result", q.Get(q.Var("result")))
            )
        )
            
        console.log(getUser)
      
        
        if (getUser.data.length > 0){

            const item = getUser.data[0]
            const retrievedUserData: {joiningDate:string,secretText:string,publicAddress:string,nonce:string,name?:string,username?:string,refId:string} = {joiningDate: item.ts, nonce: item.data.nonce, publicAddress: item.data.publicAddress, secretText:item.data.secretText, refId: item.ref.id}
        
            
            var verifiedJwt:any = verify(accessToken, retrievedUserData.secretText);
            console.log("verifiedJwt = ",verifiedJwt);

            return generateAuthResponse(
                "user",
                "Allow",
                event.methodArn,
                verifiedJwt.payload
            );
        }

        else {
            return generateAuthResponse("user", "deny", event.methodArn);
        }

    }
    catch(error){
        console.log("error ", error);
        return generateAuthResponse("user", "deny", event.methodArn);
    }
}