import { Controller, Post, Delete, UploadedFile, UseInterceptors, InternalServerErrorException, Req, UseGuards, Body, Query } from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Throttle } from '@nestjs/throttler';
import { UploadService } from './update.service';
import { ErrorMessages, Status, UPLOAD_REQUEST } from './../../utils/constant';
import { IFileUpload } from './../../types/file.types';
import { LoggerService } from '../logger/logger.service';
import { log } from './../../utils/helper';
import { LEVEL } from './../../types/log.types';
import { UserRole } from './../../types/user.types';
import { Active, Role } from './../../decorator/auth.decorator';
import { AuthorizationGuard } from './../../guard/auth.guard';
import { ExtraUploadDataDTO } from './dto/extra_data.dto';

@Controller('upload')
export class UploadController {
  private readonly uploadService: UploadService;
  private readonly loggerService: LoggerService;
  constructor(uploadService: UploadService, loggerService: LoggerService) {
    this.uploadService = uploadService;
    this.loggerService = loggerService;
  }

  @Throttle(UPLOAD_REQUEST.LIMIT, UPLOAD_REQUEST.TTL)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 1e7 } }))
  @Role(UserRole.USER)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @Post()
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() payload: ExtraUploadDataDTO, @Req() request: Request): Promise<IFileUpload> {
    try {
      const { destination } = payload;
      const uploadResponse = await this.uploadService.uploadFile(file, destination);
      return uploadResponse;
    } catch (error) {
      log(this.loggerService, 'file_upload_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }

  @Throttle(UPLOAD_REQUEST.LIMIT, UPLOAD_REQUEST.TTL)
  @Role(UserRole.USER)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @Delete()
  deleteFile(@Query('key') key: string, @Req() request: Request): Promise<void> {
    try {
      return this.uploadService.deleteFile(key);
    } catch (error) {
      log(this.loggerService, 'file_delete_error', error.message, request, LEVEL.CRITICAL);
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }
}
