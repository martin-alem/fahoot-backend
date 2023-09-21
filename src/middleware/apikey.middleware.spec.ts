import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './../modules/shared/auth.service';
import { APIKeyMiddleware } from './apikey.middleware';

describe('APIKeyMiddleware', () => {
  let middleware: APIKeyMiddleware;
  let mockConfigService: ConfigService;
  let mockAuthService: AuthService;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('test-api-key'),
    } as unknown as ConfigService;

    mockAuthService = {
      setUserAgent: jest.fn(),
      setIpAddress: jest.fn(),
      setPath: jest.fn(),
      setHostName: jest.fn(),
      setOriginalUrl: jest.fn(),
    } as unknown as AuthService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: ConfigService, useValue: mockConfigService }, { provide: AuthService, useValue: mockAuthService }, APIKeyMiddleware],
    }).compile();

    middleware = module.get<APIKeyMiddleware>(APIKeyMiddleware);
  });

  it('should throw ForbiddenException if no authorization header is provided', () => {
    const req: Request = { headers: {} } as unknown as Request;
    const res: Response = {} as unknown as Response;
    const next: NextFunction = jest.fn();

    expect(() => middleware.use(req, res, next)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if API key is incorrect', () => {
    const req: Request = {
      headers: { authorization: 'Bearer wrong-api-key' },
    } as unknown as Request;
    const res: Response = {} as unknown as Response;
    const next: NextFunction = jest.fn();

    expect(() => middleware.use(req, res, next)).toThrow(ForbiddenException);
  });

  it('should proceed to next middleware if API key is correct', () => {
    const req: Request = {
      headers: { authorization: 'Bearer test-api-key' },
      get: jest.fn().mockReturnValue('mock-user-agent'),
      ip: 'mock-ip',
      path: 'mock-path',
      hostname: 'mock-hostname',
      originalUrl: 'mock-original-url',
    } as unknown as Request;
    const res: Response = {} as unknown as Response;
    const next: NextFunction = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(mockAuthService.setUserAgent).toHaveBeenCalledWith('mock-user-agent');
    expect(mockAuthService.setIpAddress).toHaveBeenCalledWith('mock-ip');
    expect(mockAuthService.setPath).toHaveBeenCalledWith('mock-path');
    expect(mockAuthService.setHostName).toHaveBeenCalledWith('mock-hostname');
    expect(mockAuthService.setOriginalUrl).toHaveBeenCalledWith('mock-original-url');
  });
});
