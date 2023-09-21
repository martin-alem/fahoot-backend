/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './../modules/shared/auth.service';
import { UserRole } from './../types/user.types';
import { Status } from './../utils/constant';
import { AuthorizationGuard } from './auth.guard';

describe('AuthorizationGuard', () => {
  let guard: AuthorizationGuard;
  let mockAuthService: Partial<AuthService>;
  let mockReflector: Partial<Reflector>;

  beforeEach(async () => {
    mockAuthService = {
      getRole: jest.fn().mockReturnValue(UserRole.ADMIN),
      getStatus: jest.fn().mockReturnValue(Status.ACTIVE),
    };

    mockReflector = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizationGuard, { provide: AuthService, useValue: mockAuthService }, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = module.get<AuthorizationGuard>(AuthorizationGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when role and status matches', () => {
      const mockExecutionContext = {
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      mockReflector.get = jest.fn().mockImplementation((key, type) => {
        if (key === 'role') return UserRole.ADMIN;
        if (key === 'status') return Status.ACTIVE;
      });

      expect(guard.canActivate(mockExecutionContext)).toBeTruthy();
    });

    it('should return false when role or status does not match', () => {
      const mockExecutionContext = {
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      mockReflector.get = jest.fn().mockImplementation((key, type) => {
        if (key === 'role') return UserRole.USER;
        if (key === 'status') return Status.ACTIVE;
      });

      expect(guard.canActivate(mockExecutionContext)).toBeFalsy();
    });

    it('should return true when status and role is not defined', () => {
      const mockExecutionContext = {
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      mockReflector.get = jest.fn().mockImplementation((key, type) => {
        if (key === 'role') return undefined;
        if (key === 'status') return undefined;
      });

      expect(guard.canActivate(mockExecutionContext)).toBeTruthy;
    });
  });
});
