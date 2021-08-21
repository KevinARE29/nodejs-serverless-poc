import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import serverlessExpress from '@vendia/serverless-express'
import { Callback, Context, Handler } from 'aws-lambda'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'

let server: Handler

async function bootstrap(): Promise<any> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.setGlobalPrefix('movies-service')

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .addServer('http://127.0.0.1:3000/movies-service/')
    .setVersion('1.0')
    .addTag('cats')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('movies-service/docs', app, document)

  await app.init()
  const expressApp = app.getHttpAdapter().getInstance()

  return serverlessExpress({ app: expressApp })
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap())
  return server(event, context, callback)
}

process.on('unhandledRejection', (reason) => {
  console.error(reason)
})

process.on('uncaughtException', (reason) => {
  console.error(reason)
})
