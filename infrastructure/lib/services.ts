import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as rds from '@aws-cdk/aws-rds'
import * as secretmanager from '@aws-cdk/aws-secretsmanager'
import {
  defaultCommandHooks,
  NodejsServiceFunction,
} from '../constructs/lambda'

interface AppServicesProps {
  vpc: ec2.Vpc
  dbCredentialsSecret: secretmanager.Secret
  lambdaToRDSProxyGroup: ec2.SecurityGroup
  proxy: rds.DatabaseProxy
}

export class AppServices extends cdk.Construct {
  public readonly moviesService: NodejsFunction

  constructor(scope: cdk.Construct, id: string, props: AppServicesProps) {
    super(scope, id)

    const { username, password } = rds.Credentials.fromSecret(
      props.dbCredentialsSecret,
    )

    const databaseUrl = `postgresql://${username}:${password}@${props.proxy.endpoint}:5432/movies?schema=public`

    // Movies Service -------------------------------------------------
    const moviesServicePath = path.join(__dirname, '../../api/movies/dist')
    this.moviesService = new NodejsServiceFunction(
      this,
      'MoviesServiceLambda',
      {
        entry: `${moviesServicePath}/main.js`,
        vpc: props.vpc,
        securityGroups: [props.lambdaToRDSProxyGroup],
        environment: {
          DATABASE_URL: databaseUrl,
        },
        bundling: {
          commandHooks: {
            ...defaultCommandHooks,
            afterBundling(inputDir: string, outputDir: string): string[] {
              // TODO: improve this
              return [
                `cp ${moviesServicePath}/favicon* ${moviesServicePath}/swagger* ${moviesServicePath}/schema* ${moviesServicePath}/query-engine-rhel-openssl-1.0.* ${outputDir}`,
              ]
            },
          },
        },
      },
    )

    props.dbCredentialsSecret.grantRead(this.moviesService)
  }
}
