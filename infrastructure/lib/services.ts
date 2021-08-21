import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { Duration } from '@aws-cdk/core'
import { NodejsServiceFunction } from '../constructs/lambda'

export class AppServices extends cdk.Construct {
  public readonly moviesService: NodejsFunction

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
            beforeBundling(inputDir: string, outputDir: string): string[] {
              return ['echo beforeBundling']
            },
            afterBundling(inputDir: string, outputDir: string): string[] {
              return [
                `cp ${moviesServicePath}/favicon* ${moviesServicePath}/swagger* ${outputDir}`,
              ]
            },

            beforeInstall(inputDir: string, outputDir: string): string[] {
              return ['echo beforeInstall']
            },
          },
        },
        timeout: Duration.seconds(10),
      },
    )
  }
}
