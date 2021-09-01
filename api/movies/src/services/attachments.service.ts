import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { S3 } from 'aws-sdk'
import { nanoid } from 'nanoid'
import { CreateAttachmentDto } from 'src/dtos/request/create-attachment.dto'
import { AttachmentDto } from 'src/dtos/response/attachment.dto'
import { PrismaService } from './prisma.service'

@Injectable()
export class AttachmentsService {
  private readonly s3: S3

  constructor(private readonly prismaService: PrismaService) {
    this.s3 = new S3()
  }

  getSignedURL(path: string): string {
    return this.s3.getSignedUrl('getObject', {
      Key: path,
      Bucket: process.env.ATTACHMENT_BUCKET,
    })
  }

  async createSignedURL(input: CreateAttachmentDto): Promise<AttachmentDto> {
    const path = 'attachments/movies/{uuid}'.replace('{uuid}', input.uuid)

    const attachment = await this.prismaService.attachment.create({
      data: {
        contentType: input.contentType,
        key: `${nanoid()}-${input.filename}`,
        ext: input.ext,
        path,
      },
    })

    const signedUrl = this.s3.getSignedUrl('putObject', {
      Key: `${path}/${attachment.key}.${attachment.ext}`,
      ContentType: attachment.contentType,
      Bucket: process.env.ATTACHMENT_BUCKET,
    })

    return plainToClass(AttachmentDto, { ...attachment, signedUrl })
  }
}
