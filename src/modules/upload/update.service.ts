import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { IFileUpload } from './../../types/file.types';
import { generateRandomToken } from './../../utils/helper';
import { ConfigService } from '@nestjs/config';
import { SPACES_ROOT, UploadDestination } from 'src/utils/constant';

@Injectable()
export class UploadService {
  private readonly s3: S3;
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
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
  }

  async uploadFile(file: Express.Multer.File, destination: string): Promise<IFileUpload> {
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
      return {
        filename: `https://${BUCKET}.${SPACES_ENDPOINT}/${fullPath}`,
      };
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const BUCKET = this.configService.get<string>('SPACES_BUCKET');
      const params = {
        Bucket: BUCKET ?? '',
        Key: `${key}`,
      };

      await this.s3.send(new DeleteObjectCommand(params));
      return;
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
