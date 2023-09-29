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
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const security_service_1 = require("./security.service");
const constant_1 = require("./../../utils/constant");
const throttler_1 = require("@nestjs/throttler");
const verification_dto_1 = require("./dto/verification.dto");
const password_reset_request_dto_1 = require("./dto/password_reset_request.dto");
const password_reset_dto_1 = require("./dto/password_reset.dto");
const helper_1 = require("./../../utils/helper");
const logger_service_1 = require("../logger/logger.service");
const log_types_1 = require("./../../types/log.types");
const auth_decorator_1 = require("./../../decorator/auth.decorator");
const user_types_1 = require("./../../types/user.types");
const auth_guard_1 = require("./../../guard/auth.guard");
const update_password_dto_1 = require("./dto/update_password.dto");
const update_email_dto_1 = require("./dto/update_email.dto");
const auth_service_1 = require("../shared/auth.service");
let SecurityController = exports.SecurityController = class SecurityController {
    constructor(securityService, loggerService, authService) {
        this.securityService = securityService;
        this.loggerService = loggerService;
        this.authService = authService;
    }
    async emailVerification(token, request) {
        try {
            await this.securityService.verifyEmail(token);
            return;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'email_verification_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async updatePassword(payload, request, response) {
        try {
            const id = this.authService.getId();
            const { oldPassword, newPassword } = payload;
            await this.securityService.updatePassword(oldPassword, newPassword, id);
            (0, helper_1.clearCookie)(response, {}, constant_1.ACCESS_TOKEN_COOKIE_NAME, constant_1.REMEMBER_ME_COOKIE_NAME);
            return;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'update_password_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async updateEmailAddress(payload, request, response) {
        try {
            const id = this.authService.getId();
            const { emailAddress } = payload;
            await this.securityService.updateEmail(emailAddress, id);
            (0, helper_1.clearCookie)(response, {}, constant_1.ACCESS_TOKEN_COOKIE_NAME, constant_1.REMEMBER_ME_COOKIE_NAME);
            return;
        }
        catch (error) {
            console.error(error);
            (0, helper_1.log)(this.loggerService, 'update_email_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async sendVerificationEmail(payload, request) {
        try {
            const { emailAddress, subject, emailPurpose } = payload;
            await this.securityService.queueVerificationEmail(emailAddress, subject, emailPurpose);
            return;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'send_verification_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async passwordResetRequest(payload, request) {
        try {
            const { emailAddress } = payload;
            await this.securityService.passwordResetRequest(emailAddress);
            return;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'get_user_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async passwordReset(payload, request) {
        try {
            const { password, token } = payload;
            await this.securityService.passwordReset(token, password);
            return;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'get_user_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
};
__decorate([
    (0, throttler_1.Throttle)(constant_1.EMAIL_VERIFICATION_REQUEST.LIMIT, constant_1.EMAIL_VERIFICATION_REQUEST.TTL),
    (0, common_1.Post)('/email_verification'),
    __param(0, (0, common_1.Body)('token')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "emailVerification", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.UPDATE_PASSWORD_REQUEST.LIMIT, constant_1.UPDATE_PASSWORD_REQUEST.TTL),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, auth_decorator_1.Active)(constant_1.Status.ACTIVE),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.Post)('/update_password'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_password_dto_1.UpdatePasswordDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "updatePassword", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.UPDATE_EMAIL_REQUEST.LIMIT, constant_1.UPDATE_EMAIL_REQUEST.TTL),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, auth_decorator_1.Active)(constant_1.Status.ACTIVE),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.Post)('/update_email'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_email_dto_1.UpdateEmailDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "updateEmailAddress", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.SEND_VERIFICATION_EMAIL_REQUEST.LIMIT, constant_1.SEND_VERIFICATION_EMAIL_REQUEST.TTL),
    (0, common_1.Post)('/send_verification_email'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verification_dto_1.VerificationEmailDTO, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "sendVerificationEmail", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.PASSWORD_RESET_REQUEST.LIMIT, constant_1.PASSWORD_RESET_REQUEST.TTL),
    (0, common_1.Post)('/password_reset_request'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_request_dto_1.PasswordResetRequestDTO, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "passwordResetRequest", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.PASSWORD_RESET.LIMIT, constant_1.PASSWORD_RESET.TTL),
    (0, common_1.Post)('/password_reset'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_dto_1.PasswordResetDTO, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "passwordReset", null);
exports.SecurityController = SecurityController = __decorate([
    (0, common_1.Controller)('security'),
    __metadata("design:paramtypes", [security_service_1.SecurityService, logger_service_1.LoggerService, auth_service_1.AuthService])
], SecurityController);
//# sourceMappingURL=security.controller.js.map