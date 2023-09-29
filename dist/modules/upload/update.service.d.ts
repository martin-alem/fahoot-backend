/// <reference types="multer" />
import { IFileUpload } from './../../types/file.types';
import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private readonly s3;
    private readonly configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, destination: string): Promise<IFileUpload>;
    deleteFile(key: string): Promise<void>;
}
