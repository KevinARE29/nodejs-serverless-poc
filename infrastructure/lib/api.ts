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
  getMovies: lambda.IFunction
  getMovie: lambda.IFunction
  createMovie: lambda.IFunction
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

    this.restApi.addGatewayResponse('BadRequestBodyResponse', {
      type: apigw.ResponseType.BAD_REQUEST_BODY,
      statusCode: '400',
      templates: {
        'application/json': JSON.stringify({
          message: '$context.error.validationErrorString',
        }),
      },
    })

    // Authorizer -------------------------------------------------------

    const authorizer = new apigw.CognitoUserPoolsAuthorizer(
      this,
      'CognitoAuthorizer',
      {
        cognitoUserPools: [props.userPool],
      },
    )

    // Movies Endpoints -------------------------------------------------
    // Resources
    const movies = this.restApi.root.addResource('movies')
    const movie = movies.addResource('{movie_id}')

    // Lambdas Integrations
    const getMoviesIntegration = new apigw.LambdaIntegration(props.getMovies)
    const getMovieIntegration = new apigw.LambdaIntegration(props.getMovie)
    const createMovieIntegration = new apigw.LambdaIntegration(
      props.createMovie,
    )

    // Models (DTOs)
    const createMovieModel = this.restApi.addModel(
      'CreateMovieModel',
      createMovieModelOptions,
    )
    const updateMovieModel = this.restApi.addModel(
      'UpdateMovieModel',
      updateMovieModelOptions,
    )

    //Routes
    movies.addMethod(HttpMethod.GET, getMoviesIntegration, {
      requestParameters: {
        'method.request.querystring.page': true,
        'method.request.querystring.perPage': true,
      },
      requestValidator,
    })
    movies.addMethod(HttpMethod.POST, createMovieIntegration, {
      requestModels: { 'application/json': createMovieModel },
      requestValidator,
    })
    movie.addMethod(HttpMethod.GET, getMovieIntegration, {
      authorizer,
    })
    movie.addMethod(HttpMethod.PUT, getMoviesIntegration, {
      authorizer,
      requestModels: { 'application/json': updateMovieModel },
      requestValidator,
    })
    movie.addMethod(HttpMethod.DELETE, getMoviesIntegration, {
      authorizer,
    })

    // Outputs -----------------------------------------------------------

    new cdk.CfnOutput(this, 'URL', {
      value: this.restApi.url,
    })
  }
}
