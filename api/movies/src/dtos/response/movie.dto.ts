import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class MovieDto {
  @Expose()
  readonly id: number

  @Expose()
  readonly uuid: string

  @Expose()
  readonly name: string

  @Expose()
  readonly synopsis?: string

  @Expose()
  readonly duration: number

  @Expose()
  readonly price: number

  @Expose()
  readonly likes: number

  @Expose()
  readonly isActive: boolean

  @Expose()
  readonly poster: string
}
