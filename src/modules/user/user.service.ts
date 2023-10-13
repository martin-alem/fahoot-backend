import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { UpdateUserDTO } from './dto/update_user.dto';
import { SecurityService } from './../security/security.service';
import { InjectModel } from '@nestjs/mongoose';
import { IInternalUser, IInternalUpdate } from './../../types/user.types';
import { DEFAULT_DATABASE_CONNECTION, ErrorMessages } from './../../utils/constant';
import { log, validateObjectId } from './../../utils/helper';
import { TransactionManager } from '../shared/transaction.manager';
import Result from 'src/wrapper/result';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UserService {
  private readonly securityService: SecurityService;
  private readonly userModel: Model<User>;
  private readonly transactionManager: TransactionManager;
  private readonly loggerService: LoggerService;

  constructor(
    @Inject(forwardRef(() => SecurityService)) securityService: SecurityService,
    @InjectModel(User.name, DEFAULT_DATABASE_CONNECTION) userModel: Model<User>,
    transactionManager: TransactionManager,
    loggerService: LoggerService,
  ) {
    this.securityService = securityService;
    this.userModel = userModel;
    this.transactionManager = transactionManager;
    this.loggerService = loggerService;
  }

  /**
   * Create a new user. It checks if the user's email address is not already existing.
   * @param payload user payload
   * @param session mongodb session used for transaction
   * @returns a promise that resolves with a Result object
   */
  public async createUser(payload: IInternalUser): Promise<Result<User | null>> {
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
      const user = await this.userModel.create({ ...payload, password: hashedPasswordData });

      return new Result<User>(true, user, null, HttpStatus.CREATED);
    } catch (error) {
      log(this.loggerService, 'create_user_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Gets user with a specific id
   * @param userId user id
   * @returns a promise that resolves with a Result object
   */
  public async getUser(userId: string): Promise<Result<User | null>> {
    try {
      const isValidObjectId = validateObjectId(userId);

      if (!isValidObjectId.getData()) return new Result<null>(false, null, `Invalid user id`, HttpStatus.BAD_REQUEST);

      const user = await this.userModel.findById(userId);

      if (!user) return new Result<null>(false, null, `Could not find user`, HttpStatus.BAD_REQUEST);

      return new Result<User>(true, user, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'get_user_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Finds a user by email
   * @param emailAddress user email address
   * @returns a promise that resolves with a Result object
   */
  public async findByEmailAddress(emailAddress: string): Promise<Result<User | null>> {
    try {
      const user = await this.userModel.findOne({ emailAddress });

      if (!user) return new Result<null>(false, null, null, HttpStatus.OK);

      return new Result<User>(true, user, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'find_email_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Updates an existing user document with the payload. Takes an optional session if this method will be used within a transaction
   * @param payload update payload
   * @param userId user id
   * @param session mongodb session
   * @returns a promise that resolves with a Result object
   */
  public async updateUser(payload: UpdateUserDTO, userId: string): Promise<Result<User | null>> {
    try {
      const isValidObjectId = validateObjectId(userId);

      if (!isValidObjectId.getData()) return new Result<null>(false, null, `Invalid user id`, HttpStatus.BAD_REQUEST);

      const updatedUser = await this.userModel.findByIdAndUpdate(userId, payload, { new: true });

      if (!updatedUser) return new Result<null>(false, null, 'Unable to update user', HttpStatus.BAD_REQUEST);

      return new Result<User>(true, updatedUser, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'update_user_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Updates sensitive information about the user like verified status, password, role, etc. Takes in an optional session parameter if this method will be used in a transaction
   * @param payload user payload
   * @param emailAddress email address
   * @param session mongodb session
   * @returns a promise that resolves with a Result object
   */
  public async updateSensitiveData(payload: IInternalUpdate, emailAddress: string): Promise<Result<User | null>> {
    try {
      const updatedUser = await this.userModel.findOneAndUpdate({ emailAddress: emailAddress }, payload, { new: true });

      if (!updatedUser) return new Result<null>(false, null, 'Unable to update sensitive data', HttpStatus.BAD_REQUEST);

      return new Result<User>(true, updatedUser, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'update_sensitive_data_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Deletes a user and all related data using transactions. Takes an optional session parameter if this method will be used in a transaction
   * @param userId user id
   * @param ses mongodb session
   * @returns a promise that resolves with a Result object
   */
  public async deleteUser(userId: string): Promise<Result<boolean | null>> {
    try {
      const isValidObjectId = validateObjectId(userId);

      if (!isValidObjectId.getData()) {
        await this.transactionManager.abortTransaction();
        return new Result<null>(false, null, `Invalid user id`, HttpStatus.BAD_REQUEST);
      }

      const session = await this.transactionManager.startSession();
      await this.transactionManager.startTransaction();

      const deletedUser = await this.userModel.deleteOne({ _id: userId }, { session: session });
      if (!deletedUser.acknowledged) {
        await this.transactionManager.abortTransaction();
        return new Result<null>(false, null, `Could not delete user`, HttpStatus.BAD_REQUEST);
      }

      await this.transactionManager.commitTransaction();

      return new Result<boolean>(true, deletedUser.acknowledged, null, HttpStatus.OK);
    } catch (error) {
      await this.transactionManager.abortTransaction();
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await this.transactionManager.endSession();
    }
  }
}
