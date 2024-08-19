import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import { MetaMaskAuth } from './Auth';
import * as s3 from '@aws-cdk/aws-s3';
import { Annotations, Duration } from '@aws-cdk/core';
import { MicroServiceUser } from './user';
import {MicroServiceCollection} from "./collection";
import {MicroServiceNfts} from './nfts'
import {MicroServiceHistory} from './history'
import * as apigw from "@aws-cdk/aws-apigateway";

import { MicroServiceImageUpload } from './ImageUpload';
export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const moralisServerUrl = scope.node.tryGetContext("moralisServerUrl");
    const moralisApiId = scope.node.tryGetContext("moralisAppId");
    const faunaSecret = scope.node.tryGetContext("faunaSecret");
    const faunaServer = scope.node.tryGetContext("faunaServer")
    const moralisApiKey = scope.node.tryGetContext("moralisApiKey")
    const alchemyAPIKEY= scope.node.tryGetContext("alchemyAPIKEY")
    const chain = scope.node.tryGetContext("chain")

    if (!moralisServerUrl) {
      Annotations.of(this).addError("Error: Please enter the moralis server url in the context file");
    }

    if (!moralisApiId) {
      Annotations.of(this).addError("Error: Please enter the moralis api id in the context file");
    }

    if (!faunaSecret) {
      Annotations.of(this).addError("Error: Please enter the fauna secret in the context file");
    }


    if (!faunaServer) {
      Annotations.of(this).addError("Error: Please enter the fauna server in the context file");
    }

    
    if (!moralisApiKey) {
      Annotations.of(this).addError("Error: Please enter the moralis api key in the context file");
    }

    
    if (!chain) {
      Annotations.of(this).addError("Error: Please enter the chain in the context file");
    }

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'nft_marketplace',
      schema: appsync.Schema.fromAsset('schema/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))
          }
        },
      },
      xrayEnabled: false,
    });



    const apiDependencies = new lambda.LayerVersion(
      this,
      "apiDependencies",
      {
        layerVersionName: "Dependencies",
        code: lambda.Code.fromAsset("lambdaLayers/apiDependencies"),
      }
    );



    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region
    });

    const s3Bucket = new s3.Bucket(this, "IMAGEBUCKET", {
      bucketName: `markit-image`,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins: ["*"],
          allowedHeaders: ['*'],
          exposedHeaders: ["Access-Control-Allow-Origin"],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
    });

    const appsyncAuthLambda = new lambda.Function(this, "lambdaAuthorizerAppsync", {
      functionName: `lambdaAuthorizerAppsync`,
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda/lambdaAuthorizors/appsyncAuth"),
      handler: "index.handler",
      layers: [apiDependencies],
    });

    //  lambda for apigateway authentication
    const apiGatewayAuthLambda = new lambda.Function(
      this,
      "lambdaAuthApigateway",
      {
        functionName: `lambdaAuthApigateway`,
        runtime: lambda.Runtime.NODEJS_16_X,
        code: lambda.Code.fromAsset(
          "lambda/lambdaAuthorizors/apigatewayAuth"
        ),
        layers: [apiDependencies],
        handler: "index.handler",
        environment: {
          faunaServer: faunaServer,
          faunaSecret: faunaSecret
        }
      }
    );

    appsyncAuthLambda.addEnvironment('faunaServer', faunaServer);

    appsyncAuthLambda.addEnvironment('faunaSecret', faunaSecret);

    //  rest api to downloadCDKContextFile
    const rest_event_api = new apigw.RestApi(this, "rest_event_api", {
      restApiName: `rest_event_api`,
      defaultCorsPreflightOptions: {
          allowOrigins: apigw.Cors.ALL_ORIGINS,
          allowMethods: apigw.Cors.ALL_METHODS, // this is also the default
      },
      deploy: true,
    });

    const handler = new lambda.Function(this, 'webhook', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/webhook'),
      memorySize: 1024,
      environment: {
        faunaServer: faunaServer,
        faunaSecret: faunaSecret,
        contractAddress: "0x9047903D2439Cd00bdAd9d65D2a40eDa5a12F32C"
      },
      layers: [apiDependencies],
      timeout: Duration.minutes(15)
    });

    const event_api = rest_event_api.root.addResource("webhook");
    const getAllIntegration = new apigw.LambdaIntegration(handler);
    event_api.addMethod("POST", getAllIntegration);

    const blockChainListener = new lambda.Function(this, "blockChainListener", {
      functionName: `blockChainListener`,
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda/blockChainListener"),
      handler: "index.handler",
      layers: [apiDependencies],
      timeout: Duration.minutes(15),
    })

    const getBlockChainStatus = new lambda.Function(this, "getBlockChainStatus", {
      functionName: `getBlockChainStatus`,
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda/getBlockChainStatus"),
      handler: "index.handler",
      layers: [apiDependencies]
    })

    const lambdaDs = api.addLambdaDataSource('getBlockChainStatusLambdaDs', getBlockChainStatus);


    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getBlockChainStatus",
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
      #if( $context.result && $context.result.errorMessage )
      $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
  #else
      $utils.toJson($context.result.data)
  #end`)
    });

    blockChainListener.addEnvironment('faunaServer', faunaServer);

    blockChainListener.addEnvironment('faunaSecret', faunaSecret);

    
    getBlockChainStatus.addEnvironment('faunaServer', faunaServer);

    getBlockChainStatus.addEnvironment('faunaSecret', faunaSecret);


    // const streamListener = new lambda.Function(this, 'streamListener', {
    //   runtime: lambda.Runtime.NODEJS_12_X,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset('lambda/StreamListener'),
    //   memorySize: 1024,
    //   layers: [apiDependencies]
    // });

    // streamListener.addEventSource(
    //   new DynamoEventSource(usertable, {
    //     startingPosition: lambda.StartingPosition.LATEST,
    //     batchSize: 5,
    //     bisectBatchOnError: true,
    //    // onFailure: new SqsDlq(deadLetterQueue),
    //     retryAttempts: 10,
    //   })
    // );


    const faunadbInitHandler = new lambda.Function(this, 'Faunadb_init', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/Faunadb_init'),
      memorySize: 1024,
      layers: [apiDependencies],
    });
  
    faunadbInitHandler.addEnvironment('faunaServer', faunaServer);
    faunadbInitHandler.addEnvironment('faunaSecret', faunaSecret);

    new MicroServiceCollection(this, "CollectionMicroservice", { api: api, apiDependenciesLayer: apiDependencies, BUCKET: s3Bucket.bucketName, moralisServerUrl: moralisServerUrl, moralisApiId: moralisApiId, faunaSecret: faunaSecret, faunaServer: faunaServer, moralisApiKey:moralisApiKey, alchemyAPIKEY, chain:chain , blockChainListener: blockChainListener })
    new MicroServiceUser(this, 'microServiceUser', { api: api, apiDependenciesLayer: apiDependencies, BUCKET: s3Bucket.bucketName, moralisServerUrl: moralisServerUrl, moralisApiId: moralisApiId, faunaSecret: faunaSecret, faunaServer: faunaServer, moralisApiKey:moralisApiKey, alchemyAPIKEY, chain:chain });
    new MicroServiceNfts(this, 'microServiceNft', { api: api, apiDependenciesLayer: apiDependencies, moralisServerUrl: moralisServerUrl, moralisApiId: moralisApiId, faunaSecret: faunaSecret, faunaServer: faunaServer, moralisApiKey:moralisApiKey, alchemyAPIKEY, chain:chain, blockChainListener: blockChainListener });
    new MicroServiceHistory(this, 'MicroServiceHistory', { api: api, apiDependenciesLayer: apiDependencies, moralisServerUrl: moralisServerUrl, moralisApiId: moralisApiId, faunaSecret: faunaSecret, faunaServer: faunaServer, moralisApiKey:moralisApiKey, alchemyAPIKEY, chain:chain, blockChainListener: blockChainListener });
    new MetaMaskAuth(this, 'Auth', { api: api, apiDependenciesLayer: apiDependencies, moralisServerUrl: moralisServerUrl, moralisApiId: moralisApiId, faunaSecret: faunaSecret, faunaServer: faunaServer })
    new MicroServiceImageUpload(this, 'ImageUploadService', { api: api, apiDependenciesLayer: apiDependencies, faunaSecret: faunaSecret, faunaServer: faunaServer, apiGatewayAuthLambda, s3Bucket: s3Bucket! })

  }
}
