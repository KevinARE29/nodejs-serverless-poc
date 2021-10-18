import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import { ApplicationAPI } from './api'
import { ApplicationAuth } from './auth'
import { AppServices } from './services'
import { ApiDatabase } from './database'
import { AttachmentStorage } from './storage'

export class APIStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const vpc = new ec2.Vpc(this, 'ApiVpc')
    const db = new ApiDatabase(this, 'DB', { vpc })
    const storage = new AttachmentStorage(this, 'Storage')
    const auth = new ApplicationAuth(this, 'Auth')

    const services = new AppServices(this, 'Services', {
      vpc,
      dbCredentialsSecret: db.dbCredentialsSecret,
      lambdaToRDSProxyGroup: db.lambdaToRDSProxyGroup,
      proxy: db.proxy,
      attachmentBucket: storage.attachmentBucket,
    })

    new ApplicationAPI(this, 'API', {
      getMovies: services.getMovies,
      getMovie: services.getMovie,
      createMovie: services.createMovie,
      updateMovie: services.updateMovie,
      deleteMovie: services.deleteMovie,
      userPool: auth.userPool,
    })
  }
}
