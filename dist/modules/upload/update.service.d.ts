/// <reference types="multer" />
import { IFileUpload } from './../../types/file.types';
import { ConfigService } from '@nestjs/config';
import Result from './../../wrapper/result';
export declare class UploadService {
    private readonly s3;
    private readonly configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, destination: string): Promise<Result<IFileUpload | null>>;
    deleteFile(key: string): Promise<Result<boolean | null>>;
}
