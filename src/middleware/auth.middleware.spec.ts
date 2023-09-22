/* eslint-disable @typescript-eslint/naming-convention */
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from './../modules/security/security.service';
import { AuthService } from './../modules/shared/auth.service';
import { UserService } from './../modules/user/user.service';
import { AuthenticationMiddleware } from './auth.middleware';

describe('AuthenticationMiddleware', () => {
  let middleware: AuthenticationMiddleware;
  let mockSecurityService: SecurityService;
  let mockUserService: UserService;
  let mockAuthService: AuthService;

  beforeEach(async () => {
    mockSecurityService = {
      validateToken: jest.fn().mockResolvedValue({ id: 'test-id', role: 'test-role', status: 'test-status' }),
    } as unknown as SecurityService;

    mockUserService = {
      getUser: jest.fn().mockResolvedValue({ id: 'test-id', status: 'test-status', role: 'test-role' }),
    } as unknown as UserService;

    mockAuthService = {
      setId: jest.fn(),
      setStatus: jest.fn(),
      setRole: jest.fn(),
    } as unknown as AuthService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        AuthenticationMiddleware,
      ],
    }).compile();

    middleware = module.get<AuthenticationMiddleware>(AuthenticationMiddleware);
  });

  it('should throw ForbiddenException if no token cookie is provided', async () => {
    const req: Request = { cookies: {} } as unknown as Request;
    const res: Response = {} as unknown as Response;
    const next: NextFunction = jest.fn();

    await expect(() => middleware.use(req, res, next)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is invalid', async () => {
    mockUserService.getUser = jest.fn().mockResolvedValue(null);

    const req: Request = {
      cookies: { _access_token: 'valid-token' },
    } as unknown as Request;
    const res: Response = {} as unknown as Response;
    const next: NextFunction = jest.fn();

    await expect(() => middleware.use(req, res, next)).rejects.toThrow(ForbiddenException);
  });

  it('should proceed to next middleware if token and user are valid', async () => {
    const req: Request = {
      cookies: { _access_token: 'valid-token' },
    } as unknown as Request;
    const res: Response = {} as unknown as Response;
    const next: NextFunction = jest.fn();

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(mockAuthService.setId).toHaveBeenCalledWith('test-id');
    expect(mockAuthService.setStatus).toHaveBeenCalledWith('test-status');
    expect(mockAuthService.setRole).toHaveBeenCalledWith('test-role');
  });
});
