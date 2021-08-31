import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateMovieDto } from './dtos/request/create-movie.dto'
import { UpdateMovieDto } from './dtos/request/update-movie.dto'
import { MoviesCollectionDto } from './dtos/response/movies-collection.dto'
import { PaginationQueryDto } from './dtos/request/pagination-query.dto'
import { PrismaService } from './prisma.service'
import { paginationSerializer, queryPagination } from './utils'

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMovies(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<MoviesCollectionDto> {
    const paginationParams = queryPagination(paginationQueryDto)

    const [count, movies] = await Promise.all([
      this.prismaService.movie.count({
        where: { isActive: true },
      }),
      this.prismaService.movie.findMany({
        ...paginationParams,
        where: { isActive: true },
      }),
    ])

    const pagination = paginationSerializer(count, paginationQueryDto)

    return plainToClass(MoviesCollectionDto, { data: movies, pagination })
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
