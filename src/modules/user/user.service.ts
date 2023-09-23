import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from './schema/user.schema';
import { ClientSession, Model } from 'mongoose';
import { UpdateUserDTO } from './dto/update_user.dto';
import { SecurityService } from './../security/security.service';
import { InjectModel } from '@nestjs/mongoose';
import { IInternalUser, IInternalUpdate } from './../../types/user.types';
import { ErrorMessages } from './../../utils/constant';
import { validateObjectId } from './../../utils/helper';
import { TransactionManager } from '../shared/transaction.manager';

@Injectable()
export class UserService {
  private readonly securityService: SecurityService;
  private readonly userModel: Model<User>;
  private readonly transactionManager: TransactionManager;

  constructor(securityService: SecurityService, @InjectModel(User.name) userModel: Model<User>, transactionManager: TransactionManager) {
    this.securityService = securityService;
    this.userModel = userModel;
    this.transactionManager = transactionManager;
  }

  /**
   * Create a new user. It checks if the user's email address is not already existing.
   * @param payload user payload
   * @param session mongodb session used for transaction
   * @returns a promise that resolves with a user document
   * @throws BadRequestException if user email already exist
   * @throws InternalServerErrorException if an unknown error occurs
   */
  public async createUser(payload: IInternalUser, session?: ClientSession): Promise<UserDocument> {
    try {
      const userExist = await this.userModel.findOne({ emailAddress: payload.emailAddress });
      if (userExist) throw new BadRequestException(`User ${payload.emailAddress} already exist`);
      let hashedPassword = null;
      if (payload.password) {
        hashedPassword = await this.securityService.hash(payload.password);
      }

      /**
       * Using an array as the first argument in userModel.create() because when using transactions
       * MongoDB expects an array of documents. We extract the first element afterwards since we're only interested in a single user.
       */
      const user = await this.userModel.create([{ ...payload, password: hashedPassword }], { session: session });
      return user[0];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  /**
   * Gets user with a specific id
   * @param userId user id
   * @returns a promise that resolves with a user document
   * @throws BadRequestException if user id is invalid
   * @throws NotFoundException if user id is not found
   * @throws InternalServerErrorException if an unknown error occurs
   */
  public async getUser(userId: string): Promise<UserDocument> {
    try {
      validateObjectId(userId);
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException(`User ${userId} not found`);
      return user;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  /**
   * Finds a user by email
   * @param emailAddress user email address
   * @returns a promise that resolves with a user document
   * @throws NotFoundException when user can't be found
   * @throws InternalServerErrorException if an unknown error occurs
   */
  public async findByEmailAddress(emailAddress: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findOne({ emailAddress });
      if (!user) throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
      return user;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  /**
   * Updates an existing user document with the payload. Takes an optional session if this method will be used within a transaction
   * @param payload update payload
   * @param userId user id
   * @param session mongodb session
   * @returns a promise that resolves with a user document
   * @throws BadRequestException if user id is invalid or update was not successful
   * @throws InternalServerErrorException if an unknown error occurs
   */
  public async updateUser(payload: UpdateUserDTO, userId: string, session?: ClientSession): Promise<UserDocument> {
    try {
      validateObjectId(userId);
      const updatedUser = await this.userModel.findByIdAndUpdate(userId, payload, { new: true, session: session });
      if (!updatedUser) throw new BadRequestException('Unable to update user');
      return updatedUser;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  /**
   * Updates sensitive information about the user like verified status, password, role, etc. Takes in an optional session parameter if this method will be used in a transaction
   * @param payload user payload
   * @param emailAddress email address
   * @param session mongodb session
   * @returns a promise that resolves to void
   * @throws BadRequestException if update was not successful
   * @throws InternalServerErrorException if an unknown error occurs
   */
  public async updateSensitiveData(payload: IInternalUpdate, emailAddress: string, session?: ClientSession): Promise<void> {
    try {
      const updatedUser = await this.userModel.findOneAndUpdate({ emailAddress: emailAddress }, payload, { new: true, session: session });
      if (!updatedUser) throw new BadRequestException('Unable to update user');
      return;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  /**
   * Deletes a user and all related data using transactions. Takes an optional session parameter if this method will be used in a transaction
   * @param userId user id
   * @param ses mongodb session
   * @throws BadRequestException if user id is not valid
   * @throws InternalServerErrorException if an unknown error occurs
   */
  public async deleteUser(userId: string, ses?: ClientSession): Promise<void> {
    let session = null;
    try {
      if (ses) {
        session = ses;
      } else {
        session = await this.transactionManager.startSession();
      }
      validateObjectId(userId);
      await this.transactionManager.startTransaction();
      await this.userModel.findByIdAndDelete(userId, { session: session });
      await this.transactionManager.commitTransaction();
      return;
    } catch (error) {
      await this.transactionManager.abortTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    } finally {
      await this.transactionManager.endSession();
    }
  }
}
