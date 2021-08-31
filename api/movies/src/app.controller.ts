import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AppService } from './app.service'
import { CurrentUser } from './decorators/user.decorator'
import { CreateMovieDto } from './dtos/request/create-movie.dto'
import { UpdateMovieDto } from './dtos/request/update-movie.dto'
import { IUser } from './interfaces'

@ApiBearerAuth()
@Controller('movies')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'List Movies',
    description: 'Use this endpoint for retrieving all the movies',
  })
  getMovies(@CurrentUser() { username }: IUser): Promise<string> {
    return this.appService.getMovies(username)
  }

  @Post()
  @ApiOperation({
    summary: 'Create Movie',
    description: 'Use this endpoint for create a new movie',
  })
  createMovie(@Body() input: CreateMovieDto): Promise<string> {
    return this.appService.createMovie(input)
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'Get Movie',
    description: 'Use this endpoint for get a movie detail',
  })
  getMovie(@Param('uuid') uuid: string): Promise<string> {
    return this.appService.getMovie(uuid)
  }

  @Put(':uuid')
  @ApiOperation({
    summary: 'Update Movie',
    description: 'Use this endpoint for update a movie',
  })
  updateMovie(
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
  deleteMovie(@Param('uuid') uuid: string): Promise<string> {
    return this.appService.deleteMovie(uuid)
  }
}
