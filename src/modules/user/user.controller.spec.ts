import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { Request } from 'express';
import { UserService } from './user.service';
import { LoggerService } from '../logger/logger.service';
import { AuthService } from './../shared/auth.service';
import { log } from './../../utils/helper';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

jest.mock('./user.service');
jest.mock('../logger/logger.service');
jest.mock('./../shared/auth.service');
jest.mock('./../../guard/auth.guard');
jest.mock('./../../utils/helper', () => ({
  setCookie: jest.fn(),
  log: jest.fn(),
}));

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: UserService;
  let mockAuthService: AuthService;

  const mockRequest: Partial<Request> = {
    get: jest.fn(),
  };

  const mockUser = {
    firstName: 'john',
    lastName: 'deo',
    emailAddress: 'john.deo@gmail.com',
    authenticationMethod: 'manual',
    avatarUrl: null,
    verified: false,
    status: 'inactive',
  };

  const updateUserDTO = {
    firstName: 'john',
    lastName: 'deo',
    avatarUrl: '',
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, AuthService, LoggerService],
    }).compile();

    controller = module.get<UserController>(UserController);
    mockUserService = module.get<UserService>(UserService);
    mockAuthService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get user', () => {
    it('should call AuthService.getId, UserService.getUser and return a user', async () => {
      mockAuthService.getId = jest.fn().mockReturnValue('userId');
      mockUserService.getUser = jest.fn().mockResolvedValue(mockUser);
      const spy = jest.spyOn(mockAuthService, 'getId');
      const spy2 = jest.spyOn(mockUserService, 'getUser');
      const result = await controller.getUser(mockRequest as Request);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledWith('userId');
      expect(result).toEqual(mockUser);
    });

    it('should throw a BadRequestException and call log when Id is invalid', async () => {
      mockAuthService.getId = jest.fn().mockReturnValue('userId');
      mockUserService.getUser = jest.fn().mockRejectedValue(new BadRequestException());
      await expect(controller.getUser(mockRequest as Request)).rejects.toThrow(BadRequestException);
      expect(log).toHaveBeenCalledTimes(1);
    });

    it('should throw a NotFoundException and call log when Id is not found', async () => {
      mockAuthService.getId = jest.fn().mockReturnValue('userId');
      mockUserService.getUser = jest.fn().mockRejectedValue(new NotFoundException());
      await expect(controller.getUser(mockRequest as Request)).rejects.toThrow(NotFoundException);
      expect(log).toHaveBeenCalledTimes(1);
    });

    it('should throw an InternalServerErrorException and call log when an error occurs in getUser', async () => {
      mockAuthService.getId = jest.fn().mockReturnValue('userId');
      mockUserService.getUser = jest.fn().mockRejectedValue(new InternalServerErrorException());
      await expect(controller.getUser(mockRequest as Request)).rejects.toThrow(InternalServerErrorException);
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('Update User', () => {
    it('should call AuthService.getId, UserService.updateUser and return an updated user', async () => {
      mockAuthService.getId = jest.fn().mockReturnValue('userId');
      mockUserService.updateUser = jest.fn().mockResolvedValue(mockUser);
      const spy = jest.spyOn(mockAuthService, 'getId');
      const spy2 = jest.spyOn(mockUserService, 'updateUser');
      const result = await controller.updateUser(updateUserDTO, mockRequest as Request);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledWith(updateUserDTO, 'userId');
      expect(result).toEqual(mockUser);
    });

    it('should throw a BadRequestException and call log when Id is invalid', async () => {
      mockAuthService.getId = jest.fn().mockReturnValue('userId');
      mockUserService.updateUser = jest.fn().mockRejectedValue(new BadRequestException());
      await expect(controller.updateUser(updateUserDTO, mockRequest as Request)).rejects.toThrow(BadRequestException);
      expect(log).toHaveBeenCalledTimes(1);
    });

    it('should throw an InternalServerErrorException and call log when an error occurs in updateUser', async () => {
      mockAuthService.getId = jest.fn().mockReturnValue('userId');
      mockUserService.updateUser = jest.fn().mockRejectedValue(new InternalServerErrorException());
      await expect(controller.updateUser(updateUserDTO, mockRequest as Request)).rejects.toThrow(InternalServerErrorException);
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('Delete User', () => {
    it('should call AuthService.getId, UserService.deleteUser', async () => {
      mockAuthService.getId = jest.fn().mockReturnValue('userId');
      mockUserService.deleteUser = jest.fn().mockResolvedValue(undefined);
      const spy = jest.spyOn(mockAuthService, 'getId');
      const spy2 = jest.spyOn(mockUserService, 'deleteUser');
      const result = await controller.deleteUser(mockRequest as Request);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledWith('userId');
      expect(result).toBeUndefined();
    });

    it('should throw a BadRequestException and call log when Id is invalid', async () => {
      mockAuthService.getId = jest.fn().mockReturnValue('userId');
      mockUserService.deleteUser = jest.fn().mockRejectedValue(new BadRequestException());
      await expect(controller.deleteUser(mockRequest as Request)).rejects.toThrow(BadRequestException);
      expect(log).toHaveBeenCalledTimes(1);
    });

    it('should throw an InternalServerErrorException and call log when an error occurs in deleteUser', async () => {
      mockAuthService.getId = jest.fn().mockReturnValue('userId');
      mockUserService.deleteUser = jest.fn().mockRejectedValue(new InternalServerErrorException());
      await expect(controller.deleteUser(mockRequest as Request)).rejects.toThrow(InternalServerErrorException);
      expect(log).toHaveBeenCalledTimes(1);
    });
  });
});
