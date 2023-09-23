import { BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { LoggerService } from './../modules/logger/logger.service';
import { LEVEL } from './../types/log.types';

/**
 * Validates a string to verify if it a valid mongoDB objectID. Logs the error
 * @param objectId MongoDB objectID
 * @param loggerService LoggerService
 * @throws BadRequestException
 */
export function validateObjectId(objectId: string): void {
  if (!Types.ObjectId.isValid(objectId)) {
    throw new BadRequestException('Invalid user ID format');
  }
}

export function arrayLimitValidator(limit: number) {
  return function arrayLimit(val: unknown[]): boolean {
    return val.length <= limit;
  };
}

export function log(loggerService: LoggerService, event: string, description: string, request?: Request, level: LEVEL = LEVEL.CRITICAL): void {
  loggerService.log(
    JSON.stringify({
      event: event,
      description,
      hostIP: request?.ip,
      hostName: request?.hostname,
      requestURI: request?.originalUrl,
      requestMethod: request?.method,
      userAgent: request?.get('user-agent'),
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
