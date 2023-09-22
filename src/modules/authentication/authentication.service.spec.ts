import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { SecurityService } from '../security/security.service';
import { SignUpDTO } from './dto/signup.dto';
import { AuthenticationMethod, EmailPurpose } from './../../utils/constant';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SignInDTO } from './dto/signin.dto';

jest.mock('../user/user.service');
jest.mock('../security/security.service');
jest.mock('@nestjs/config');

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let mockUserService: UserService;
  let mockSecurityService: SecurityService;

  const mockUser = {
    firstName: 'john',
    lastName: 'deo',
    emailAddress: 'john.deo@gmail.com',
    authenticationMethod: 'manual',
    avatarUrl: null,
    verified: false,
    status: 'inactive',
  };

  const signUpDTO: SignUpDTO = {
    firstName: 'John',
    lastName: 'Deo',
    emailAddress: 'john.deo@gmail.com',
    password: 'password',
    authenticationMethod: AuthenticationMethod.MANUAL,
  };

  const signInDTO: SignInDTO = {
    emailAddress: 'john.deo@gmail.com',
    password: 'password',
    authenticationMethod: AuthenticationMethod.MANUAL,
    rememberMe: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthenticationService, UserService, ConfigService, SecurityService],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    mockUserService = module.get<UserService>(UserService);
    mockSecurityService = module.get<SecurityService>(SecurityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Manual SignUp', () => {
    it('should successfully sign up a user', async () => {
      mockUserService.createUser = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.queueVerificationEmail = jest.fn().mockResolvedValue(undefined);
      const result = await service.signUp(signUpDTO);
      expect(result).toEqual(mockUser);
    });

    it('should call securityService.SendVerificationLink on successful signup', async () => {
      mockUserService.createUser = jest.fn().mockResolvedValue(mockUser);
      const spy = jest.spyOn(mockSecurityService, 'queueVerificationEmail');
      await service.signUp(signUpDTO);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('john.deo@gmail.com', 'Verify Email', EmailPurpose.EMAIL_VERIFICATION);
    });

    it('should throw BadRequestException if email already exist', async () => {
      mockUserService.createUser = jest.fn().mockRejectedValue(new BadRequestException());
      await expect(service.signUp(signUpDTO)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if an unknown error occurs', async () => {
      mockUserService.createUser = jest.fn().mockRejectedValue(new Error('An error'));
      await expect(service.signUp(signUpDTO)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Google Sign Up', () => {
    it('should successfully sign up a user', async () => {
      mockUserService.createUser = jest.fn().mockResolvedValue(mockUser);
      service.googleOAuthVerification = jest.fn().mockResolvedValue(mockUser);
      const result = await service.googleSignUp('');
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if email already exist', async () => {
      service.googleOAuthVerification = jest.fn().mockResolvedValue(mockUser);
      mockUserService.createUser = jest.fn().mockRejectedValue(new BadRequestException());
      await expect(service.googleSignUp('')).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if an unknown error occurs', async () => {
      service.googleOAuthVerification = jest.fn().mockResolvedValue(mockUser);
      mockUserService.createUser = jest.fn().mockRejectedValue(new Error('An error'));
      await expect(service.googleSignUp('')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Manual Sign In', () => {
    it('should successfully sign in a user', async () => {
      mockUserService.findByEmailAddress = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.compare = jest.fn().mockResolvedValue(true);
      const result = await service.signIn(signInDTO);
      expect(result).toEqual(mockUser);
    });

    it('should fail sign with invalid email address', async () => {
      mockUserService.findByEmailAddress = jest.fn().mockRejectedValue(new NotFoundException());
      await expect(service.signIn(signInDTO)).rejects.toThrow(BadRequestException);
    });

    it('should fail sign with invalid password', async () => {
      mockUserService.findByEmailAddress = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.compare = jest.fn().mockResolvedValue(false);

      await expect(service.signIn(signInDTO)).rejects.toThrow(BadRequestException);
    });

    it('should throw an InternalServerErrorException when an unknown error occurs in user.findByEmailAddress', async () => {
      mockUserService.findByEmailAddress = jest.fn().mockRejectedValue(new InternalServerErrorException());
      await expect(service.signIn(signInDTO)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerErrorException when an unknown error occurs in security.compare', async () => {
      mockUserService.findByEmailAddress = jest.fn().mockResolvedValue(mockUser);
      mockSecurityService.compare = jest.fn().mockRejectedValue(new InternalServerErrorException());

      await expect(service.signIn(signInDTO)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Google Sign In', () => {
    it('should successfully sign in a user', async () => {
      service.googleOAuthVerification = jest.fn().mockResolvedValue(mockUser);
      mockUserService.findByEmailAddress = jest.fn().mockResolvedValue(mockUser);
      const result = await service.googleSignIn('');
      expect(result).toEqual(mockUser);
    });

    it('should fail sign with invalid email address', async () => {
      service.googleOAuthVerification = jest.fn().mockResolvedValue(mockUser);
      mockUserService.findByEmailAddress = jest.fn().mockRejectedValue(new NotFoundException());
      await expect(service.googleSignIn('')).rejects.toThrow(BadRequestException);
    });

    it('should throw an InternalServerErrorException when an unknown error occurs in user.findByEmailAddress', async () => {
      service.googleOAuthVerification = jest.fn().mockResolvedValue(mockUser);
      mockUserService.findByEmailAddress = jest.fn().mockRejectedValue(new InternalServerErrorException());
      await expect(service.googleSignIn('')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
