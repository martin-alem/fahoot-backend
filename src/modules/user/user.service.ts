import { HttpStatus, Injectable } from '@nestjs/common';
import { User, UserDocument } from './schema/user.schema';
import { ClientSession, Model } from 'mongoose';
import { UpdateUserDTO } from './dto/update_user.dto';
import { SecurityService } from './../security/security.service';
import { InjectModel } from '@nestjs/mongoose';
import { IInternalUser, IInternalUpdate } from './../../types/user.types';
import { DEFAULT_DATABASE_CONNECTION } from './../../utils/constant';
import { validateObjectId } from './../../utils/helper';
import { TransactionManager } from '../shared/transaction.manager';
import { QuizService } from '../quiz/quiz.service';
import Result from 'src/wrapper/result';

@Injectable()
export class UserService {
  private readonly securityService: SecurityService;
  private readonly userModel: Model<User>;
  private readonly transactionManager: TransactionManager;
  private readonly quizService: QuizService;

  constructor(
    securityService: SecurityService,
    @InjectModel(User.name, DEFAULT_DATABASE_CONNECTION) userModel: Model<User>,
    transactionManager: TransactionManager,
    quizService: QuizService,
  ) {
    this.securityService = securityService;
    this.userModel = userModel;
    this.transactionManager = transactionManager;
    this.quizService = quizService;
  }

  /**
   * Create a new user. It checks if the user's email address is not already existing.
   * @param payload user payload
   * @param session mongodb session used for transaction
   * @returns a promise that resolves with a Result object
   */
  public async createUser(payload: IInternalUser, session?: ClientSession): Promise<Result<UserDocument | null>> {
    try {
      const userExist = await this.userModel.findOne({ emailAddress: payload.emailAddress });

      if (userExist) return new Result<null>(false, null, `User ${payload.emailAddress} already exist`, HttpStatus.BAD_REQUEST);

      let hashedPassword = null;

      let hashedPasswordData = null;

      if (payload.password) {
        hashedPassword = await this.securityService.hash(payload.password);

        hashedPasswordData = hashedPassword.getData();

        if (!hashedPasswordData) return new Result<null>(false, null, 'Unable to hash password', HttpStatus.BAD_REQUEST);
      }
      /**
       * Using an array as the first argument in userModel.create() because when using transactions
       * MongoDB expects an array of documents. We extract the first element afterwards since we're only interested in a single user.
       */
      const user = await this.userModel.create([{ ...payload, password: hashedPasswordData }], { session: session });

      return new Result<UserDocument>(true, user[0], null, HttpStatus.CREATED);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Gets user with a specific id
   * @param userId user id
   * @returns a promise that resolves with a Result object
   */
  public async getUser(userId: string): Promise<Result<UserDocument | null>> {
    try {
      const isValidObjectId = validateObjectId(userId);

      if (!isValidObjectId.getData()) return new Result<null>(false, null, `Invalid objectId: ${userId}`, HttpStatus.BAD_REQUEST);

      const user = await this.userModel.findById(userId);

      if (!user) return new Result<null>(false, null, `User ${userId} not found`, HttpStatus.BAD_REQUEST);

      return new Result<UserDocument>(true, user, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Finds a user by email
   * @param emailAddress user email address
   * @returns a promise that resolves with a Result object
   */
  public async findByEmailAddress(emailAddress: string): Promise<Result<UserDocument | null>> {
    try {
      const user = await this.userModel.findOne({ emailAddress });

      if (!user) return new Result<null>(false, null, `User with ${emailAddress} not found`, HttpStatus.BAD_REQUEST);

      return new Result<UserDocument>(true, user, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Updates an existing user document with the payload. Takes an optional session if this method will be used within a transaction
   * @param payload update payload
   * @param userId user id
   * @param session mongodb session
   * @returns a promise that resolves with a Result object
   */
  public async updateUser(payload: UpdateUserDTO, userId: string, session?: ClientSession): Promise<Result<UserDocument | null>> {
    try {
      const isValidObjectId = validateObjectId(userId);

      if (!isValidObjectId.getData()) return new Result<null>(false, null, `Invalid objectId: ${userId}`, HttpStatus.BAD_REQUEST);

      const updatedUser = await this.userModel.findByIdAndUpdate(userId, payload, { new: true, session: session });

      if (!updatedUser) return new Result<null>(false, null, 'unable to update user', HttpStatus.BAD_REQUEST);

      return new Result<UserDocument>(true, updatedUser, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Updates sensitive information about the user like verified status, password, role, etc. Takes in an optional session parameter if this method will be used in a transaction
   * @param payload user payload
   * @param emailAddress email address
   * @param session mongodb session
   * @returns a promise that resolves with a Result object
   */
  public async updateSensitiveData(payload: IInternalUpdate, emailAddress: string, session?: ClientSession): Promise<Result<UserDocument | null>> {
    try {
      const updatedUser = await this.userModel.findOneAndUpdate({ emailAddress: emailAddress }, payload, { new: true, session: session });

      if (!updatedUser) return new Result<null>(false, null, 'Unable to update sensitive data', HttpStatus.BAD_REQUEST);

      return new Result<UserDocument>(true, updatedUser, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Deletes a user and all related data using transactions. Takes an optional session parameter if this method will be used in a transaction
   * @param userId user id
   * @param ses mongodb session
   * @returns a promise that resolves with a Result object
   */
  public async deleteUser(userId: string): Promise<Result<UserDocument | null>> {
    try {
      const session = await this.transactionManager.startSession();

      const isValidObjectId = validateObjectId(userId);

      if (!isValidObjectId.getData()) {
        await this.transactionManager.abortTransaction();
        return new Result<null>(false, null, `Invalid objectId: ${userId}`, HttpStatus.BAD_REQUEST);
      }

      await this.transactionManager.startTransaction();

      const deletedUser = await this.userModel.findByIdAndDelete(userId, { session: session });
      if (!deletedUser) {
        await this.transactionManager.abortTransaction();
        return new Result<null>(false, null, `Could not delete user`, HttpStatus.BAD_REQUEST);
      }

      const deleteQuizzes = await this.quizService.deleteAllQuizzes(userId, session);
      if (!deleteQuizzes.isSuccess()) {
        await this.transactionManager.abortTransaction();
        return new Result<null>(false, null, `Could not delete user quizzes`, HttpStatus.BAD_REQUEST);
      }

      await this.transactionManager.commitTransaction();

      return new Result<UserDocument>(true, deletedUser, null, HttpStatus.OK);
    } catch (error) {
      await this.transactionManager.abortTransaction();
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await this.transactionManager.endSession();
    }
  }
}
