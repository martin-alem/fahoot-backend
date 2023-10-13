import { HttpStatus, Injectable } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { IFileUpload } from './../../types/file.types';
import { generateRandomToken, log } from './../../utils/helper';
import { ConfigService } from '@nestjs/config';
import { ErrorMessages, SPACES_ROOT, UploadDestination } from './../../utils/constant';
import Result from './../../wrapper/result';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UploadService {
  private readonly s3: S3;
  private readonly configService: ConfigService;
  private readonly loggerService: LoggerService;

  constructor(configService: ConfigService, loggerService: LoggerService) {
    this.configService = configService;
    this.s3 = new S3({
      forcePathStyle: false, // Configures to use subdomain/virtual calling format.
      endpoint: `https://${this.configService.get<string>('SPACES_ENDPOINT')}`,
      region: this.configService.get<string>('SPACES_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('SPACES_KEY') ?? '',
        secretAccessKey: this.configService.get<string>('SPACES_SECRET') ?? '',
      },
    });
    this.loggerService = loggerService;
  }

  async uploadFile(file: Express.Multer.File, destination: string): Promise<Result<IFileUpload | null>> {
    const filename = `${generateRandomToken()}.${file.originalname.split('.').pop()}`;
    let fullPath: string;
    switch (destination) {
      case UploadDestination.PROFILE:
        fullPath = `${SPACES_ROOT}/${UploadDestination.PROFILE}/${filename}`;
        break;
      case UploadDestination.QUESTION_MEDIA:
        fullPath = `${SPACES_ROOT}/${UploadDestination.QUESTION_MEDIA}/${filename}`;
        break;
      default:
        fullPath = `${SPACES_ROOT}/${UploadDestination.DEFAULT}/${filename}`;
        break;
    }
    try {
      const BUCKET = this.configService.get<string>('SPACES_BUCKET');
      const SPACES_ENDPOINT = this.configService.get<string>('SPACES_ENDPOINT');
      const params = {
        Bucket: BUCKET ?? '',
        Key: `${fullPath}`,
        Body: file.buffer,
        ACL: 'public-read',
      };

      await this.s3.send(new PutObjectCommand(params));
      const data: IFileUpload = { filename: `https://${BUCKET}.${SPACES_ENDPOINT}/${fullPath}` };
      return new Result<IFileUpload>(true, data, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'upload_file_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteFile(key: string): Promise<Result<boolean | null>> {
    try {
      const BUCKET = this.configService.get<string>('SPACES_BUCKET');
      const params = {
        Bucket: BUCKET ?? '',
        Key: `${key}`,
      };

      await this.s3.send(new DeleteObjectCommand(params));
      return new Result<boolean>(true, true, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'delete_file_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
