import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from './security.service';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notification/notification.service';
import { Model } from 'mongoose';
import { Token } from './schema/tokens.schema';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { IAuthUser, UserRole } from './../../types/user.types';
import * as bcrypt from 'bcrypt';
import { DEFAULT_DATABASE_CONNECTION, EmailPurpose, Status } from './../../utils/constant';
import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('SecurityService', () => {
  let service: SecurityService;
  let mockConfigService: ConfigService;
  let mockJwtService: JwtService;
  let mockNotificationService: NotificationService;
  let mockTokenModel: Model<Token>;
  let mockUserService: UserService;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('test-api-key'),
    } as unknown as ConfigService;

    mockNotificationService = {
      enqueueNotification: jest.fn(),
    } as unknown as NotificationService;

    mockJwtService = {
      signAsync: jest.fn() as jest.MockedFunction<typeof JwtService.prototype.verify>,
      verify: jest.fn(),
    } as unknown as JwtService;

    mockTokenModel = {
      updateOne: jest.fn(),
      findOne: jest.fn(),
      findOneAndDelete: jest.fn(),
    } as unknown as Model<Token>;

    mockUserService = {
      updateSensitiveData: jest.fn(),
      findByEmailAddress: jest.fn(),
    } as unknown as UserService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: UserService, useValue: mockUserService },
        { provide: getModelToken(Token.name, DEFAULT_DATABASE_CONNECTION), useValue: mockTokenModel },
        SecurityService,
      ],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Sign Token', () => {
    it('should sign and return a token', async () => {
      const mockUser: IAuthUser = {
        id: '1234',
        emailAddress: 'test@example.com',
        role: UserRole.USER,
      };
      const ttl = 3600;

      mockJwtService.signAsync = jest.fn().mockResolvedValue('mockToken');
      mockConfigService.get = jest.fn().mockReturnValue('mockValue');

      const result = await service.signToken(mockUser, ttl);

      expect(result).toEqual('mockToken');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          emailAddress: mockUser.emailAddress,
          role: mockUser.role,
        },
        {
          audience: 'mockValue',
          issuer: 'mockValue',
          secret: 'mockValue',
          expiresIn: ttl,
        },
      );
    });

    it('should throw an error if signing fails', async () => {
      mockJwtService.signAsync = jest.fn().mockRejectedValue(new Error('Mock error'));
      await expect(service.signToken({} as IAuthUser, 3600)).rejects.toThrow('Mock error');
    });
  });

  describe('validate Token', () => {
    it('should validate and return a decoded token when the token is valid', async () => {
      const mockToken = 'validToken';
      const mockDecodedToken: IAuthUser = {
        id: '123',
        emailAddress: 'test@example.com',
        role: UserRole.USER,
      };

      jest.spyOn(mockJwtService, 'verify').mockReturnValue(mockDecodedToken);
      jest.spyOn(mockConfigService, 'get').mockReturnValue('someValue');

      const result = await service.validateToken(mockToken);

      expect(result).toEqual(mockDecodedToken);
    });

    it('should throw an Error when the token is invalid', async () => {
      const mockToken = 'invalidToken';
      mockJwtService.verify = jest.fn().mockRejectedValue(new Error('invalid token'));
      mockConfigService.get = jest.fn().mockReturnValue('someValue');
      jest.spyOn(mockJwtService, 'verify');
      jest.spyOn(mockConfigService, 'get');
      await expect(service.validateToken(mockToken)).rejects.toThrow();
    });
  });

  describe('hash', () => {
    it('should return a hashed string when given valid data', async () => {
      const mockData = 'password';
      const mockSalt = 'someRandomSalt';
      const mockHash = 'hashedPassword';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await service.hash(mockData);

      expect(result).toEqual(mockHash);
    });

    it('should throw an error when hashing process fails', async () => {
      const mockData = 'password';
      const mockError = new Error('Hashing failed');

      (bcrypt.genSalt as jest.Mock).mockRejectedValue(mockError);

      await expect(service.hash(mockData)).rejects.toThrow(mockError);
    });
  });

  describe('compare', () => {
    it('should return true when incomingData and hashedData match', async () => {
      const incomingData = 'someData';
      const hashedData = 'someHash';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.compare(incomingData, hashedData);
      expect(result).toBe(true);
    });

    it('should return false when incomingData and hashedData do not match', async () => {
      const incomingData = 'someData';
      const hashedData = 'someOtherHash';
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.compare(incomingData, hashedData);
      expect(result).toBe(false);
    });

    it('should throw an error when bcrypt.compare fails', async () => {
      const incomingData = 'someData';
      const hashedData = 'someHash';
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Some error'));
      await expect(service.compare(incomingData, hashedData)).rejects.toThrow('Some error');
    });
  });

  describe('Generate Tokens', () => {
    const mockTTL = 33400;
    it('should successfully generate a token', async () => {
      const mockUser: IAuthUser = {
        id: 'someId',
        emailAddress: 'someEmail',
        role: UserRole.ADMIN,
      };
      const mockToken = 'someToken';

      service.signToken = jest.fn().mockResolvedValue(mockToken);

      const result = await service.generateTokens(mockUser, mockTTL);
      expect(result).toBe(mockToken);
      expect(service.signToken).toHaveBeenCalledWith(mockUser, expect.any(Number));
    });

    it('should throw an error if token generation fails', async () => {
      const mockUser: IAuthUser = {
        id: 'someId',
        emailAddress: 'someEmail',
        role: UserRole.ADMIN,
      };

      const error = new Error('Token generation failed');
      service.signToken = jest.fn().mockRejectedValue(error);
      await expect(service.generateTokens(mockUser, mockTTL)).rejects.toThrow(error);
    });
  });

  xdescribe('Send Verification Link', () => {
    it('should successfully queue an email verification link', async () => {
      const email = 'test@email.com';
      const subject = 'Email Verification';
      const token = 'someToken';

      mockTokenModel.create = jest.fn().mockResolvedValue({ token, emailAddress: email });
      mockConfigService.get = jest.fn().mockReturnValue('http://verify.url');

      await service.queueVerificationEmail(email, subject, EmailPurpose.EMAIL_VERIFICATION);

      expect(mockNotificationService.enqueueNotification).toHaveBeenCalledTimes(1);
    });

    it('should successfully queue a password reset link', async () => {
      const email = 'test@email.com';
      const subject = 'Password Reset Request';
      const token = 'someToken';

      mockTokenModel.create = jest.fn().mockResolvedValue({ token, emailAddress: email });
      mockConfigService.get = jest.fn().mockReturnValue('http://verify.url');

      await service.queueVerificationEmail(email, subject, EmailPurpose.PASSWORD_RESET);

      expect(mockNotificationService.enqueueNotification).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when failing to create a new token', async () => {
      const email = 'test@email.com';
      const subject = 'Email Verification';

      mockTokenModel.create = jest.fn().mockResolvedValue(null);

      await expect(service.queueVerificationEmail(email, subject, EmailPurpose.EMAIL_VERIFICATION)).rejects.toThrow(InternalServerErrorException);
    });

    it('should propagate errors from dependencies', async () => {
      const error = new Error('Some error');
      mockTokenModel.create = jest.fn().mockRejectedValue(error);
      await expect(service.queueVerificationEmail('test@email.com', 'Subject', EmailPurpose.EMAIL_VERIFICATION)).rejects.toThrow(error);
    });
  });

  describe('Verify Token', () => {
    it('should return the decoded token when a valid token exists in the database', async () => {
      mockTokenModel.findOne = jest.fn().mockResolvedValue({ token: 'validToken', emailAddress: 'test@example.com' });
      const mockDecodedToken = { id: '123', emailAddress: 'test@example.com', role: UserRole.USER };
      jest.spyOn(service, 'validateToken').mockResolvedValue(mockDecodedToken);
      const result = await service['verifyToken']('validToken');
      expect(mockTokenModel.findOne).toHaveBeenCalledWith({ token: 'validToken' });
      expect(service.validateToken).toHaveBeenCalledWith('validToken');
      expect(result).toEqual(mockDecodedToken);
    });

    it('should throw an UnauthorizedException when the token email does not match the email in the database', async () => {
      mockTokenModel.findOne = jest.fn().mockResolvedValue({ token: 'validToken', emailAddress: 'test2@example.com' });
      const mockDecodedToken = { id: '123', emailAddress: 'test@example.com', role: UserRole.USER };
      jest.spyOn(service, 'validateToken').mockResolvedValue(mockDecodedToken);
      await expect(service['verifyToken']('validToken')).rejects.toThrow(UnauthorizedException);
      expect(mockTokenModel.findOne).toHaveBeenCalledWith({ token: 'validToken' });
      expect(service.validateToken).toHaveBeenCalledWith('validToken');
    });

    it('should throw an UnauthorizedException when the token does not exist in the database', async () => {
      mockTokenModel.findOne = jest.fn().mockRejectedValue(new UnauthorizedException());
      await expect(service['verifyToken']('nonExistentToken')).rejects.toThrow(UnauthorizedException);
      expect(mockTokenModel.findOne).toHaveBeenCalledWith({ token: 'nonExistentToken' });
    });
  });

  describe('Verify Email', () => {
    it('should throw an UnauthorizedException when the token is not valid', async () => {
      service['verifyToken'] = jest.fn().mockRejectedValue(new UnauthorizedException());
      await expect(service.verifyEmail('invalidToken')).rejects.toThrow(UnauthorizedException);
    });

    it('should call updateSensitive data if token is valid', async () => {
      const mockDecodedToken = { id: '123', emailAddress: 'test@example.com', role: UserRole.USER };
      service['verifyToken'] = jest.fn().mockResolvedValue(mockDecodedToken);
      await service.verifyEmail('validToken');
      expect(service['verifyToken']).toBeCalledTimes(1);
      expect(service['verifyToken']).toHaveBeenCalledWith('validToken');
      expect(mockUserService.updateSensitiveData).toHaveBeenCalledTimes(1);
      expect(mockUserService.updateSensitiveData).toHaveBeenCalledWith({ verified: true, status: Status.ACTIVE }, mockDecodedToken.emailAddress);
    });

    it('should not call updateSensitive data if token is invalid', async () => {
      service['verifyToken'] = jest.fn().mockRejectedValue(new UnauthorizedException());
      await expect(service.verifyEmail('invalidToken')).rejects.toThrow(UnauthorizedException);
      expect(mockUserService.updateSensitiveData).not.toHaveBeenCalled();
    });
  });

  describe('Password Reset Request', () => {
    it('should throw a NotFoundException if email address does not exist', async () => {
      mockUserService.findByEmailAddress = jest.fn().mockRejectedValue(new UnauthorizedException());
      await expect(service.passwordResetRequest('test@gmail.com')).rejects.toThrow(UnauthorizedException);
    });

    it('should not call queueVerificationEmail if email address is invalid', async () => {
      mockUserService.findByEmailAddress = jest.fn().mockRejectedValue(new UnauthorizedException());
      const spy = jest.spyOn(service, 'queueVerificationEmail').mockResolvedValue();
      await expect(service.passwordResetRequest('test@gmail.com')).rejects.toThrow(UnauthorizedException);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should call sendVerification if the email address is valid', async () => {
      const mockEmailAddress = 'test@gmail.com';
      const spy = jest.spyOn(service, 'queueVerificationEmail').mockResolvedValue();
      await service.passwordResetRequest(mockEmailAddress);
      expect(mockUserService.findByEmailAddress).toHaveBeenCalledTimes(1);
      expect(mockUserService.findByEmailAddress).toHaveBeenCalledWith(mockEmailAddress);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toBeCalledWith(mockEmailAddress, expect.any(String), EmailPurpose.PASSWORD_RESET);
    });
  });

  describe('Password Reset', () => {
    it('should throw an UnauthorizedException if token is invalid', async () => {
      service['verifyToken'] = jest.fn().mockRejectedValue(new UnauthorizedException());
      await expect(service.passwordReset('invalidToken', 'password')).rejects.toThrow(UnauthorizedException);
    });
    it('should not call hash and updateSensitiveData if token is invalid', async () => {
      service['verifyToken'] = jest.fn().mockRejectedValue(new UnauthorizedException());
      service.hash = jest.fn().mockResolvedValue('hashedPassword');
      await expect(service.passwordReset('invalidToken', 'password')).rejects.toThrow(UnauthorizedException);
      expect(service.hash).not.toHaveBeenCalled();
      expect(mockUserService.updateSensitiveData).not.toHaveBeenCalled();
    });
    it('should call hash and updateSensitiveData if token is valid', async () => {
      const mockDecodedToken = { id: '123', emailAddress: 'test@example.com', role: UserRole.USER };
      const mockToken = 'validToken';
      const mockPassword = 'test12345';
      service['verifyToken'] = jest.fn().mockResolvedValue(mockDecodedToken);
      service.hash = jest.fn().mockResolvedValue('hashedPassword');
      await service.passwordReset(mockToken, mockPassword);
      expect(service['verifyToken']).toHaveBeenCalledTimes(1);
      expect(service['verifyToken']).toHaveBeenCalledWith(mockToken);
      expect(service.hash).toHaveBeenCalledTimes(1);
      expect(service.hash).toHaveBeenCalledWith(mockPassword);
      expect(mockUserService.updateSensitiveData).toHaveBeenCalledTimes(1);
      expect(mockUserService.updateSensitiveData).toBeCalledWith({ password: expect.any(String) }, mockDecodedToken.emailAddress);
    });
  });
});
