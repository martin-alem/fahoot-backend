import { HttpStatus, Injectable } from '@nestjs/common';
import { Play } from './schema/play.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DEFAULT_DATABASE_CONNECTION, ErrorMessages, QuizStatus } from 'src/utils/constant';
import Result from 'src/wrapper/result';
import { generateCode, log, validateObjectId } from 'src/utils/helper';
import { QuizService } from '../quiz/quiz.service';
import { UpdatePlayDTO } from './dto/update-play.dto';
import { TransactionManager } from '../shared/transaction.manager';
import { PlayPaginationDTO } from './dto/play-pagination.dto';
import { IPaginationResult } from 'src/types/pagination_result.type';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class PlayService {
  private readonly playModel: Model<Play>;
  private readonly quizService: QuizService;
  private readonly transactionManager: TransactionManager;
  private readonly loggerService: LoggerService;

  constructor(
    @InjectModel(Play.name, DEFAULT_DATABASE_CONNECTION) playModel: Model<Play>,
    quizService: QuizService,
    transactionManager: TransactionManager,
    loggerService: LoggerService,
  ) {
    this.playModel = playModel;
    this.quizService = quizService;
    this.transactionManager = transactionManager;
    this.loggerService = loggerService;
  }

  public async createPlay(quizId: string, userId: string): Promise<Result<Play | null>> {
    try {
      const isValidQuizObjectId = validateObjectId(quizId);
      if (!isValidQuizObjectId.getData()) return new Result<null>(false, null, `Invalid quiz ${quizId}`, HttpStatus.BAD_REQUEST);

      const quiz = await this.quizService.getQuizById(quizId);

      const quizData = quiz.getData();

      if (!quizData) return new Result<null>(false, null, quiz.getError(), HttpStatus.BAD_REQUEST);

      if (quizData.status === QuizStatus.DRAFT)
        return new Result<null>(false, null, `Quiz must be published in order to create a play`, HttpStatus.BAD_REQUEST);

      const playName = quizData.title;
      const code = generateCode(7);

      const newPlay = await this.playModel.create({ quiz: quizId, user: userId, name: playName, code: code });

      if (!newPlay) return new Result<null>(false, null, 'Unable to create play at the moment', HttpStatus.BAD_REQUEST);

      return new Result<Play>(true, newPlay, null, HttpStatus.OK);
    } catch (error) {
      console.log(error);
      log(this.loggerService, 'create_play_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getPlayById(playId: string): Promise<Result<Play | null>> {
    try {
      const isValidPlayObjectId = validateObjectId(playId);
      if (!isValidPlayObjectId.getData()) return new Result<null>(false, null, `Invalid play id: ${playId}`, HttpStatus.BAD_REQUEST);

      const play = await this.playModel.findById(playId).populate('quiz').populate('user');

      if (!play) return new Result<null>(false, null, `Unable to find play with Id: ${playId}`, HttpStatus.BAD_REQUEST);

      return new Result<Play>(true, play, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'get_play_by_id_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getPlayByPin(gamePin: string): Promise<Result<Play | null>> {
    try {
      const play = await this.playModel.findOne({ code: gamePin }).populate('quiz').populate('user');

      if (!play) return new Result<null>(false, null, `Unable to find a play with pin: ${gamePin}`, HttpStatus.BAD_REQUEST);

      return new Result<Play>(true, play, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'get_play_by_pin_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getPlayList(quizId: string, pagination: PlayPaginationDTO): Promise<Result<IPaginationResult<Play> | null>> {
    try {
      const isValidQuizObjectId = validateObjectId(quizId);

      if (!isValidQuizObjectId.getData()) return new Result<null>(false, null, `Invalid quiz id: ${quizId}`, HttpStatus.BAD_REQUEST);

      const { page, pageSize, query } = pagination;

      //Preventing page from being 0
      const skip = (page == 0 ? 0 : page - 1) * pageSize;
      const sortField = pagination.sortField ?? 'createdAt';
      const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1;

      const totalPlays = await this.playModel.countDocuments({
        quiz: quizId,
        title: { $regex: query ? query : '', $options: 'i' },
      });
      const totalPages = Math.ceil(totalPlays / pageSize);

      const results = await this.playModel
        .find({ quiz: quizId, status: sortField })
        .where('title')
        .regex(new RegExp(query ? query : '', 'i'))
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(pageSize)
        .exec();

      return new Result<IPaginationResult<Play>>(true, { results, total: totalPlays, totalPages }, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'get_play_list_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async updatePlay(payload: UpdatePlayDTO, playId: string): Promise<Result<Play | null>> {
    try {
      const validatePlayObjectId = validateObjectId(playId);

      if (!validatePlayObjectId.getData()) return new Result<null>(false, null, `Invalid play id: ${playId}`, HttpStatus.BAD_REQUEST);

      const updatedPlay = await this.playModel.findOneAndUpdate({ _id: playId }, payload, { new: true });

      if (!updatedPlay) return new Result<null>(false, null, 'Unable to update play', HttpStatus.BAD_REQUEST);

      return new Result<Play>(true, updatedPlay, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'update_play_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deletePlay(playId: string): Promise<Result<boolean | null>> {
    try {
      const validatePlayObjectId = validateObjectId(playId);

      if (!validatePlayObjectId.getData()) return new Result<null>(false, null, `Invalid play id: ${playId}`, HttpStatus.BAD_REQUEST);

      const session = await this.transactionManager.startSession();

      await this.transactionManager.startTransaction();

      const deletedPlay = await this.playModel.deleteOne({ _id: playId }, { session: session });

      if (!deletedPlay.acknowledged) {
        await this.transactionManager.abortTransaction();
        return new Result<null>(false, null, 'Unable to delete play', HttpStatus.BAD_REQUEST);
      }
      await this.transactionManager.commitTransaction();

      return new Result<boolean>(true, deletedPlay.acknowledged, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'delete_play_error', error.message);
      await this.transactionManager.abortTransaction();
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await this.transactionManager.endSession();
    }
  }

  public async deletePlayList(quizId: string, playIds: string[]): Promise<Result<boolean | null>> {
    try {
      const validQuizObjectId = validateObjectId(quizId);

      if (!validQuizObjectId.getData()) return new Result<null>(false, null, `Invalid play id: ${quizId}`, HttpStatus.BAD_REQUEST);

      for (const q of playIds) {
        const isValidPlayObjectId = validateObjectId(q);
        if (!isValidPlayObjectId.getData()) return new Result<null>(false, null, `Invalid play id: ${q}`, HttpStatus.BAD_REQUEST);
      }

      const session = await this.transactionManager.startSession();

      await this.transactionManager.startTransaction();

      const deletedPlayList = await this.playModel.deleteMany({ quiz: quizId, _id: { $in: playIds } }, { session: session });

      if (!deletedPlayList.acknowledged) {
        await this.transactionManager.abortTransaction();
        return new Result<null>(false, null, `Unable to delete playlist`, HttpStatus.BAD_REQUEST);
      }

      return new Result<boolean>(true, deletedPlayList.acknowledged, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'delete_plays_error', error.message);
      await this.transactionManager.abortTransaction();
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await this.transactionManager.endSession();
    }
  }
}
