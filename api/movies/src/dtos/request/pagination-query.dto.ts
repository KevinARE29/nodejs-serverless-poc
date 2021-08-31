import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsPositive, IsInt, IsOptional, Max } from 'class-validator'

export class PaginationQueryDto {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  readonly page = 1

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(25)
  @Type(() => Number)
  readonly perPage = 10
}
