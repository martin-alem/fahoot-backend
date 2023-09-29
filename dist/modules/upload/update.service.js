"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const helper_1 = require("./../../utils/helper");
const config_1 = require("@nestjs/config");
const constant_1 = require("../../utils/constant");
let UploadService = exports.UploadService = class UploadService {
    constructor(configService) {
        this.configService = configService;
        this.s3 = new client_s3_1.S3({
            forcePathStyle: false,
            endpoint: `https://${this.configService.get('SPACES_ENDPOINT')}`,
            region: this.configService.get('SPACES_REGION'),
            credentials: {
                accessKeyId: this.configService.get('SPACES_KEY') ?? '',
                secretAccessKey: this.configService.get('SPACES_SECRET') ?? '',
            },
        });
    }
    async uploadFile(file, destination) {
        const filename = `${(0, helper_1.generateRandomToken)()}.${file.originalname.split('.').pop()}`;
        let fullPath;
        switch (destination) {
            case constant_1.UploadDestination.PROFILE:
                fullPath = `${constant_1.SPACES_ROOT}/${constant_1.UploadDestination.PROFILE}/${filename}`;
                break;
            case constant_1.UploadDestination.QUESTION_MEDIA:
                fullPath = `${constant_1.SPACES_ROOT}/${constant_1.UploadDestination.QUESTION_MEDIA}/${filename}`;
                break;
            default:
                fullPath = `${constant_1.SPACES_ROOT}/${constant_1.UploadDestination.DEFAULT}/${filename}`;
                break;
        }
        try {
            const BUCKET = this.configService.get('SPACES_BUCKET');
            const SPACES_ENDPOINT = this.configService.get('SPACES_ENDPOINT');
            const params = {
                Bucket: BUCKET ?? '',
                Key: `${fullPath}`,
                Body: file.buffer,
                ACL: 'public-read',
            };
            await this.s3.send(new client_s3_1.PutObjectCommand(params));
            return {
                filename: `https://${BUCKET}.${SPACES_ENDPOINT}/${fullPath}`,
            };
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async deleteFile(key) {
        try {
            const BUCKET = this.configService.get('SPACES_BUCKET');
            const params = {
                Bucket: BUCKET ?? '',
                Key: `${key}`,
            };
            await this.s3.send(new client_s3_1.DeleteObjectCommand(params));
            return;
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
};
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=update.service.js.map