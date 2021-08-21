import { Injectable } from '@nestjs/common'
import { CreateMovieDto } from './dtos/request/create-movie.dto'
import { UpdateMovieDto } from './dtos/request/update-movie.dto'

@Injectable()
export class AppService {
  async getMovies(): Promise<string> {
    return 'List of Movies'
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
