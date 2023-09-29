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
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const notification_service_1 = require("./../notification/notification.service");
const mongoose_1 = require("mongoose");
const tokens_schema_1 = require("./schema/tokens.schema");
const mongoose_2 = require("@nestjs/mongoose");
const user_service_1 = require("./../user/user.service");
const user_types_1 = require("./../../types/user.types");
const constant_1 = require("./../../utils/constant");
const notification_type_1 = require("./../../types/notification.type");
const email_templates_1 = require("../../utils/email_templates");
const helper_1 = require("./../../utils/helper");
let SecurityService = exports.SecurityService = class SecurityService {
    constructor(jwtService, configService, userService, notificationService, tokenModel) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.userService = userService;
        this.notificationService = notificationService;
        this.tokenModel = tokenModel;
    }
    async signToken(user, ttl) {
        try {
            const token = await this.jwtService.signAsync({
                id: user.id,
                emailAddress: user.emailAddress,
                role: user.role,
            }, {
                audience: this.configService.get('JWT_TOKEN_AUDIENCE'),
                issuer: this.configService.get('JWT_TOKEN_ISSUER'),
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: ttl,
            });
            return token;
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async validateToken(token) {
        try {
            const decodedToken = this.jwtService.verify(token, {
                audience: this.configService.get('JWT_TOKEN_AUDIENCE'),
                issuer: this.configService.get('JWT_TOKEN_ISSUER'),
                secret: this.configService.get('JWT_SECRET'),
            });
            return decodedToken;
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async hash(data) {
        try {
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(data, salt);
            return hash.toString();
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async compare(incomingData, hashedData) {
        try {
            const isMatch = await bcrypt.compare(incomingData, hashedData);
            return isMatch;
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async generateTokens(user, tokenTTL) {
        try {
            const token = await this.signToken(user, tokenTTL);
            return token;
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async queueVerificationEmail(emailAddress, subject, emailPurpose) {
        try {
            let message = '';
            const token = await this.generateTokens({ id: '', emailAddress: emailAddress, role: user_types_1.UserRole.USER }, constant_1.JWT_TTL.ACCESS_TOKEN_TTL);
            const newToken = await this.tokenModel.updateOne({ emailAddress: emailAddress }, { token: token }, { upsert: true });
            if (!newToken)
                throw new common_1.InternalServerErrorException(constant_1.ErrorMessages.INTERNAL_ERROR);
            if (emailPurpose === constant_1.EmailPurpose.EMAIL_VERIFICATION) {
                const link = `${this.configService.get('VERIFY_EMAIL_URL')}?token=${token}`;
                message = (0, email_templates_1.createEmailVerificationTemplate)(link);
            }
            else if (emailPurpose === constant_1.EmailPurpose.PASSWORD_RESET) {
                const link = `${this.configService.get('PASSWORD_RESET_URL')}?token=${token}`;
                message = (0, email_templates_1.createPasswordResetTemplate)(link);
            }
            const payload = {
                to: emailAddress,
                subject,
                message,
            };
            const notification = {
                type: notification_type_1.NotificationType.EMAIL,
                payload: payload,
            };
            this.notificationService.enqueueNotification(JSON.stringify(notification));
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async verifyToken(token) {
        try {
            const tokenExist = await this.tokenModel.findOne({ token: token });
            if (!tokenExist)
                throw new common_1.UnauthorizedException(constant_1.ErrorMessages.UNAUTHORIZED);
            const decodedToken = await this.validateToken(token);
            if (decodedToken.emailAddress !== tokenExist.emailAddress)
                throw new common_1.UnauthorizedException(constant_1.ErrorMessages.TOKEN_EMAIL_MISMATCH);
            await this.tokenModel.findOneAndDelete({ token });
            return decodedToken;
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async verifyEmail(token) {
        try {
            const decodedToken = await this.verifyToken(token);
            await this.userService.updateSensitiveData({ verified: true, status: constant_1.Status.ACTIVE }, decodedToken.emailAddress);
            return;
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async updatePassword(oldPassword, newPassword, userId) {
        try {
            (0, helper_1.validateObjectId)(userId);
            const user = await this.userService.getUser(userId);
            if (!user)
                throw new common_1.UnauthorizedException(constant_1.ErrorMessages.UNAUTHORIZED);
            const validPassword = await this.compare(oldPassword, user.password);
            if (!validPassword)
                throw new common_1.BadRequestException(constant_1.ErrorMessages.INVALID_REQUEST);
            const hashedPassword = await this.hash(newPassword);
            await this.userService.updateSensitiveData({ password: hashedPassword }, user.emailAddress);
            return;
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async updateEmail(newEmailAddress, userId) {
        try {
            (0, helper_1.validateObjectId)(userId);
            const user = await this.userService.getUser(userId);
            if (!user)
                throw new common_1.UnauthorizedException(constant_1.ErrorMessages.UNAUTHORIZED);
            try {
                const checkNewEmail = await this.userService.findByEmailAddress(newEmailAddress);
                if (checkNewEmail)
                    throw new common_1.BadRequestException(constant_1.ErrorMessages.INVALID_REQUEST);
            }
            catch (error) {
                await this.userService.updateSensitiveData({ emailAddress: newEmailAddress, status: constant_1.Status.INACTIVE, verified: false }, user.emailAddress);
                await this.queueVerificationEmail(newEmailAddress, 'Verify Email', constant_1.EmailPurpose.EMAIL_VERIFICATION);
            }
            return;
        }
        catch (error) {
            console.log(error);
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async passwordResetRequest(emailAddress) {
        try {
            const subject = 'Password Reset Request';
            await this.userService.findByEmailAddress(emailAddress);
            await this.queueVerificationEmail(emailAddress, subject, constant_1.EmailPurpose.PASSWORD_RESET);
            return;
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async passwordReset(token, password) {
        try {
            const decodedToken = await this.verifyToken(token);
            const hashedPassword = await this.hash(password);
            await this.userService.updateSensitiveData({ password: hashedPassword }, decodedToken.emailAddress);
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
};
exports.SecurityService = SecurityService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __param(4, (0, mongoose_2.InjectModel)(tokens_schema_1.Token.name, constant_1.DEFAULT_DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        user_service_1.UserService,
        notification_service_1.NotificationService,
        mongoose_1.Model])
], SecurityService);
//# sourceMappingURL=security.service.js.map