import { Controller, UseGuards, Post, Get, Param, Put, Delete } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { Throttle } from '@nestjs/throttler';
import { CREATE_QUIZ_REQUEST, DELETE_QUIZ_REQUEST, GET_QUIZZES_REQUEST, GET_QUIZ_REQUEST, Status, UPDATE_QUIZ_REQUEST } from 'src/utils/constant';
import { Active, Role } from 'src/decorator/auth.decorator';
import { UserRole } from 'src/types/user.types';
import { AuthorizationGuard } from 'src/guard/auth.guard';
import { CreateQuizDTO } from './dto/create_quiz.dto';
import { Quiz } from './schema/quiz.schema';
import { IPaginationResult } from 'src/types/pagination_result.type';
import { PaginationDTO } from './dto/pagination.dto';
import { AuthService } from '../shared/auth.service';

@Controller('quiz')
export class QuizController {
  private readonly quizService: QuizService;
  private readonly authService: AuthService;

  constructor(quizService: QuizService, authService: AuthService) {
    this.quizService = quizService;
    this.authService = authService;
  }

  @Throttle(CREATE_QUIZ_REQUEST.LIMIT, CREATE_QUIZ_REQUEST.TTL)
  @Role(UserRole.USER)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @Post()
  public async createQuiz(payload: CreateQuizDTO): Promise<Quiz> {
    try {
      const userId = this.authService.getId();
      const quiz = await this.quizService.createQuiz(payload, userId);
      return quiz;
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_QUIZ_REQUEST.LIMIT, GET_QUIZ_REQUEST.TTL)
  @Role(UserRole.USER)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @Get(':quizId')
  public async getQuiz(@Param('quizId') quizId: string): Promise<Quiz> {
    try {
      const quiz = await this.quizService.getQuizById(quizId);
      return quiz;
    } catch (error) {
      throw error;
    }
  }

  @Throttle(GET_QUIZZES_REQUEST.LIMIT, GET_QUIZZES_REQUEST.TTL)
  @Role(UserRole.USER)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @Get()
  public async getQuizzes(pagination: PaginationDTO): Promise<IPaginationResult<Quiz>> {
    try {
      const userId = this.authService.getId();
      const quizzes = await this.quizService.getQuizzes(userId, pagination);
      return quizzes;
    } catch (error) {
      throw error;
    }
  }

  @Throttle(UPDATE_QUIZ_REQUEST.LIMIT, UPDATE_QUIZ_REQUEST.TTL)
  @Role(UserRole.USER)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @Put(':quizId')
  public async updateQuiz(@Param('quizId') quizId: string, payload: Partial<CreateQuizDTO>): Promise<Quiz> {
    try {
      const userId = this.authService.getId();
      const updatedQuiz = await this.quizService.updateQuiz(quizId, userId, payload);
      return updatedQuiz;
    } catch (error) {
      throw error;
    }
  }

  @Throttle(DELETE_QUIZ_REQUEST.LIMIT, DELETE_QUIZ_REQUEST.TTL)
  @Role(UserRole.USER)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @Delete(':quizId')
  public async deleteQuiz(@Param('quizId') quizId: string): Promise<void> {
    try {
      const userId = this.authService.getId();
      return await this.quizService.deleteQuiz(quizId, userId);
    } catch (error) {
      throw error;
    }
  }
}
