import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  NotFoundException,
  Logger,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleDestroy, OnModuleInit
{
  constructor() {
    super({
      // log: ['query', 'error', 'warn'],
      rejectOnNotFound: (error) => new NotFoundException(error.message),
    })
  }

  async onModuleInit(): Promise<void> {
    await this.$connect()

    Logger.log('Successfully connected')
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()

    Logger.log('Successfully disconnected')
  }
}
