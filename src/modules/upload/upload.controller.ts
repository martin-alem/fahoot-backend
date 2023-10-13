import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Body,
  Query,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Throttle } from '@nestjs/throttler';
import { UploadService } from './update.service';
import { MAX_FILE_SIZE, Status, UPLOAD_REQUEST } from './../../utils/constant';
import { IFileUpload } from './../../types/file.types';
import { handleResult } from './../../utils/helper';
import { UserRole } from './../../types/user.types';
import { Active, Role } from './../../decorator/auth.decorator';
import { AuthorizationGuard } from './../../guard/auth.guard';
import { ExtraUploadDataDTO } from './dto/extra_data.dto';

@Controller('upload')
export class UploadController {
  private readonly uploadService: UploadService;
  constructor(uploadService: UploadService) {
    this.uploadService = uploadService;
  }

  @Throttle(UPLOAD_REQUEST.LIMIT, UPLOAD_REQUEST.TTL)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 1e7 } }))
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
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
  ): Promise<IFileUpload> {
    try {
      const { destination } = payload;
      const uploadResponse = await this.uploadService.uploadFile(file, destination);
      return handleResult<IFileUpload>(uploadResponse);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(UPLOAD_REQUEST.LIMIT, UPLOAD_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Delete()
  async deleteFile(@Query('key') key: string): Promise<boolean> {
    try {
      const result = await this.uploadService.deleteFile(key);
      return handleResult<boolean>(result);
    } catch (error) {
      throw error;
    }
  }
}
