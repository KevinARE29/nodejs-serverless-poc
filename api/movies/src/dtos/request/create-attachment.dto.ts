import { ContentTypeEnum, FileExtensionEnum } from '../../enums'

export class CreateAttachmentDto {
  readonly uuid: string
  readonly contentType: ContentTypeEnum
  readonly ext: FileExtensionEnum
  readonly filename: string
}
