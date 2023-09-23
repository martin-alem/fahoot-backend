import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { SecurityService } from '../security/security.service';
import { User } from './schema/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { validateObjectId } from './../../utils/helper';
import { AuthenticationMethod, Status } from './../../utils/constant';
import { TransactionManager } from '../shared/transaction.manager';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ClientSession } from 'mongoose';

jest.mock('../security/security.service');
jest.mock('../shared/transaction.manager');
jest.mock('./../../utils/helper', () => ({
  validateObjectId: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let mockSecurityService: SecurityService;
  let mockTransactionManager: TransactionManager;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const InternalUser = {
    firstName: 'John',
    lastName: 'Deo',
    emailAddress: 'john@gmail.com',
    authenticationMethod: AuthenticationMethod.MANUAL,
    avatarUrl: '',
    password: 'test_password',
    verified: true,
    status: Status.ACTIVE,
  };

  const UpdateDTO = {
    firstName: 'John',
    lastName: 'Deo',
    avatarUrl: '',
  };

  const UpdateInternal = {
    emailAddress: 'john.deo@gmail.com',
    password: 'password',
    verified: true,
    status: Status.ACTIVE,
  };

  const InternalUserWithNullPassword = {
    firstName: 'John',
    lastName: 'Deo',
    emailAddress: 'john@gmail.com',
    authenticationMethod: AuthenticationMethod.MANUAL,
    avatarUrl: '',
    password: '',
    verified: true,
    status: Status.ACTIVE,
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        SecurityService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        TransactionManager,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockSecurityService = module.get<SecurityService>(SecurityService);
    mockTransactionManager = module.get<TransactionManager>(TransactionManager);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create User', () => {
    it('should create a new user', async () => {
      mockUserModel.create = jest.fn().mockResolvedValue([InternalUser]);
      mockUserModel.findOne = jest.fn().mockResolvedValue(null);
      mockSecurityService.hash = jest.fn().mockResolvedValue('password');
      expect(await service.createUser(InternalUser)).toEqual(InternalUser);
    });

    it('should throw a BadRequestException for an existing user', async () => {
      mockUserModel.create = jest.fn().mockResolvedValue(InternalUser);
      mockUserModel.findOne = jest.fn().mockResolvedValue(InternalUser);
      mockSecurityService.hash = jest.fn().mockResolvedValue('password');
      await expect(service.createUser(InternalUser)).rejects.toThrow(BadRequestException);
    });

    it('should call hash function if password is not empty', async () => {
      mockUserModel.create = jest.fn().mockResolvedValue(InternalUser);
      mockUserModel.findOne = jest.fn().mockResolvedValue(null);
      const spy = jest.spyOn(mockSecurityService, 'hash');
      await service.createUser(InternalUser);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not call hash function if password is empty', async () => {
      mockUserModel.create = jest.fn().mockResolvedValue(InternalUser);
      mockUserModel.findOne = jest.fn().mockResolvedValue(null);
      const spy = jest.spyOn(mockSecurityService, 'hash');
      await service.createUser(InternalUserWithNullPassword);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should throw and InternalServerErrorException if and error occurs in findOne', async () => {
      mockUserModel.findOne = jest.fn().mockRejectedValue(new Error());
      await expect(service.createUser(InternalUser)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw and InternalServerErrorException if and error occurs in create', async () => {
      mockUserModel.findOne = jest.fn().mockRejectedValue(new Error());
      await expect(service.createUser(InternalUser)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Get User', () => {
    it('should call validateObjectId and return a user', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue(InternalUser);
      const result = await service.getUser('userId');
      expect(validateObjectId).toHaveBeenCalledWith('userId');
      expect(validateObjectId).toHaveBeenCalledTimes(1);
      expect(result).toEqual(InternalUser);
    });

    it('should throw a NotFoundException if user is not found', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue(null);
      await expect(service.getUser('userId')).rejects.toThrow(NotFoundException);
      expect(validateObjectId).toHaveBeenCalledWith('userId');
      expect(validateObjectId).toHaveBeenCalledTimes(1);
    });

    it('should throw a BadRequestException for an invalid id', async () => {
      (validateObjectId as jest.Mock).mockImplementation(() => {
        throw new BadRequestException();
      });
      mockUserModel.findById = jest.fn().mockResolvedValue(InternalUser);
      await expect(service.getUser('Invalid_Id')).rejects.toThrow(BadRequestException);
    });

    it('should throw an InternalServerErrorException if error occurs in validateObjectId', async () => {
      (validateObjectId as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      await expect(service.getUser('user_id')).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerErrorException if error occurs in findById', async () => {
      mockUserModel.findById = jest.fn().mockRejectedValue(new Error());
      await expect(service.getUser('user_id')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('find By Email', () => {
    it('should return a user', async () => {
      mockUserModel.findOne = jest.fn().mockResolvedValue(InternalUser);
      const result = await service.findByEmailAddress('john@gmail.com');
      expect(result).toEqual(InternalUser);
    });

    it('should throw a NotFoundException if email does not exist', async () => {
      mockUserModel.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.findByEmailAddress('john@gmail.com')).rejects.toThrow(BadRequestException);
    });

    it('should throw a InternalServerErrorException if error occurs in findOne', async () => {
      mockUserModel.findOne = jest.fn().mockRejectedValue(new Error());
      await expect(service.findByEmailAddress('john@gmail.com')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Update User', () => {
    it('should call validateObjectId and return the updated user', async () => {
      mockUserModel.findByIdAndUpdate = jest.fn().mockResolvedValue(InternalUser);
      const result = await service.updateUser(UpdateDTO, 'userId');
      expect(validateObjectId).toHaveBeenCalledTimes(1);
      expect(validateObjectId).toHaveBeenCalledWith('userId');
      expect(result).toEqual(InternalUser);
    });

    it('should call validateObjectId and throw a BadRequestException if id is not found', async () => {
      mockUserModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
      await expect(service.updateUser(UpdateDTO, 'userId')).rejects.toThrow(BadRequestException);
      expect(validateObjectId).toHaveBeenCalledTimes(1);
      expect(validateObjectId).toHaveBeenCalledWith('userId');
    });

    it('should throw a BadRequestException if id validation fails', async () => {
      (validateObjectId as jest.Mock).mockImplementation(() => {
        throw new BadRequestException();
      });
      await expect(service.updateUser(UpdateDTO, 'userId')).rejects.toThrow(BadRequestException);
    });

    it('should throw an InternalServerErrorException if error occurs in validateObjectId', async () => {
      (validateObjectId as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      await expect(service.updateUser(UpdateDTO, 'userId')).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerErrorException if error occurs in findByIdAndUpdate', async () => {
      mockUserModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error());
      await expect(service.updateUser(UpdateDTO, 'userId')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Update Sensitive Data', () => {
    it('should update a user with throwing an error', async () => {
      mockUserModel.findOneAndUpdate = jest.fn().mockResolvedValue(InternalUser);
      await expect(service.updateSensitiveData(UpdateInternal, 'john.deo@gmail.com')).resolves.toBeUndefined();
    });

    it('should throw a BadRequestException if email address is not found', async () => {
      mockUserModel.findOneAndUpdate = jest.fn().mockResolvedValue(null);
      await expect(service.updateSensitiveData(UpdateInternal, 'john@example.com')).rejects.toThrow(BadRequestException);
    });

    it('should throw a InternalServerErrorException if error occurs in findOneAndUpdate', async () => {
      mockUserModel.findOneAndUpdate = jest.fn().mockRejectedValue(new Error());
      await expect(service.updateSensitiveData(UpdateInternal, 'john@example.com')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Delete User', () => {
    it('should call startSession and validateObject if input session is undefined', async () => {
      mockUserModel.findByIdAndDelete = jest.fn().mockResolvedValue(InternalUser);
      mockTransactionManager.startSession = jest.fn().mockResolvedValue({});
      mockTransactionManager.startTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.commitTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.abortTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.endSession = jest.fn().mockResolvedValue({});
      await service.deleteUser('userId');
      expect(mockTransactionManager.startSession).toHaveBeenCalledTimes(1);
      expect(validateObjectId).toHaveBeenCalledWith('userId');
    });

    it('should not call startSession if input session is defined', async () => {
      mockUserModel.findByIdAndDelete = jest.fn().mockResolvedValue(InternalUser);
      mockTransactionManager.startSession = jest.fn().mockResolvedValue({});
      mockTransactionManager.startTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.commitTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.abortTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.endSession = jest.fn().mockResolvedValue({});
      await service.deleteUser('userId', {} as ClientSession);
      expect(mockTransactionManager.startSession).not.toHaveBeenCalled();
    });

    it('should call startTransaction, findByIdAndDelete, commitTransaction and endSession if session is undefined', async () => {
      mockUserModel.findByIdAndDelete = jest.fn().mockResolvedValue(InternalUser);
      mockTransactionManager.startSession = jest.fn().mockResolvedValue({});
      mockTransactionManager.startTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.commitTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.abortTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.endSession = jest.fn().mockResolvedValue({});

      await service.deleteUser('userId');
      expect(mockTransactionManager.startTransaction).toHaveBeenCalledTimes(1);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('userId', { session: {} });
      expect(mockTransactionManager.commitTransaction).toHaveBeenCalledTimes(1);
      expect(mockTransactionManager.endSession).toHaveBeenCalledTimes(1);
    });

    it('should call startTransaction, findByIdAndDelete, commitTransaction and endSession if session is defined', async () => {
      mockUserModel.findByIdAndDelete = jest.fn().mockResolvedValue(InternalUser);
      mockTransactionManager.startSession = jest.fn().mockResolvedValue({});
      mockTransactionManager.startTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.commitTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.abortTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.endSession = jest.fn().mockResolvedValue({});

      await service.deleteUser('userId', {} as ClientSession);
      expect(mockTransactionManager.startTransaction).toHaveBeenCalledTimes(1);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('userId', { session: {} });
      expect(mockTransactionManager.commitTransaction).toHaveBeenCalledTimes(1);
      expect(mockTransactionManager.endSession).toHaveBeenCalledTimes(1);
    });

    it('should throw a BadRequestException if id is invalid', async () => {
      mockUserModel.findByIdAndDelete = jest.fn().mockResolvedValue(InternalUser);
      (validateObjectId as jest.Mock).mockImplementation(() => {
        throw new BadRequestException();
      });
      mockTransactionManager.startSession = jest.fn().mockResolvedValue({});
      mockTransactionManager.abortTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.endSession = jest.fn().mockResolvedValue({});
      await expect(service.deleteUser('userId', {} as ClientSession)).rejects.toThrow(BadRequestException);
    });

    it('should throw an InternalSeverErrorException if any error occurs', async () => {
      mockUserModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error());
      mockTransactionManager.startSession = jest.fn().mockResolvedValue({});
      mockTransactionManager.abortTransaction = jest.fn().mockResolvedValue({});
      mockTransactionManager.endSession = jest.fn().mockResolvedValue({});
      await expect(service.deleteUser('userId', {} as ClientSession)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
