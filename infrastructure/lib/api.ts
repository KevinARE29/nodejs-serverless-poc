import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as apigw from '@aws-cdk/aws-apigateway'
import * as cognito from '@aws-cdk/aws-cognito'
import { CorsHttpMethod, HttpMethod } from '@aws-cdk/aws-apigatewayv2'

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
      deployOptions: {
        stageName: process.env.STAGE_ENV ?? 'dev',
      },
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
    const movie = movies.addResource('{movie_uuid}')

    // Lambdas Integrations
    const getMoviesIntegration = new apigw.LambdaIntegration(props.getMovies)
    const getMovieIntegration = new apigw.LambdaIntegration(props.getMovie)
    const createMovieIntegration = new apigw.LambdaIntegration(
      props.createMovie,
    )

    //Routes
    movies.addMethod(HttpMethod.GET, getMoviesIntegration, {
      authorizer,
    })
    movies.addMethod(HttpMethod.POST, createMovieIntegration, { authorizer })
    movie.addMethod(HttpMethod.GET, getMovieIntegration, {
      authorizer,
    })
    movie.addMethod(HttpMethod.PUT, getMoviesIntegration, { authorizer })
    movie.addMethod(HttpMethod.DELETE, getMoviesIntegration, {
      authorizer,
    })

    // Outputs -----------------------------------------------------------

    new cdk.CfnOutput(this, 'URL', {
      value: this.restApi.url,
    })
  }
}
