import { Test, TestingModule } from '@nestjs/testing';
import { SecurityController } from './security.controller';
import { Request } from 'express';
import { SecurityService } from './security.service';
import { VerificationLinkDTO } from './dto/verification.dto';
import { EmailPurpose } from './../../utils/constant';
import { PasswordResetDTO } from './dto/password_reset.dto';
import { LoggerService } from '../logger/logger.service';

describe('SecurityController', () => {
  let controller: SecurityController;
  const mockService = {
    verifyEmail: jest.fn(),
    queueVerificationEmail: jest.fn(),
    passwordResetRequest: jest.fn(),
    passwordReset: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
  };

  const mockRequest: Partial<Request> = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityController],
      providers: [
        { provide: SecurityService, useValue: mockService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    controller = module.get<SecurityController>(SecurityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Email Verification', () => {
    it('should call service.verifyEmail with correct arguments', async () => {
      await controller.emailVerification('some-token', mockRequest as Request);
      expect(mockService.verifyEmail).toHaveBeenCalledWith('some-token');
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      mockService.verifyEmail = jest.fn().mockRejectedValue(new Error());
      await expect(controller.emailVerification('some-token', mockRequest as Request)).rejects.toThrow();
    });

    it('should call loggerService.log when an error occurs', async () => {
      const spy = jest.spyOn(mockLoggerService, 'log');
      mockService.verifyEmail = jest.fn().mockRejectedValue(new Error());
      await expect(controller.emailVerification('some-token', mockRequest as Request)).rejects.toThrow();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Send Verification Email', () => {
    const payload: VerificationLinkDTO = {
      emailAddress: 'test@email.com',
      subject: 'Verify Email',
      emailPurpose: EmailPurpose.EMAIL_VERIFICATION,
    };

    it('should call service.sendVerificationEmail with correct arguments', async () => {
      await controller.sendVerificationEmail(payload, mockRequest as Request);
      expect(mockService.queueVerificationEmail).toHaveBeenCalledWith(payload.emailAddress, payload.subject, payload.emailPurpose);
    });

    it('should throw if service fails', async () => {
      mockService.queueVerificationEmail = jest.fn().mockRejectedValue(new Error());
      await expect(controller.sendVerificationEmail(payload, mockRequest as Request)).rejects.toThrow();
    });

    it('should call loggerService.log when an error occurs', async () => {
      const spy = jest.spyOn(mockLoggerService, 'log');
      mockService.queueVerificationEmail = jest.fn().mockRejectedValue(new Error());
      await expect(controller.sendVerificationEmail(payload, mockRequest as Request)).rejects.toThrow();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Password Reset Request', () => {
    it('should call service.passwordResetRequest with correct arguments', async () => {
      const payload = { emailAddress: 'test@email.com' };
      await controller.passwordResetRequest(payload, mockRequest as Request);
      expect(mockService.passwordResetRequest).toHaveBeenCalledWith(payload.emailAddress);
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      const payload = { emailAddress: 'test@email.com' };
      mockService.passwordResetRequest = jest.fn().mockRejectedValue(new Error());
      await expect(controller.passwordResetRequest(payload, mockRequest as Request)).rejects.toThrow();
    });

    it('should call loggerService.log when an error occurs', async () => {
      const payload = { emailAddress: 'test@email.com' };
      const spy = jest.spyOn(mockLoggerService, 'log');
      mockService.passwordResetRequest = jest.fn().mockRejectedValue(new Error());
      await expect(controller.passwordResetRequest(payload, mockRequest as Request)).rejects.toThrow();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Password Reset', () => {
    const payload: PasswordResetDTO = {
      token: 'some-token',
      password: 'new-password',
    };

    it('should call service.passwordReset with correct arguments', async () => {
      await controller.passwordReset(payload, mockRequest as Request);
      expect(mockService.passwordReset).toHaveBeenCalledWith(payload.token, payload.password);
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      mockService.passwordReset = jest.fn().mockRejectedValue(new Error());
      await expect(controller.passwordReset(payload, mockRequest as Request)).rejects.toThrow();
    });

    it('should call loggerService.log when an error occurs', async () => {
      const spy = jest.spyOn(mockLoggerService, 'log');
      mockService.passwordReset = jest.fn().mockRejectedValue(new Error());
      await expect(controller.passwordReset(payload, mockRequest as Request)).rejects.toThrow();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
