import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as apigw from '@aws-cdk/aws-apigatewayv2'
import { CorsHttpMethod, HttpMethod } from '@aws-cdk/aws-apigatewayv2'
import * as apigi from '@aws-cdk/aws-apigatewayv2-integrations'

interface ApplicationAPIProps {
  moviesService: lambda.IFunction
}

export class ApplicationAPI extends cdk.Construct {
  public readonly httpApi: apigw.HttpApi

  constructor(scope: cdk.Construct, id: string, props: ApplicationAPIProps) {
    super(scope, id)

    const serviceMethods = [
      HttpMethod.GET,
      HttpMethod.POST,
      HttpMethod.DELETE,
      HttpMethod.PUT,
      HttpMethod.PATCH,
    ]

    // API Gateway ------------------------------------------------------

    this.httpApi = new apigw.HttpApi(this, 'HttpProxyApi', {
      apiName: 'serverless-api-nest',
      createDefaultStage: true,
      corsPreflight: {
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
        maxAge: cdk.Duration.days(10),
      },
    })

    // Movies Service -------------------------------------------------

    const moviesServiceIntegration = new apigi.LambdaProxyIntegration({
      handler: props.moviesService,
    })

    this.httpApi.addRoutes({
      path: `/movies-service/{proxy+}`,
      methods: serviceMethods,
      integration: moviesServiceIntegration,
    })

    // Outputs -----------------------------------------------------------

    new cdk.CfnOutput(this, 'URL', {
      value: this.httpApi.apiEndpoint,
    })
  }
}
