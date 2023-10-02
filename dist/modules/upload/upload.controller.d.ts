/// <reference types="multer" />
import { Request } from 'express';
import { UploadService } from './update.service';
import { IFileUpload } from './../../types/file.types';
import { LoggerService } from '../logger/logger.service';
import { ExtraUploadDataDTO } from './dto/extra_data.dto';
export declare class UploadController {
    private readonly uploadService;
    private readonly loggerService;
    constructor(uploadService: UploadService, loggerService: LoggerService);
    uploadFile(file: Express.Multer.File, payload: ExtraUploadDataDTO, request: Request): Promise<IFileUpload>;
    deleteFile(key: string, request: Request): Promise<boolean>;
}
