import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from "@aws-cdk/aws-iam";

interface props {
    api: appsync.GraphqlApi
    apiDependenciesLayer: lambda.LayerVersion
    BUCKET: string
    moralisServerUrl: string
    moralisApiId:string
    faunaSecret:string
    faunaServer:string
    moralisApiKey:string
    alchemyAPIKEY: string;
    chain:string
    blockChainListener:lambda.Function
  }

export class MicroServiceCollection extends cdk.Construct {
    
    constructor(scope: cdk.Construct, id: string, props: props) {
      super(scope, id);
  


      const handler = new lambda.Function(this, 'microServiceCollectionLambda', {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('lambda/Collection'),
        memorySize: 1024,
        layers: [props.apiDependenciesLayer],
        timeout: cdk.Duration.seconds(10),
        environment: {
          BUCKET: props?.BUCKET!
        },
      });
    
      const s3Policy = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:*"],
        resources: ["*"]
      });
    
      handler.addToRolePolicy(s3Policy)

      const lambdaDs = props.api.addLambdaDataSource('microServiceCollectionLambdaDs', handler);
  
      lambdaDs.createResolver({
        typeName: "Mutation",
        fieldName: "createCollection",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

      lambdaDs.createResolver({
        typeName: "Mutation",
        fieldName: "updateCollection",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "collectionIdAvailable",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "getCollections",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "searchCollectionByName",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "getCollectionInfo",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });


      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "getCollectionNfts",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });


      handler.addEnvironment('faunaServer', props.faunaServer);

      handler.addEnvironment('faunaSecret', props.faunaSecret);

      handler.addEnvironment('blockChainListenerName', props.blockChainListener.functionName);

      props.blockChainListener.grantInvoke(handler)



    }
  
  }