import { HttpStatus, Injectable } from '@nestjs/common';
import { Quiz } from './schema/quiz.schema';
import { CreateQuizDTO } from './dto/create_quiz.dto';
import { Model } from 'mongoose';
import { log, validateObjectId } from './../../utils/helper';
import { IPaginationResult } from './../../types/pagination_result.type';
import { QuizPaginationDTO } from './dto/quiz-pagination.dto';
import { InjectModel } from '@nestjs/mongoose';
import { LoggerService } from '../logger/logger.service';
import { TransactionManager } from '../shared/transaction.manager';
import { DEFAULT_DATABASE_CONNECTION, ErrorMessages } from './../../utils/constant';
import Result from 'src/wrapper/result';

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
   * @returns a promise that resolves to a Result object
   */
  public async createQuiz(payload: CreateQuizDTO, userId: string): Promise<Result<Quiz | null>> {
    try {
      const isValidObjectId = validateObjectId(userId);
      if (!isValidObjectId.getData()) return new Result<null>(false, null, `Invalid user objectId: ${userId}`, HttpStatus.BAD_REQUEST);

      const quiz = await this.quizModel.create({ ...payload, user: userId });
      if (!quiz) return new Result<null>(false, null, 'Unable to create quiz', HttpStatus.BAD_REQUEST);

      return new Result<Quiz>(true, quiz, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'create_quiz_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Gets a single quiz
   * @param quizId quiz id
   * @returns a promise that resolves to a Result object
   */
  public async getQuizById(quizId: string): Promise<Result<Quiz | null>> {
    try {
      const isValidObjectId = validateObjectId(quizId);
      if (!isValidObjectId.getData()) return new Result<null>(false, null, `Invalid quiz objectId: ${quizId}`, HttpStatus.BAD_REQUEST);

      const quiz = await this.quizModel.findById(quizId);
      if (!quiz) return new Result<null>(false, null, 'Quiz not found', HttpStatus.BAD_REQUEST);

      return new Result<Quiz>(true, quiz, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'get_quiz_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Gets a paginated result of quizzes
   * @param userId user id
   * @param pagination pagination options
   * @returns a promise that resolves to a Result object
   */
  public async getQuizzes(userId: string, pagination: QuizPaginationDTO): Promise<Result<IPaginationResult<Quiz> | null>> {
    try {
      const isValidObjectId = validateObjectId(userId);
      if (!isValidObjectId.getData()) return new Result<null>(false, null, `Invalid user objectId: ${userId}`, HttpStatus.BAD_REQUEST);

      const { page, pageSize, query } = pagination;

      //Preventing page from being 0
      const skip = (page == 0 ? 0 : page - 1) * pageSize;
      const sortField = pagination.sortField ?? 'published';
      const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1;

      const totalQuizzes = await this.quizModel.countDocuments({
        user: userId,
        status: sortField,
        title: { $regex: query ? query : '', $options: 'i' },
      });
      const totalPages = Math.ceil(totalQuizzes / pageSize);

      const results = await this.quizModel
        .find({ user: userId, status: sortField })
        .where('title')
        .regex(new RegExp(query ? query : '', 'i'))
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(pageSize)
        .exec();

      return new Result<IPaginationResult<Quiz>>(true, { results, total: totalQuizzes, totalPages }, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'get_quizzes_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Updates an entire quiz document.
   * @param quizId quiz id
   * @param userId user id
   * @param payload payload
   * @returns a promise that resolves to a Result object
   */
  public async updateQuiz(quizId: string, userId: string, payload: Partial<CreateQuizDTO>): Promise<Result<Quiz | null>> {
    try {
      const isValidQuizObjectId = validateObjectId(userId);
      if (!isValidQuizObjectId.getData()) return new Result<null>(false, null, `Invalid quiz objectId: ${quizId}`, HttpStatus.BAD_REQUEST);

      const isValidUserObjectId = validateObjectId(userId);
      if (!isValidUserObjectId.getData()) return new Result<null>(false, null, `Invalid user objectId: ${userId}`, HttpStatus.BAD_REQUEST);

      const updatedQuiz = await this.quizModel.findOneAndUpdate({ _id: quizId, user: userId }, payload, { new: true });
      if (!updatedQuiz) return new Result<null>(false, null, `Unable to update quiz`, HttpStatus.BAD_REQUEST);

      return new Result<Quiz>(true, updatedQuiz, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'update_quiz_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete many quizzes and its associated data.
   * @param quizId quiz id
   * @param userId user id
   * @param ses mongoose session
   * @returns a promise that resolves to a Result object
   */
  public async deleteQuiz(quizId: string, userId: string): Promise<Result<boolean | null>> {
    try {
      const isValidQuizObjectId = validateObjectId(userId);
      if (!isValidQuizObjectId.getData()) return new Result<null>(false, null, `Invalid quiz objectId: ${quizId}`, HttpStatus.BAD_REQUEST);

      const session = await this.transactionManager.startSession();
      await this.transactionManager.startTransaction();

      const result = await this.quizModel.deleteOne({ id: quizId, user: userId }, { session: session });

      if (!result.acknowledged) {
        await this.transactionManager.abortTransaction();
        return new Result<null>(false, null, 'Unable to delete quiz', HttpStatus.BAD_REQUEST);
      }
      await this.transactionManager.commitTransaction();
      return new Result<boolean>(true, result.acknowledged, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'delete_quiz_error', error.message);
      await this.transactionManager.abortTransaction();
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await this.transactionManager.endSession();
    }
  }

  /**
   * Delete all quizzes associated with a given user
   * @param userId user id
   * @param ses mongoose session
   * @returns a promise that resolves to a Result object
   */
  public async deleteAllQuizzes(userId: string, quizIds: string[]): Promise<Result<boolean | null>> {
    try {
      const isValidUserObjectId = validateObjectId(userId);
      if (!isValidUserObjectId.getData()) return new Result<null>(false, null, `Invalid user objectId: ${userId}`, HttpStatus.BAD_REQUEST);

      for (const q of quizIds) {
        const isValidQuizObjectId = validateObjectId(q);
        if (!isValidQuizObjectId.getData()) return new Result<null>(false, null, `Invalid Quiz id: ${q}`, HttpStatus.BAD_REQUEST);
      }

      const session = await this.transactionManager.startSession();

      await this.transactionManager.startTransaction();

      const result = await this.quizModel.deleteMany({ user: userId, _id: { $in: quizIds } }, { session: session });
      if (!result.acknowledged) {
        await this.transactionManager.abortTransaction();
        return new Result<null>(false, null, 'Unable to delete quizzes', HttpStatus.BAD_REQUEST);
      }

      return new Result<boolean>(true, result.acknowledged, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'delete_quizzes_error', error.message);
      await this.transactionManager.abortTransaction();
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await this.transactionManager.endSession();
    }
  }
}
