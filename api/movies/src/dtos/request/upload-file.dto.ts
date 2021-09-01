import { IsEnum, IsString } from 'class-validator'
import { ContentTypeEnum, FileExtensionEnum } from '../../enums'

export class UploadFileDto {
  @IsEnum(ContentTypeEnum)
  readonly contentType: ContentTypeEnum

  @IsEnum(FileExtensionEnum)
  readonly ext: FileExtensionEnum

  @IsString()
  readonly filename: string
}
