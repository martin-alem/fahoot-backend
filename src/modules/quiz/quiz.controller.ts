import { Controller, UseGuards, Post, Get, Param, Put, Delete, Body, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { Throttle } from '@nestjs/throttler';
import { CREATE_QUIZ_REQUEST, DELETE_QUIZ_REQUEST, GET_QUIZZES_REQUEST, GET_QUIZ_REQUEST, Status, UPDATE_QUIZ_REQUEST } from './../../utils/constant';
import { Active, Role } from './../../decorator/auth.decorator';
import { UserRole } from './../../types/user.types';
import { AuthorizationGuard } from './../../guard/auth.guard';
import { CreateQuizDTO } from './dto/create_quiz.dto';
import { Quiz } from './schema/quiz.schema';
import { IPaginationResult } from './../../types/pagination_result.type';
import { QuizPaginationDTO } from './dto/quiz-pagination.dto';
import { AuthService } from '../shared/auth.service';
import { extractIds, handleResult } from 'src/utils/helper';

@Controller('quiz')
export class QuizController {
  private readonly quizService: QuizService;
  private readonly authService: AuthService;

  constructor(quizService: QuizService, authService: AuthService) {
    this.quizService = quizService;
    this.authService = authService;
  }

  @Throttle(CREATE_QUIZ_REQUEST.LIMIT, CREATE_QUIZ_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Post()
  public async createQuiz(@Body() payload: CreateQuizDTO): Promise<Quiz> {
    try {
      const userId = this.authService.getId();
      const quiz = await this.quizService.createQuiz(payload, userId);
      return handleResult<Quiz>(quiz);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_QUIZ_REQUEST.LIMIT, GET_QUIZ_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Get(':quizId')
  public async getQuiz(@Param('quizId') quizId: string): Promise<Quiz> {
    try {
      const quiz = await this.quizService.getQuizById(quizId);
      return handleResult<Quiz>(quiz);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_QUIZZES_REQUEST.LIMIT, GET_QUIZZES_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Get()
  public async getQuizzes(@Query() pagination: QuizPaginationDTO): Promise<IPaginationResult<Quiz>> {
    try {
      const userId = this.authService.getId();
      const quizzes = await this.quizService.getQuizzes(userId, pagination);
      return handleResult<IPaginationResult<Quiz>>(quizzes);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(UPDATE_QUIZ_REQUEST.LIMIT, UPDATE_QUIZ_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Put(':quizId')
  public async updateQuiz(@Param('quizId') quizId: string, @Body() payload: Partial<CreateQuizDTO>): Promise<Quiz> {
    try {
      const userId = this.authService.getId();
      const updatedQuiz = await this.quizService.updateQuiz(quizId, userId, payload);
      return handleResult<Quiz>(updatedQuiz);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(DELETE_QUIZ_REQUEST.LIMIT, DELETE_QUIZ_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Delete(':quizId')
  public async deleteQuiz(@Param('quizId') quizId: string): Promise<boolean> {
    try {
      const userId = this.authService.getId();
      const result = await this.quizService.deleteQuiz(quizId, userId);
      return handleResult<boolean>(result);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(DELETE_QUIZ_REQUEST.LIMIT, DELETE_QUIZ_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Delete('/batch')
  public async deletePlayList(@Query('playIds') playIds: string): Promise<boolean> {
    try {
      const userId = this.authService.getId();
      const quizIdsArray = extractIds(playIds);
      const play = await this.quizService.deleteAllQuizzes(userId, quizIdsArray);
      return handleResult<boolean>(play);
    } catch (error) {
      throw error;
    }
  }
}
