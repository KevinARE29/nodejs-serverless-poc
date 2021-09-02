import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AppService } from './services/movies.service'
import { CreateMovieDto } from './dtos/request/create-movie.dto'
import { PaginationQueryDto } from './dtos/request/pagination-query.dto'
import { UpdateMovieDto } from './dtos/request/update-movie.dto'
import { MoviesCollectionDto } from './dtos/response/movies-collection.dto'
import { MovieDto } from './dtos/response/movie.dto'

@ApiBearerAuth()
@Controller('movies')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'List Movies',
    description: 'Use this endpoint for retrieving all the movies',
  })
  async getMovies(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<MoviesCollectionDto> {
    return this.appService.getMovies(paginationQueryDto)
  }

  @Post()
  @ApiOperation({
    summary: 'Create Movie',
    description: 'Use this endpoint for create a new movie',
  })
  async createMovie(@Body() input: CreateMovieDto): Promise<MovieDto> {
    return this.appService.createMovie(input)
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'Get Movie',
    description: 'Use this endpoint for get a movie detail',
  })
  async getMovie(@Param('uuid') uuid: string): Promise<MovieDto> {
    return this.appService.getMovie(uuid)
  }

  @Put(':uuid')
  @ApiOperation({
    summary: 'Update Movie',
    description: 'Use this endpoint for update a movie',
  })
  async updateMovie(
    @Param('uuid') uuid: string,
    @Body() input: UpdateMovieDto,
  ): Promise<string> {
    return this.appService.updateMovie(uuid, input)
  }

  @Delete(':uuid')
  @ApiOperation({
    summary: 'Delete Movie',
    description: 'Use this endpoint for delete a movie',
  })
  async deleteMovie(@Param('uuid') uuid: string): Promise<string> {
    return this.appService.deleteMovie(uuid)
  }
}
