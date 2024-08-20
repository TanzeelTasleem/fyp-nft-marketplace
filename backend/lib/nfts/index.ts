import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from "@aws-cdk/aws-iam";

interface props {
    api: appsync.GraphqlApi
    apiDependenciesLayer: lambda.LayerVersion
    moralisServerUrl: string
    moralisApiId:string
    faunaSecret:string
    faunaServer:string
    moralisApiKey:string
    alchemyAPIKEY: string
    chain:string
    blockChainListener:lambda.Function
  }

export class MicroServiceNfts extends cdk.Construct {
    
    constructor(scope: cdk.Construct, id: string, props: props) {
      super(scope, id);
  


      const handler = new lambda.Function(this, 'microServiceNftLambda', {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('lambda/Nft'),
        memorySize: 1024,
        layers: [props.apiDependenciesLayer],
        timeout: cdk.Duration.seconds(10),
        environment: {
          CONTRACT_ADDRESS: "0x34cF345b09043ceeDD81fE91DF390dff19a7e856",
          chain: "mumbai",
          moralisApiKey: props.moralisApiKey!,
          alchemyAPIKEY: props.alchemyAPIKEY!
        }
      });
    
   
      const lambdaDs = props.api.addLambdaDataSource('microServiceNftLambdaDs', handler);
  
      lambdaDs.createResolver({
        typeName: "Mutation",
        fieldName: "mintNft",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "refreshMetaData",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "getNftInfo",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

      
      lambdaDs.createResolver({
        typeName: "Mutation",
        fieldName: "listNft",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });


      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "getListedNfts",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });


      
      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "getNftOwners",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "getNftListingsOfSameToken",
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