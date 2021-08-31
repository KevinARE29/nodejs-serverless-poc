import { Injectable } from '@nestjs/common'
import { CreateMovieDto } from './dtos/request/create-movie.dto'
import { UpdateMovieDto } from './dtos/request/update-movie.dto'
import { PrismaService } from './prisma.service'

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMovies(username: string): Promise<string> {
    return (
      'List of Movies' +
      JSON.stringify(await this.prismaService.$queryRaw('SELECT now();')) +
      JSON.stringify(username)
    )
  }

  async getMovie(uuid: string): Promise<string> {
    return 'Movie Detail'
  }

  async createMovie(input: CreateMovieDto): Promise<string> {
    return 'Create Movie'
  }

  async updateMovie(uuid: string, input: UpdateMovieDto): Promise<string> {
    return 'Update Movie'
  }

  async deleteMovie(uuid: string): Promise<string> {
    return 'Delete Movie'
  }
}
