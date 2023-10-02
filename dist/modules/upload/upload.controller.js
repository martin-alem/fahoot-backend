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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const throttler_1 = require("@nestjs/throttler");
const update_service_1 = require("./update.service");
const constant_1 = require("./../../utils/constant");
const logger_service_1 = require("../logger/logger.service");
const helper_1 = require("./../../utils/helper");
const log_types_1 = require("./../../types/log.types");
const user_types_1 = require("./../../types/user.types");
const auth_decorator_1 = require("./../../decorator/auth.decorator");
const auth_guard_1 = require("./../../guard/auth.guard");
const extra_data_dto_1 = require("./dto/extra_data.dto");
let UploadController = exports.UploadController = class UploadController {
    constructor(uploadService, loggerService) {
        this.uploadService = uploadService;
        this.loggerService = loggerService;
    }
    async uploadFile(file, payload, request) {
        try {
            const { destination } = payload;
            const uploadResponse = await this.uploadService.uploadFile(file, destination);
            return (0, helper_1.handleResult)(uploadResponse);
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'file_upload_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async deleteFile(key, request) {
        try {
            const result = await this.uploadService.deleteFile(key);
            return (0, helper_1.handleResult)(result);
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'file_delete_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
};
__decorate([
    (0, throttler_1.Throttle)(constant_1.UPLOAD_REQUEST.LIMIT, constant_1.UPLOAD_REQUEST.TTL),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 1e7 } })),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, auth_decorator_1.Active)(constant_1.Status.ACTIVE),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [new common_1.MaxFileSizeValidator({ maxSize: constant_1.MAX_FILE_SIZE }), new common_1.FileTypeValidator({ fileType: 'image/*' })],
    }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, extra_data_dto_1.ExtraUploadDataDTO, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadFile", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.UPLOAD_REQUEST.LIMIT, constant_1.UPLOAD_REQUEST.TTL),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, auth_decorator_1.Active)(constant_1.Status.ACTIVE),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Query)('key')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "deleteFile", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [update_service_1.UploadService, logger_service_1.LoggerService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map