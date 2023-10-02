import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  Req,
  UseGuards,
  Body,
  Query,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Throttle } from '@nestjs/throttler';
import { UploadService } from './update.service';
import { MAX_FILE_SIZE, Status, UPLOAD_REQUEST } from './../../utils/constant';
import { IFileUpload } from './../../types/file.types';
import { LoggerService } from '../logger/logger.service';
import { handleResult, log } from './../../utils/helper';
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
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }), new FileTypeValidator({ fileType: 'image/*' })],
      }),
    )
    file: Express.Multer.File,
    @Body() payload: ExtraUploadDataDTO,
    @Req() request: Request,
  ): Promise<IFileUpload> {
    try {
      const { destination } = payload;
      const uploadResponse = await this.uploadService.uploadFile(file, destination);
      return handleResult<IFileUpload>(uploadResponse);
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
  async deleteFile(@Query('key') key: string, @Req() request: Request): Promise<boolean> {
    try {
      const result = await this.uploadService.deleteFile(key);
      return handleResult<boolean>(result);
    } catch (error) {
      log(this.loggerService, 'file_delete_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }
}
