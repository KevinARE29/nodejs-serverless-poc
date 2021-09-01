import { Attachment } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { ContentTypeEnum, FileExtensionEnum } from '../../enums'

@Exclude()
export class AttachmentDto implements Partial<Attachment> {
  @Expose()
  readonly id: number

  @Expose()
  readonly uuid: string

  @Expose()
  readonly path: string

  @Expose()
  readonly key: string

  @Expose()
  readonly ext: FileExtensionEnum

  @Expose()
  readonly contentType: ContentTypeEnum

  @Expose()
  readonly url?: string

  @Expose()
  readonly signedUrl?: string

  @Expose()
  readonly createdAt: Date
}
