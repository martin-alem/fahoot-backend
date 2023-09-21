import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { Request, Response } from 'express';
import { LoggerService } from './../modules/logger/logger.service';
import { clearCookie, log, setCookie, validateObjectId } from './helper';

describe('validateObjectId', () => {
  it('should not throw any error for a valid ObjectId', () => {
    const validObjectId = new Types.ObjectId().toHexString();
    expect(() => validateObjectId(validObjectId)).not.toThrow();
  });

  it('should throw BadRequestException for an invalid ObjectId', () => {
    const invalidObjectId = 'invalid-id';
    expect(() => validateObjectId(invalidObjectId)).toThrow(BadRequestException);
  });
});

describe('log', () => {
  it('should call the log method of LoggerService with proper parameters', () => {
    const mockLoggerService = { log: jest.fn() };
    const mockRequest = { ip: '127.0.0.1', hostname: 'localhost', originalUrl: '/test', method: 'GET', get: jest.fn().mockReturnValue('Mozilla') };
    const event = 'TestEvent';
    const description = 'TestDescription';

    log(mockLoggerService as unknown as LoggerService, event, description, mockRequest as unknown as Request);

    expect(mockLoggerService.log).toHaveBeenCalledWith(expect.any(String));
  });
});

describe('setCookie', () => {
  let mockResponse: { cookie: jest.Mock };

  beforeEach(() => {
    mockResponse = { cookie: jest.fn() };
  });

  it('should call the cookie method on response object with proper parameters', () => {
    const mockResponse = { cookie: jest.fn() };
    const name = 'TestCookie';
    const value = 'TestValue';
    const ttl = 3600;

    setCookie(mockResponse as unknown as Response, name, value, ttl);

    expect(mockResponse.cookie).toHaveBeenCalledWith(name, value, expect.any(Object));
  });

  it('should use secure, httpOnly, and sameSite options when in production', () => {
    process.env.NODE_ENV = 'production';
    const name = 'TestCookie';
    const value = 'TestValue';
    const ttl = 3600;

    setCookie(mockResponse as unknown as Response, name, value, ttl);

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      name,
      value,
      expect.objectContaining({
        secure: true,
        httpOnly: true,
        sameSite: true,
      }),
    );
  });

  it('should not use secure, httpOnly, and sameSite options when not in production', () => {
    process.env.NODE_ENV = 'development';
    const name = 'TestCookie';
    const value = 'TestValue';
    const ttl = 3600;

    setCookie(mockResponse as unknown as Response, name, value, ttl);

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      name,
      value,
      expect.objectContaining({
        secure: false,
        httpOnly: false,
        sameSite: false,
      }),
    );
  });
});

describe('clearCookie', () => {
  it('should call the clearCookie method on response object with proper parameters', () => {
    const mockResponse = { clearCookie: jest.fn() };
    const name = 'TestCookie';

    clearCookie(mockResponse as unknown as Response, name);

    expect(mockResponse.clearCookie).toHaveBeenCalledWith(name, expect.any(Object));
  });
});
