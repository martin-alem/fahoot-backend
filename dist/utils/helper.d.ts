import { Request, Response } from 'express';
import { LoggerService } from './../modules/logger/logger.service';
import { LEVEL } from './../types/log.types';
import Result from 'src/wrapper/result';
export declare function validateObjectId(objectId: string): Result<boolean>;
export declare function arrayLimitValidator(limit: number): (val: unknown[]) => boolean;
export declare function log(loggerService: LoggerService, event: string, description: string, request?: Request, level?: LEVEL): void;
export declare function setCookie(response: Response, name: string, value: string, ttl: number, options?: {
    [key: string]: string;
}): void;
export declare function clearCookie(response: Response, options?: {
    [key: string]: string;
}, ...names: string[]): void;
export declare function generateRandomToken(): string;
export declare function handleResult<T>(result: Result<T | null>): T;
