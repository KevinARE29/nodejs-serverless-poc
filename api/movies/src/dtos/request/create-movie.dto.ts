import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsString,
  IsInt,
  IsPositive,
  IsNumber,
  ValidateNested,
} from 'class-validator'
import { UploadFileDto } from './upload-file.dto'

export class CreateMovieDto {
  @IsString()
  readonly name: string

  @IsString()
  readonly synopsis: string

  @IsInt()
  @IsPositive()
  readonly duration: number

  @IsNumber()
  @IsPositive()
  readonly price: number

  @ApiProperty({ type: UploadFileDto })
  @ValidateNested()
  @Type(() => UploadFileDto)
  readonly poster: UploadFileDto
}
