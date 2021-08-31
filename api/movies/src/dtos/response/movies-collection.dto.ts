import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { MovieDto } from './movie.dto'
import { PaginationDto } from './pagination.dto'

@Exclude()
export class MoviesCollectionDto {
  @ApiProperty({ type: [MovieDto] })
  @Expose()
  @Type(() => MovieDto)
  readonly data: MovieDto[]

  @ApiProperty({ type: PaginationDto })
  @Expose()
  @Type(() => PaginationDto)
  readonly pagination: PaginationDto
}
