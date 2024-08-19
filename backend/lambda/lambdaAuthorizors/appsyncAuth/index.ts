import { decode, verify } from "jsonwebtoken";
import { Context } from "aws-lambda";
import { query as q, Client } from "faunadb";

export async function handler(event: any, context: Context) {
  const faunaSecret = process.env.faunaSecret!;
  const faunaServer = process.env.faunaServer!;

  var faunaClient = new Client({
    secret: faunaSecret,
    domain: faunaServer,
    // NOTE: Use the correct domain for your database's Region Group.
    port: 443,
    scheme: "https",
  });

  try {
    const { authorizationToken } = event;
    const accessToken = authorizationToken.split(" ")[1] || "";
    console.log("getAuthUser auth header : ", accessToken);

    const decodeJwt: any = decode(accessToken);

    console.log("decodedjwt", decodeJwt);

    if (!decodeJwt) {
      throw new Error("invalid token");
    }

    const getUser: any = await faunaClient.query(
      q.Map(
        q.Paginate(
          q.Match(
            q.Index("uniquePublicAddress"),
            decodeJwt.payload?.publicAddress
          )
        ),
        q.Lambda("result", q.Get(q.Var("result")))
      )
    );

    console.log(getUser);

    if (getUser.data.length > 0) {
      const item = getUser.data[0];
      const retrievedUserData: {
        joiningDate: string;
        secretText: string;
        publicAddress: string;
        nonce: string;
        name?: string;
        username?: string;
        refId: string;
      } = {
        joiningDate: item.ts,
        nonce: item.data.nonce,
        publicAddress: item.data.publicAddress,
        secretText: item.data.secretText,
        refId: item.ref.id,
      };

      var verifiedJwt: any = verify(accessToken, retrievedUserData.secretText);
      console.log("verifiedJwt = ", verifiedJwt);

      const response = {
        isAuthorized: true,
        resolverContext: verifiedJwt.payload,
        deniedFields: [],
        ttlOverride: 10,
      };
      console.log(`response >`, JSON.stringify(response, null, 2));
      return response;
    } else {
      throw new Error(
        `User with public address ${decodeJwt.payload.publicAddress} not found`
      );
    }
  } catch (error) {
    console.log("error ", error);
    const response = {
      isAuthorized: false,
      resolverContext: null,
      deniedFields: [],
      ttlOverride: 10,
    };
    return response;
  }
}
