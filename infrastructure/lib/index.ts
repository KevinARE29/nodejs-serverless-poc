import * as cdk from '@aws-cdk/core'
import { ApplicationAPI } from './api'
import { AppServices } from './services'

export class APIStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const services = new AppServices(this, 'Services')
    new ApplicationAPI(this, 'API', {
      moviesService: services.moviesService,
    })
  }
}
