import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import {
  defaultCommandHooks,
  NodejsServiceFunction,
} from '../constructs/lambda'

export class AppServices extends cdk.Construct {
  public readonly moviesService: NodejsFunction

  public readonly storeService: NodejsFunction

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id)

    // Movies Service -------------------------------------------------
    const moviesServicePath = path.join(__dirname, '../../api/movies/dist')
    this.moviesService = new NodejsServiceFunction(
      this,
      'MoviesServiceLambda',
      {
        entry: `${moviesServicePath}/main.js`,
        bundling: {
          commandHooks: {
            ...defaultCommandHooks,
            afterBundling(inputDir: string, outputDir: string): string[] {
              return [
                `cp ${moviesServicePath}/favicon* ${moviesServicePath}/swagger* ${outputDir}`,
              ]
            },
          },
        },
      },
    )
  }
}
