import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as apigw from '@aws-cdk/aws-apigateway'
import * as cognito from '@aws-cdk/aws-cognito'
import { CorsHttpMethod, HttpMethod } from '@aws-cdk/aws-apigatewayv2'
import {
  createMovieModelOptions,
  updateMovieModelOptions,
} from './models/movie'

interface ApplicationAPIProps {
  moviesService: lambda.IFunction
  userPool: cognito.IUserPool
}

export class ApplicationAPI extends cdk.Construct {
  public readonly restApi: apigw.RestApi

  constructor(scope: cdk.Construct, id: string, props: ApplicationAPIProps) {
    super(scope, id)

    // API Gateway ------------------------------------------------------

    this.restApi = new apigw.RestApi(this, 'RestApi', {
      restApiName: 'serverless-api-nest',
      defaultCorsPreflightOptions: {
        allowHeaders: ['Authorization', 'Content-Type', '*'],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
        ],
        allowOrigins: ['http://localhost:3000', 'https://*'],
        allowCredentials: true,
      },
    })

    const requestValidator = this.restApi.addRequestValidator(
      'RequestValidator',
      {
        validateRequestParameters: true,
        validateRequestBody: true,
      },
    )

    const badRequestResponse = {
      statusCode: '400',
      templates: {
        'application/json': JSON.stringify({
          message: '$context.error.validationErrorString',
        }),
      },
    }

    this.restApi.addGatewayResponse('GatewayBadRequestBodyResponse', {
      type: apigw.ResponseType.BAD_REQUEST_BODY,
      ...badRequestResponse,
    })

    this.restApi.addGatewayResponse('GatewayBadRequestParametersResponse', {
      type: apigw.ResponseType.BAD_REQUEST_PARAMETERS,
      ...badRequestResponse,
    })

    // Authorizer -------------------------------------------------------

    const authorizer = new apigw.CognitoUserPoolsAuthorizer(
      this,
      'CognitoAuthorizer',
      {
        cognitoUserPools: [props.userPool],
      },
    )

    // Movies Service -------------------------------------------------
    const moviesResource = this.restApi.root.addResource('movies')

    const moviesServiceIntegration = new apigw.LambdaIntegration(
      props.moviesService,
    )

    const createMovieModel = this.restApi.addModel(
      'CreateMovieModel',
      createMovieModelOptions,
    )
    const updateMovieModel = this.restApi.addModel(
      'UpdateMovieModel',
      updateMovieModelOptions,
    )

    moviesResource.addMethod(HttpMethod.GET, moviesServiceIntegration)
    moviesResource.addMethod(HttpMethod.POST, moviesServiceIntegration, {
      requestModels: { 'application/json': createMovieModel },
      requestValidator,
    })
    moviesResource.addMethod(HttpMethod.PUT, moviesServiceIntegration, {
      authorizer,
      requestModels: { 'application/json': updateMovieModel },
      requestValidator,
    })

    // Outputs -----------------------------------------------------------

    new cdk.CfnOutput(this, 'URL', {
      value: this.restApi.url,
    })
  }
}
