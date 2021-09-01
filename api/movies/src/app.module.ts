import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AttachmentsService } from './services/attachments.service'
import { AppService } from './services/movies.service'
import { PrismaService } from './services/prisma.service'

@Module({
  controllers: [AppController],
  providers: [AppService, PrismaService, AttachmentsService],
})
export class AppModule {}
