import * as cdk from '@aws-cdk/core'
import { ApplicationAPI } from './api'
import { ApplicationAuth } from './auth'
import { AppServices } from './services'

export class APIStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const services = new AppServices(this, 'Services')
    const auth = new ApplicationAuth(this, 'Auth')

    new ApplicationAPI(this, 'API', {
      moviesService: services.moviesService,
      storeService: services.storeService,
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
    })
  }
}
