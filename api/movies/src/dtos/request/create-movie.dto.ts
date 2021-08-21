import { IsString, IsInt, IsPositive } from 'class-validator'

export class CreateMovieDto {
  @IsString()
  readonly name: string

  @IsString()
  readonly sinopsis: string

  @IsInt()
  @IsPositive()
  readonly duration: number
}
