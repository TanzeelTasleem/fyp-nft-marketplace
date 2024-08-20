import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from "@aws-cdk/aws-apigateway";
import * as s3 from '@aws-cdk/aws-s3';

interface props {
    api: appsync.GraphqlApi
    apiDependenciesLayer: lambda.LayerVersion
    faunaSecret:string
    faunaServer:string
    apiGatewayAuthLambda: lambda.Function;
    s3Bucket: s3.Bucket;
  }

export class MicroServiceImageUpload extends cdk.Construct {
    
    constructor(scope: cdk.Construct, id: string, props: props) {
      super(scope, id);

        //  rest api to downloadCDKContextFile
        const api = new apigw.RestApi(scope, "downloadCDKContextFileApigateway", {
            restApiName: `uploads3Image`,
            defaultCorsPreflightOptions: {
                allowOrigins: apigw.Cors.ALL_ORIGINS,
                allowMethods: apigw.Cors.ALL_METHODS, // this is also the default
            },
            deploy: true,
        });

        // api gateway authorizor construct
        const auth = new apigw.TokenAuthorizer(
            scope,
            "downloadCDKContextFileAuthorizorApigateway",
            {
                handler: props.apiGatewayAuthLambda,
            }
        );

        const handler = new lambda.Function(this, 'microServiceNftLambda', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/ImageUpload'),
            memorySize: 1024,
            layers: [props.apiDependenciesLayer],
            timeout: cdk.Duration.seconds(10),
            environment: {
                BUCKET_NAME: props.s3Bucket.bucketName
            }
        });

        const checkout = api.root.addResource("s3-upload-url");
        const getAllIntegration = new apigw.LambdaIntegration(handler);
        checkout.addMethod("GET", getAllIntegration, {
        authorizer: auth,
        });

        props.s3Bucket.grantPut(handler);
        props.s3Bucket.grantPutAcl(handler);
        
        handler.addEnvironment('faunaServer', props.faunaServer);
        handler.addEnvironment('faunaSecret', props.faunaSecret);

    }
  
}