import { Controller, UseGuards, Post, Get, Param, Put, Delete, Body, Req, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { CREATE_QUIZ_REQUEST, DELETE_QUIZ_REQUEST, GET_QUIZZES_REQUEST, GET_QUIZ_REQUEST, Status, UPDATE_QUIZ_REQUEST } from './../../utils/constant';
import { Active, Role } from './../../decorator/auth.decorator';
import { UserRole } from './../../types/user.types';
import { AuthorizationGuard } from './../../guard/auth.guard';
import { CreateQuizDTO } from './dto/create_quiz.dto';
import { Quiz } from './schema/quiz.schema';
import { IPaginationResult } from './../../types/pagination_result.type';
import { PaginationDTO } from './dto/pagination.dto';
import { AuthService } from '../shared/auth.service';
import { LoggerService } from '../logger/logger.service';
import { LEVEL } from './../../types/log.types';
import { handleResult, log } from './../../utils/helper';

@Controller('quiz')
export class QuizController {
  private readonly quizService: QuizService;
  private readonly authService: AuthService;
  private readonly loggerService: LoggerService;

  constructor(quizService: QuizService, authService: AuthService, loggerService: LoggerService) {
    this.quizService = quizService;
    this.authService = authService;
    this.loggerService = loggerService;
  }

  @Throttle(CREATE_QUIZ_REQUEST.LIMIT, CREATE_QUIZ_REQUEST.TTL)
  @Role(UserRole.CREATOR)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @Post()
  public async createQuiz(@Body() payload: CreateQuizDTO, @Req() request: Request): Promise<Quiz> {
    try {
      const userId = this.authService.getId();
      const quiz = await this.quizService.createQuiz(payload, userId);
      return handleResult<Quiz>(quiz);
    } catch (error) {
      log(this.loggerService, 'create_quiz_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }

  @Throttle(GET_QUIZ_REQUEST.LIMIT, GET_QUIZ_REQUEST.TTL)
  @Role(UserRole.CREATOR)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @Get(':quizId')
  public async getQuiz(@Param('quizId') quizId: string, @Req() request: Request): Promise<Quiz> {
    try {
      const quiz = await this.quizService.getQuizById(quizId);
      return handleResult<Quiz>(quiz);
    } catch (error) {
      log(this.loggerService, 'get_quiz_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }

  @Throttle(GET_QUIZZES_REQUEST.LIMIT, GET_QUIZZES_REQUEST.TTL)
  @Role(UserRole.CREATOR)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @Get()
  public async getQuizzes(
    @Query('page') page: number,
    @Query('query') query: string,
    @Query('pageSize') pageSize: number,
    @Query('sortField') sortField: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc',
    @Req() request: Request,
  ): Promise<IPaginationResult<Quiz>> {
    try {
      const pagination: PaginationDTO = { page: page, query: query, pageSize: pageSize, sortOrder: sortOrder, sortField: sortField };
      const userId = this.authService.getId();
      const quizzes = await this.quizService.getQuizzes(userId, pagination);
      return handleResult<IPaginationResult<Quiz>>(quizzes);
    } catch (error) {
      log(this.loggerService, 'get_quizzes_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }

  @Throttle(UPDATE_QUIZ_REQUEST.LIMIT, UPDATE_QUIZ_REQUEST.TTL)
  @Role(UserRole.CREATOR)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @Put(':quizId')
  public async updateQuiz(@Param('quizId') quizId: string, @Body() payload: Partial<CreateQuizDTO>, @Req() request: Request): Promise<Quiz> {
    try {
      const userId = this.authService.getId();
      const updatedQuiz = await this.quizService.updateQuiz(quizId, userId, payload);
      return handleResult<Quiz>(updatedQuiz);
    } catch (error) {
      log(this.loggerService, 'update_quiz_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }

  @Throttle(DELETE_QUIZ_REQUEST.LIMIT, DELETE_QUIZ_REQUEST.TTL)
  @Role(UserRole.CREATOR)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @Delete(':quizId')
  public async deleteQuiz(@Param('quizId') quizId: string, @Req() request: Request): Promise<Quiz> {
    try {
      const userId = this.authService.getId();
      const result = await this.quizService.deleteQuiz(quizId, userId);
      return handleResult<Quiz>(result);
    } catch (error) {
      log(this.loggerService, 'delete_one_quiz_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }
}
