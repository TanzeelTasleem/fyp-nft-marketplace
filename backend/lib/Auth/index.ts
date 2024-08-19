import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as appsync from '@aws-cdk/aws-appsync';


interface metaMaskAuthProps {
    apiDependenciesLayer: lambda.LayerVersion
    api: appsync.GraphqlApi
    moralisServerUrl: string
    moralisApiId:string
    faunaSecret:string
    faunaServer:string
}



export class MetaMaskAuth extends cdk.Construct {
  public readonly handler: lambda.Function;

  constructor(scope: cdk.Construct, id: string, props: metaMaskAuthProps) {
    super(scope, id);
  
        const authentication = new lambda.Function(this,"authentication", {
        functionName: `authentication`,
        runtime: lambda.Runtime.NODEJS_16_X,
        code: lambda.Code.fromAsset("lambda/Auth"),
        handler: "index.handler",
        layers: [props!.apiDependenciesLayer]
        })

        const DS = props!.api.addLambdaDataSource('findUserLambdaDs', authentication);

        DS.createResolver({
            typeName: "Query",
            fieldName: "findUser",
            responseMappingTemplate: appsync.MappingTemplate.fromString(`
            #if( $context.result && $context.result.errorMessage )
            $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
                #else
            $utils.toJson($context.result.data)
                #end`)
        });

        DS.createResolver({
            typeName: "Query",
            fieldName: "authUser",
            responseMappingTemplate: appsync.MappingTemplate.fromString(`
            #if( $context.result && $context.result.errorMessage )
            $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
                #else
            $utils.toJson($context.result.data)
                #end`)
        });

        DS.createResolver({
            typeName: "Mutation",
            fieldName: "signup",
            responseMappingTemplate: appsync.MappingTemplate.fromString(`
            #if( $context.result && $context.result.errorMessage )
            $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
                #else
            $utils.toJson($context.result.data)
                #end`)
        });

        DS.createResolver({
            typeName: "Mutation",
            fieldName: "authenticate",
            responseMappingTemplate: appsync.MappingTemplate.fromString(`
            #if( $context.result && $context.result.errorMessage )
            $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
                #else
            $utils.toJson($context.result.data)
                #end`)
        });


        DS.createResolver({
            typeName: "Mutation",
            fieldName: "refreshAccessToken",
            responseMappingTemplate: appsync.MappingTemplate.fromString(`
            #if( $context.result && $context.result.errorMessage )
            $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data, $context.result.errorInfo)
                #else
            $utils.toJson($context.result.data)
                #end`)
        });


        authentication.addEnvironment('moralisServerUrl', props.moralisServerUrl);

        authentication.addEnvironment('moralisApiId', props.moralisApiId);

        authentication.addEnvironment('faunaServer', props.faunaServer);

        authentication.addEnvironment('faunaSecret', props.faunaSecret);


  }
}