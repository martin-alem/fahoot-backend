import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Quiz } from './schema/quiz.schema';
import { CreateQuizDTO } from './dto/create_quiz.dto';
import { ClientSession, Model } from 'mongoose';
import { LEVEL } from './../../types/log.types';
import { validateObjectId } from './../../utils/helper';
import { IPaginationResult } from './../../types/pagination_result.type';
import { PaginationDTO } from './dto/pagination.dto';
import { InjectModel } from '@nestjs/mongoose';
import { LoggerService } from '../logger/logger.service';
import { TransactionManager } from '../shared/transaction.manager';
import { DEFAULT_DATABASE_CONNECTION } from 'src/utils/constant';

@Injectable()
export class QuizService {
  private readonly loggerService: LoggerService;
  private readonly quizModel: Model<Quiz>;
  private readonly transactionManager: TransactionManager;

  constructor(
    loggerService: LoggerService,
    @InjectModel(Quiz.name, DEFAULT_DATABASE_CONNECTION) quizModel: Model<Quiz>,
    transactionManager: TransactionManager,
  ) {
    this.loggerService = loggerService;
    this.quizModel = quizModel;
    this.transactionManager = transactionManager;
  }

  /**
   * Create a new quiz
   * @param payload payload
   * @param userId user id
   * @returns a promise that is resolved when the Quiz
   * @throws a BadRequestException if user id is invalid
   */
  public async createQuiz(payload: CreateQuizDTO, userId: string): Promise<Quiz> {
    try {
      validateObjectId(userId);
      const quiz = await this.quizModel.create({ ...payload, userId });
      if (!quiz) throw new InternalServerErrorException();
      return quiz;
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Gets a single quiz
   * @param quizId quiz id
   * @returns a promise that is resolved when the Quiz
   * @throws a BadRequestException if quiz id is invalid
   */
  public async getQuizById(quizId: string): Promise<Quiz> {
    try {
      validateObjectId(quizId);
      const quiz = await this.quizModel.findById(quizId);
      if (!quiz) throw new InternalServerErrorException();
      return quiz;
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Gets a paginated result of quizzes
   * @param userId user id
   * @param pagination pagination options
   * @returns a promise that resolves to a paginationResult
   * @throws a BadRequestException if quiz id is invalid
   */
  public async getQuizzes(userId: string, pagination: PaginationDTO): Promise<IPaginationResult<Quiz>> {
    try {
      validateObjectId(userId);
      const { page, pageSize } = pagination;

      const totalQuizzes = await this.quizModel.countDocuments({ userId: userId });
      const totalPages = Math.ceil(totalQuizzes / pageSize);

      const skip = (page - 1) * pageSize;

      const sortField = pagination.sortField ?? 'published';
      const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1;

      const results = await this.quizModel
        .find({ userId: userId })
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(pageSize)
        .exec();

      return { results, total: totalQuizzes, totalPages };
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Updates an entire quiz document.
   * @param quizId quiz id
   * @param userId user id
   * @param payload payload
   * @returns a promise the resolves to a quiz
   */
  public async updateQuiz(quizId: string, userId: string, payload: Partial<CreateQuizDTO>): Promise<Quiz> {
    try {
      validateObjectId(quizId);
      validateObjectId(userId);
      const updatedQuiz = await this.quizModel.findOneAndUpdate({ id: quizId, userId: userId }, payload, { new: true });
      if (!updatedQuiz) throw new InternalServerErrorException();
      return updatedQuiz;
    } catch (error) {
      this.loggerService.log(JSON.stringify({ event: 'error_updating_quiz', description: error.message, level: LEVEL.CRITICAL }));
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Delete many quizzes and its associated data.
   * @param quizId quiz id
   * @param userId user id
   * @param ses mongoose session
   * @returns void
   */
  public async deleteQuiz(quizId: string, userId: string, ses?: ClientSession): Promise<void> {
    let session = null;
    try {
      if (ses) {
        session = ses;
      } else {
        session = await this.transactionManager.startSession();
      }
      validateObjectId(quizId);
      await this.transactionManager.startTransaction();
      await this.quizModel.findOneAndDelete({ id: quizId, userId: userId }, { session: session });
      await this.transactionManager.commitTransaction();
      return;
    } catch (error) {
      await this.transactionManager.abortTransaction();
      if (error instanceof BadRequestException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error.message);
    } finally {
      await this.transactionManager.endSession();
    }
  }

  /**
   * Delete one or more quizzes associated with the given user
   * @param userId user id
   * @param ses mongoose session
   * @returns void
   */
  public async deleteQuizzes(userId: string, quizId: string[], ses?: ClientSession): Promise<void> {
    let session = null;
    try {
      if (ses) {
        session = ses;
      } else {
        session = await this.transactionManager.startSession();
      }
      validateObjectId(userId);
      await this.transactionManager.startTransaction();
      await this.quizModel.deleteMany({ _id: { $in: quizId } }, { session: session });
      await this.transactionManager.commitTransaction();
      return;
    } catch (error) {
      await this.transactionManager.abortTransaction();
      if (error instanceof BadRequestException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error.message);
    } finally {
      await this.transactionManager.endSession();
    }
  }

  /**
   * Delete all quizzes associated with a given user
   * @param userId user id
   * @param ses mongoose session
   * @returns void
   */
  public async deleteAllQuizzes(userId: string, ses?: ClientSession): Promise<void> {
    let session = null;
    try {
      if (ses) {
        session = ses;
      } else {
        session = await this.transactionManager.startSession();
      }
      validateObjectId(userId);
      await this.transactionManager.startTransaction();
      await this.quizModel.deleteMany({ userId: userId }, { session: session });
      await this.transactionManager.commitTransaction();
      return;
    } catch (error) {
      await this.transactionManager.abortTransaction();
      if (error instanceof BadRequestException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error.message);
    } finally {
      await this.transactionManager.endSession();
    }
  }
}
