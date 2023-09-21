import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { SecurityService } from '../security/security.service';
import { LoggerService } from '../logger/logger.service';
import { AuthenticationMethod } from './../../utils/constant';
import { Request, Response } from 'express';
import { SignInDTO } from './dto/signin.dto';
import { SignUpDTO } from './dto/signup.dto';
import { setCookie, log } from './../../utils/helper';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('../security/security.service');
jest.mock('../logger/logger.service');
jest.mock('../security/security.service');
jest.mock('./authentication.service');
jest.mock('./../../utils/helper', () => ({
  setCookie: jest.fn(),
  log: jest.fn(),
}));

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let mockService: AuthenticationService;
  let mockSecurityService: SecurityService;

  const mockRequest: Partial<Request> = {
    get: jest.fn(),
  };
  const mockResponse: Partial<Response> = {
    cookie: jest.fn(),
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

  const SignUpDTO: SignUpDTO = {
    firstName: 'John',
    lastName: 'Deo',
    emailAddress: 'john.deo@gmail.com',
    password: 'password',
    authenticationMethod: AuthenticationMethod.MANUAL,
  };

  const SignInDTO: SignInDTO = {
    emailAddress: 'john.deo@gmail.com',
    password: 'password',
    authenticationMethod: AuthenticationMethod.MANUAL,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [AuthenticationService, LoggerService, SecurityService],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    mockService = module.get<AuthenticationService>(AuthenticationService);
    mockSecurityService = module.get<SecurityService>(SecurityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Manual Sign Up', () => {
    it('should call the signup method', async () => {
      mockService.signUp = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.generateTokens = jest.fn().mockResolvedValue('token');
      const spy = jest.spyOn(mockService, 'signUp');
      await controller.signup(SignUpDTO, mockRequest as Request, mockResponse as Response);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call the generateToken method', async () => {
      mockService.signUp = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.generateTokens = jest.fn().mockResolvedValue('token');
      const spy = jest.spyOn(mockSecurityService, 'generateTokens');
      await controller.signup(SignUpDTO, mockRequest as Request, mockResponse as Response);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call the setCookie method', async () => {
      mockService.signUp = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.generateTokens = jest.fn().mockResolvedValue('token');
      await controller.signup(SignUpDTO, mockRequest as Request, mockResponse as Response);
      expect(setCookie).toHaveBeenCalledTimes(1);
      expect(setCookie).toHaveBeenCalledWith(mockResponse, '_access_token', 'token', expect.any(Number));
    });

    it('should call the log method when an error occurs', async () => {
      mockService.signUp = jest.fn().mockRejectedValue(new InternalServerErrorException());
      await expect(controller.signup(SignUpDTO, mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerErrorException);
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('Google Sign Up', () => {
    it('should call the signup method', async () => {
      mockService.googleSignUp = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.generateTokens = jest.fn().mockResolvedValue('token');
      const spy = jest.spyOn(mockService, 'googleSignUp');
      await controller.googleSignup('', mockRequest as Request, mockResponse as Response);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call the generateToken method', async () => {
      mockService.googleSignUp = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.generateTokens = jest.fn().mockResolvedValue('token');
      const spy = jest.spyOn(mockSecurityService, 'generateTokens');
      await controller.googleSignup('', mockRequest as Request, mockResponse as Response);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call the setCookie method', async () => {
      mockService.googleSignUp = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.generateTokens = jest.fn().mockResolvedValue('token');
      await controller.googleSignup('', mockRequest as Request, mockResponse as Response);
      expect(setCookie).toHaveBeenCalledTimes(1);
      expect(setCookie).toHaveBeenCalledWith(mockResponse, '_access_token', 'token', expect.any(Number));
    });

    it('should call the log method when an error occurs', async () => {
      mockService.googleSignUp = jest.fn().mockRejectedValue(new InternalServerErrorException());
      await expect(controller.googleSignup('', mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerErrorException);
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('Manual Sign In', () => {
    it('should call the signin method', async () => {
      mockService.signIn = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.generateTokens = jest.fn().mockResolvedValue('token');
      const spy = jest.spyOn(mockService, 'signIn');
      await controller.signin(SignInDTO, mockRequest as Request, mockResponse as Response);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call the generateToken method', async () => {
      mockService.signIn = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.generateTokens = jest.fn().mockResolvedValue('token');
      const spy = jest.spyOn(mockSecurityService, 'generateTokens');
      await controller.signin(SignInDTO, mockRequest as Request, mockResponse as Response);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call the setCookie method', async () => {
      mockService.signIn = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.generateTokens = jest.fn().mockResolvedValue('token');
      await controller.signin(SignInDTO, mockRequest as Request, mockResponse as Response);
      expect(setCookie).toHaveBeenCalledTimes(1);
      expect(setCookie).toHaveBeenCalledWith(mockResponse, '_access_token', 'token', expect.any(Number));
    });

    it('should call the log method when an error occurs', async () => {
      mockService.signIn = jest.fn().mockRejectedValue(new InternalServerErrorException());
      await expect(controller.signin(SignInDTO, mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerErrorException);
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('Google Sign In', () => {
    it('should call the signin method', async () => {
      mockService.googleSignIn = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.generateTokens = jest.fn().mockResolvedValue('token');
      const spy = jest.spyOn(mockService, 'googleSignIn');
      await controller.googleSignin('', mockRequest as Request, mockResponse as Response);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call the generateToken method', async () => {
      mockService.googleSignIn = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.generateTokens = jest.fn().mockResolvedValue('token');
      const spy = jest.spyOn(mockSecurityService, 'generateTokens');
      await controller.googleSignin('', mockRequest as Request, mockResponse as Response);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call the setCookie method', async () => {
      mockService.googleSignIn = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.generateTokens = jest.fn().mockResolvedValue('token');
      await controller.googleSignin('', mockRequest as Request, mockResponse as Response);
      expect(setCookie).toHaveBeenCalledTimes(1);
      expect(setCookie).toHaveBeenCalledWith(mockResponse, '_access_token', 'token', expect.any(Number));
    });

    it('should call the log method when an error occurs', async () => {
      mockService.googleSignIn = jest.fn().mockRejectedValue(new InternalServerErrorException());
      await expect(controller.googleSignin('', mockRequest as Request, mockResponse as Response)).rejects.toThrow(InternalServerErrorException);
      expect(log).toHaveBeenCalledTimes(1);
    });
  });
});
