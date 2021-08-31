import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class PaginationDto {
  @Expose()
  readonly perPage: number

  @Expose()
  readonly total: number

  @Expose()
  readonly page: number

  @Expose()
  readonly prevPage?: number

  @Expose()
  readonly nextPage?: number

  @Expose()
  readonly totalPages: number
}
