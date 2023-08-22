import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LoggerService } from 'src/modules/logger/logger.service';
import { LEVEL } from 'src/types/log.types';

/**
 * Validates a string to verify if it a valid mongoDB objectID. Logs the error
 * @param objectId MongoDB objectID
 * @param loggerService LoggerService
 * @throws BadRequestException
 */
export function validateObjectId(objectId: string, loggerService: LoggerService): void {
  if (!Types.ObjectId.isValid(objectId)) {
    loggerService.log(JSON.stringify({ event: 'invalid_Id', description: 'Invalid objectId format', level: LEVEL.WARN }));
    throw new BadRequestException('Invalid user ID format');
  }
}
