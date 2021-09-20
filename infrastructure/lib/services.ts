import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as rds from '@aws-cdk/aws-rds'
import * as s3 from '@aws-cdk/aws-s3'
import * as secretmanager from '@aws-cdk/aws-secretsmanager'
import { NodejsServiceFunction } from '../constructs/lambda'

interface AppServicesProps {
  vpc: ec2.Vpc
  dbCredentialsSecret: secretmanager.Secret
  lambdaToRDSProxyGroup: ec2.SecurityGroup
  proxy: rds.DatabaseProxy
  attachmentBucket: s3.IBucket
}

export class AppServices extends cdk.Construct {
  public readonly getMovies: NodejsFunction
  public readonly getMovie: NodejsFunction
  public readonly createMovie: NodejsFunction

  constructor(scope: cdk.Construct, id: string, props: AppServicesProps) {
    super(scope, id)

    const { username, password } = rds.Credentials.fromSecret(
      props.dbCredentialsSecret,
    )

    const databaseUrl = `postgresql://${username}:${password}@${props.proxy.endpoint}:5432/movies?schema=public`

    // Get Movies -------------------------------------------------
    this.getMovies = new NodejsServiceFunction(this, 'GetMovies', {
      functionName: 'GetMovies',
      entry: path.join(__dirname, '../../services/movies/getMovies/index.js'),
      vpc: props.vpc,
      securityGroups: [props.lambdaToRDSProxyGroup],
      environment: {
        DATABASE_URL: databaseUrl,
      },
    })

    props.attachmentBucket.grantRead(this.getMovies)

    this.getMovies.addEnvironment(
      'ATTACHMENT_BUCKET',
      props.attachmentBucket.bucketName,
    )

    // Get Movie -------------------------------------------------
    this.getMovie = new NodejsServiceFunction(this, 'GetMovie', {
      functionName: 'GetMovie',
      entry: path.join(__dirname, '../../services/movies/getMovie/index.js'),
      vpc: props.vpc,
      securityGroups: [props.lambdaToRDSProxyGroup],
      environment: {
        DATABASE_URL: databaseUrl,
      },
    })

    this.getMovie.addEnvironment(
      'ATTACHMENT_BUCKET',
      props.attachmentBucket.bucketName,
    )

    // Create Movie -------------------------------------------------
    this.createMovie = new NodejsServiceFunction(this, 'CreateMovie', {
      functionName: 'CreateMovie',
      entry: path.join(__dirname, '../../services/movies/createMovie/index.js'),
      vpc: props.vpc,
      securityGroups: [props.lambdaToRDSProxyGroup],
      environment: {
        DATABASE_URL: databaseUrl,
      },
    })

    props.attachmentBucket.grantWrite(this.createMovie)

    this.createMovie.addEnvironment(
      'ATTACHMENT_BUCKET',
      props.attachmentBucket.bucketName,
    )
  }
}
