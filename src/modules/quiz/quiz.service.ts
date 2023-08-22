import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Quiz } from './schema/quiz.schema';
import { ErrorMessages } from 'src/utils/constant';
import { CreateQuizDTO } from './dto/create_quiz.dto';
import { Model } from 'mongoose';
import { LEVEL } from 'src/types/log.types';
import { validateObjectId } from 'src/utils/helper';
import { IPaginationResult } from 'src/types/pagination_result.type';
import { PaginationDTO } from './dto/pagination.dto';
import { InjectModel } from '@nestjs/mongoose';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class QuizService {
  private readonly loggerService: LoggerService;
  private readonly quizModel: Model<Quiz>;

  constructor(loggerService: LoggerService, @InjectModel(Quiz.name) quizModel: Model<Quiz>) {
    this.loggerService = loggerService;
    this.quizModel = quizModel;
  }

  public async createQuiz(payload: CreateQuizDTO, userId: string): Promise<Quiz> {
    try {
      validateObjectId(userId, this.loggerService);
      const quiz = await this.quizModel.create({ ...payload, userId });
      if (!quiz) throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
      return quiz;
    } catch (error) {
      this.loggerService.log(JSON.stringify({ event: 'error_creating_quiz', description: error.message, level: LEVEL.CRITICAL }));
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async getQuizById(quizId: string): Promise<Quiz> {
    try {
      validateObjectId(quizId, this.loggerService);
      const quiz = await this.quizModel.findById(quizId);
      if (!quiz) throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
      return quiz;
    } catch (error) {
      this.loggerService.log(JSON.stringify({ event: 'error_getting_quiz', description: error.message, level: LEVEL.CRITICAL }));
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async getQuizzes(userId: string, pagination: PaginationDTO): Promise<IPaginationResult<Quiz>> {
    try {
      validateObjectId(userId, this.loggerService);
      const { page, pageSize } = pagination;

      const totalQuizzes = await this.quizModel.countDocuments();
      const totalPages = Math.ceil(totalQuizzes / pageSize);

      const skip = (page - 1) * pageSize;

      const sortField = pagination.sortField ?? 'createdAt';
      const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1;

      const results = await this.quizModel
        .find({})
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(pageSize)
        .exec();

      return { results, total: totalQuizzes, totalPages };
    } catch (error) {
      this.loggerService.log(JSON.stringify({ event: 'error_getting_quizzes', description: error.message, level: LEVEL.CRITICAL }));
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async updateQuiz(quizId: string, payload: Partial<CreateQuizDTO>): Promise<Quiz> {
    try {
      validateObjectId(quizId, this.loggerService);
      const updatedQuiz = await this.quizModel.findOneAndUpdate({ id: quizId }, payload, { new: true });
      if (!updatedQuiz) throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
      return updatedQuiz;
    } catch (error) {
      this.loggerService.log(JSON.stringify({ event: 'error_updating_quiz', description: error.message, level: LEVEL.CRITICAL }));
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async deleteQuiz(quizId: string): Promise<void> {
    try {
      validateObjectId(quizId, this.loggerService);
      await this.quizModel.findOneAndDelete({ id: quizId });
      return;
    } catch (error) {
      this.loggerService.log(JSON.stringify({ event: 'error_deleting_quiz', description: error.message, level: LEVEL.CRITICAL }));
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }
}
