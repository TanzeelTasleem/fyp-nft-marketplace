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
    alchemyAPIKEY: string
    chain:string
  }

export class MicroServiceUser extends cdk.Construct {
    
    constructor(scope: cdk.Construct, id: string, props: props) {
      super(scope, id);
  


      const handler = new lambda.Function(this, 'microServiceUserLambda', {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('lambda/User'),
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

      const lambdaDs = props.api.addLambdaDataSource('microServiceUserLambdaDs', handler);
  
      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "getUserProfile",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });
  
      lambdaDs.createResolver({
        typeName: "Mutation",
        fieldName: "followUser",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

    //   lambdaDs.createResolver({
    //     typeName: "Mutation",
    //     fieldName: "addUserToAdminGroup",
    //     responseMappingTemplate: appsync.MappingTemplate.fromString(`
    //     #if( $context.result && $context.result.errorMessage )
    //     $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    // #else
    //     $utils.toJson($context.result.data)
    // #end`)
    //   });

      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "getUsersNfts",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "usernameAvailable",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

      lambdaDs.createResolver({
        typeName: "Mutation",
        fieldName: "updateProfile",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });

      lambdaDs.createResolver({
        typeName: "Query",
        fieldName: "getUserListedNfts",
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.result && $context.result.errorMessage )
        $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
    #else
        $utils.toJson($context.result.data)
    #end`)
      });



      

      
    
      handler.addEnvironment('moralisServerUrl', props.moralisServerUrl);

      handler.addEnvironment('moralisApiId', props.moralisApiId);

      handler.addEnvironment('faunaServer', props.faunaServer);

      handler.addEnvironment('faunaSecret', props.faunaSecret);
      
      handler.addEnvironment('moralisApiKey', props.moralisApiKey);

      handler.addEnvironment('alchemyAPIKEY', props.alchemyAPIKEY);

      handler.addEnvironment('chain', props.chain);


    }
  
  }