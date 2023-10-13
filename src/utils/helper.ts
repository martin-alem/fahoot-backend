import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as crypto from 'crypto';
import { Types } from 'mongoose';
import { LoggerService } from './../modules/logger/logger.service';
import { LEVEL } from './../types/log.types';
import Result from 'src/wrapper/result';

/**
 * Validates a string to verify if it a valid mongoDB objectID. Logs the error
 * @param objectId MongoDB objectID
 * @param loggerService LoggerService
 * @throws BadRequestException
 */
export function validateObjectId(objectId: string): Result<boolean> {
  if (!Types.ObjectId.isValid(objectId)) {
    return new Result(false, false, null, HttpStatus.BAD_REQUEST);
  }
  return new Result(true, true, null, HttpStatus.OK);
}

export function arrayLimitValidator(limit: number) {
  return function arrayLimit(val: unknown[]): boolean {
    return val.length <= limit;
  };
}

export function log(loggerService: LoggerService, event: string, description: string, level: LEVEL = LEVEL.CRITICAL): void {
  loggerService.log(
    JSON.stringify({
      event: event,
      description,
      level,
    }),
  );
}

/**
 * Set cookie
 * @param response response object
 * @param name cookie name
 * @param value cookie value
 * @param options cookie options
 */
export function setCookie(response: Response, name: string, value: string, ttl: number, options: { [key: string]: string } = {}): void {
  const defaultOptions = {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: ttl,
  };

  response.cookie(name, value, { ...defaultOptions, ...options });
}

/**
 * Clears the cookie
 * @param response response object
 * @param name cookie name
 * @param options cookie options
 */
export function clearCookie(response: Response, options: { [key: string]: string } = {}, ...names: string[]): void {
  const defaultOptions = {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 0,
  };

  for (const name of names) {
    response.cookie(name, '', { ...defaultOptions, ...options });
  }
}

export function generateRandomToken(): string {
  const randomToken = crypto.randomBytes(64).toString('hex');
  return randomToken;
}

export function handleResult<T>(result: Result<T | null>): T {
  if (!result.isSuccess() || result.getData() === null) {
    const errorMsg = result.getError() ?? 'An unknown error occurred';
    const errorCode = result.getErrorCode() ?? 500;
    throw new HttpException(errorMsg, errorCode);
  }
  // At this point, TypeScript cannot deduce that result.getData() is not null,
  // so we use a type assertion to tell it that result.getData() is of type T.
  return result.getData() as T;
}

export function generateCode(length: number): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

interface Cookies {
  [key: string]: string;
}

export function getCookieValue(cookieString: string, cookieName: string): string | null {
  if (!cookieString) return null;
  const cookies = cookieString.split('; ').reduce<Cookies>((acc, cookie) => {
    const [name, value] = cookie.split('=');
    acc[name] = value;
    return acc;
  }, {} as Cookies); // Type assertion here

  return cookies[cookieName] || null;
}

export function extractIds(query: string): string[] {
  if (!query) return [];

  const idsArray = query.split(',');

  if (idsArray.some((id) => id.trim() === '')) return [];

  return idsArray.map((id) => id);
}
