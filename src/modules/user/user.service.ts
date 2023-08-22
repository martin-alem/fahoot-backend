/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, forwardRef } from '@nestjs/common';
import { LoggerService } from './../logger/logger.service';
import { User } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import { UpdateUserDTO } from './dto/update_user.dto';
import { SecurityService } from './../security/security.service';
import { InjectModel } from '@nestjs/mongoose';
import { LEVEL } from 'src/types/log.types';
import { IInternalUser, IPlainUser, IInternalUpdate } from 'src/types/user.types';
import { ErrorMessages } from 'src/utils/constant';

@Injectable()
export class UserService {
  private readonly loggerService: LoggerService;
  private readonly securityService: SecurityService;
  private readonly userModel: Model<User>;

  constructor(loggerService: LoggerService, @Inject(forwardRef(() => SecurityService)) securityService: SecurityService, @InjectModel(User.name) userModel: Model<User>) {
    this.loggerService = loggerService;
    this.securityService = securityService;
    this.userModel = userModel;
  }

  public async createUser(payload: IInternalUser): Promise<IPlainUser> {
    try {
      const userExist = await this.userModel.findOne({ emailAddress: payload.emailAddress });
      if (userExist) throw new BadRequestException(`User ${payload.emailAddress} already exist`);
      let hashedPassword = null;
      if (payload.password) {
        hashedPassword = await this.securityService.hash(payload.password);
      }
      const user = await this.userModel.create({ ...payload, password: hashedPassword });
      const userObject = user.toObject({ versionKey: false });
      const { password, role, ...userWithoutPassword } = userObject;
      return userWithoutPassword as IPlainUser;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.loggerService.log(JSON.stringify({ event: 'error_creating_user', description: error.message, level: LEVEL.CRITICAL }));
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async getUser(userId: string): Promise<IPlainUser> {
    if (!Types.ObjectId.isValid(userId)) {
      this.loggerService.log(JSON.stringify({ event: 'invalid_userId', description: 'Trying to access a user with invalid user id format', level: LEVEL.WARN }));
      throw new BadRequestException('Invalid user ID format');
    }

    try {
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException(`User ${userId} not found`);
      const userObject = user.toObject({ versionKey: false });
      const { password, role, ...userWithoutPassword } = userObject;
      return userWithoutPassword as IPlainUser;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      this.loggerService.log(JSON.stringify({ event: 'error_getting_user', description: error.message, level: LEVEL.CRITICAL }));
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async findByEmailAddress(emailAddress: string): Promise<IPlainUser> {
    try {
      const user = await this.userModel.findOne({ emailAddress });
      if (!user) throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.loggerService.log(JSON.stringify({ event: 'error_getting_user_by_email', description: error.message, level: LEVEL.CRITICAL }));
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async updateUser(payload: UpdateUserDTO, userId: string): Promise<IPlainUser> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(userId, payload, { new: true });
      if (!updatedUser) throw new BadRequestException('Unable to update user');
      const userObject = updatedUser.toObject({ versionKey: false });
      const { password, role, ...userWithoutPassword } = userObject;
      return userWithoutPassword as IPlainUser;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.loggerService.log(JSON.stringify({ event: 'error_updating_user', description: error.message, level: LEVEL.CRITICAL }));
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async updateSensitiveData(payload: IInternalUpdate, emailAddress: string): Promise<void> {
    try {
      const updatedUser = await this.userModel.findOneAndUpdate({ emailAddress: emailAddress }, payload, { new: true });
      if (!updatedUser) throw new BadRequestException('Unable to update user');
      return;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.loggerService.log(JSON.stringify({ event: 'error_updating_sensitive_data', description: error.message, level: LEVEL.CRITICAL }));
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async deleteUser(userId: string): Promise<void> {
    // Start a new session for the transaction
    const session = await this.userModel.db.startSession();

    try {
      session.startTransaction();

      // Find and delete the user
      const user = await this.userModel.findByIdAndDelete(userId, { session });
      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      // In the future, you can add more steps here, like deleting quizzes
      // e.g., await this.quizModel.deleteMany({ userId: userId }, { session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      this.loggerService.log(JSON.stringify({ event: 'error_deleting_user', description: error.message, level: LEVEL.CRITICAL }));
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    } finally {
      await session.endSession();
    }
  }
}
