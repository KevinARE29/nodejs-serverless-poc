import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { AppService } from './app.service'
import { CreateMovieDto } from './dtos/request/create-movie.dto'
import { UpdateMovieDto } from './dtos/request/update-movie.dto'

@Controller('movies')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getMovies(): Promise<string> {
    return this.appService.getMovies()
  }

  @Post()
  createMovie(@Body() input: CreateMovieDto): Promise<string> {
    return this.appService.createMovie(input)
  }

  @Get(':uuid')
  getMovie(@Param('uuid') uuid: string): Promise<string> {
    return this.appService.getMovie(uuid)
  }

  @Put(':uuid')
  updateMovie(
    @Param('uuid') uuid: string,
    @Body() input: UpdateMovieDto,
  ): Promise<string> {
    return this.appService.updateMovie(uuid, input)
  }

  @Delete(':uuid')
  deleteMovie(@Param('uuid') uuid: string): Promise<string> {
    return this.appService.deleteMovie(uuid)
  }
}
