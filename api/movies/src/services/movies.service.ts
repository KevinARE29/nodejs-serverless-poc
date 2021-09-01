import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { MovieDto } from 'src/dtos/response/movie.dto'
import { CreateMovieDto } from '../dtos/request/create-movie.dto'
import { UpdateMovieDto } from '../dtos/request/update-movie.dto'
import { MoviesCollectionDto } from '../dtos/response/movies-collection.dto'
import { PaginationQueryDto } from '../dtos/request/pagination-query.dto'
import { paginationSerializer, queryPagination } from '../utils'
import { PrismaService } from './prisma.service'
import { AttachmentsService } from './attachments.service'

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

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

  async createMovie(dto: CreateMovieDto): Promise<MovieDto> {
    const { poster, ...data } = dto

    const movie = await this.prismaService.movie.create({ data })

    const attachment = await this.attachmentsService.createSignedURL({
      contentType: poster.contentType,
      ext: poster.ext,
      filename: poster.filename,
      uuid: movie.uuid,
    })

    await this.prismaService.movie.update({
      where: { id: movie.id },
      data: { poster: { connect: { id: attachment.id } } },
    })

    return plainToClass(MovieDto, { ...movie, poster: attachment.signedUrl })
  }

  async updateMovie(uuid: string, input: UpdateMovieDto): Promise<string> {
    return 'Update Movie'
  }

  async deleteMovie(uuid: string): Promise<string> {
    return 'Delete Movie'
  }
}
