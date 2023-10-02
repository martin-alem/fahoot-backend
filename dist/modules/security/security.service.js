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
const result_1 = require("../../wrapper/result");
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
            return new result_1.default(true, token, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async validateToken(token) {
        try {
            const decodedToken = this.jwtService.verify(token, {
                audience: this.configService.get('JWT_TOKEN_AUDIENCE'),
                issuer: this.configService.get('JWT_TOKEN_ISSUER'),
                secret: this.configService.get('JWT_SECRET'),
            });
            return new result_1.default(true, decodedToken, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async hash(data) {
        try {
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(data, salt);
            return new result_1.default(true, hash.toString(), null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async compare(incomingData, hashedData) {
        try {
            const isMatch = await bcrypt.compare(incomingData, hashedData);
            return new result_1.default(true, isMatch, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateTokens(user, tokenTTL) {
        try {
            const token = await this.signToken(user, tokenTTL);
            const data = token.getData();
            if (!data)
                return new result_1.default(false, null, 'Unable to sign token', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, data, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async queueVerificationEmail(emailAddress, subject, emailPurpose) {
        try {
            let message = '';
            const token = await this.generateTokens({ id: '', emailAddress: emailAddress, role: user_types_1.UserRole.USER }, constant_1.JWT_TTL.ACCESS_TOKEN_TTL);
            const tokenData = token.getData();
            if (!tokenData)
                return new result_1.default(false, null, 'Could not generate token', common_1.HttpStatus.BAD_REQUEST);
            const newToken = await this.tokenModel.updateOne({ emailAddress: emailAddress }, { token: tokenData }, { upsert: true });
            if (!newToken)
                return new result_1.default(false, null, 'Unable to update token', common_1.HttpStatus.BAD_REQUEST);
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
            return new result_1.default(true, true, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyToken(token) {
        try {
            const tokenExist = await this.tokenModel.findOne({ token: token });
            if (!tokenExist)
                return new result_1.default(false, null, 'Token does not exist', common_1.HttpStatus.BAD_REQUEST);
            const decodedToken = await this.validateToken(token);
            const decodedTokenData = decodedToken.getData();
            if (!decodedTokenData)
                return new result_1.default(false, null, 'Error validating token', common_1.HttpStatus.BAD_REQUEST);
            if (decodedTokenData.emailAddress !== tokenExist.emailAddress)
                return new result_1.default(false, null, 'Token mismatch', common_1.HttpStatus.BAD_REQUEST);
            const deletedToken = await this.tokenModel.findOneAndDelete({ token });
            if (!deletedToken)
                return new result_1.default(false, null, 'Token could not be deleted', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, decodedToken.getData(), null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyEmail(token) {
        try {
            const decodedToken = await this.verifyToken(token);
            const decodedTokenData = decodedToken.getData();
            if (!decodedTokenData)
                return new result_1.default(false, null, 'Token could not be verified', common_1.HttpStatus.BAD_REQUEST);
            const updateResult = await this.userService.updateSensitiveData({ verified: true, status: constant_1.Status.ACTIVE }, decodedTokenData.emailAddress);
            const updatedResultData = updateResult.getData();
            if (!updatedResultData)
                return new result_1.default(false, null, 'Unable to update sensitive data', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, updatedResultData, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updatePassword(oldPassword, newPassword, userId) {
        try {
            const isValidObjectId = (0, helper_1.validateObjectId)(userId);
            if (!isValidObjectId.getData())
                return new result_1.default(false, null, `Invalid objectId: ${userId}`, common_1.HttpStatus.BAD_REQUEST);
            const user = await this.userService.getUser(userId);
            const userData = user.getData();
            if (!userData)
                return new result_1.default(false, null, `Unable to find user with id: ${userId}`, common_1.HttpStatus.BAD_REQUEST);
            const validPassword = await this.compare(oldPassword, userData.password);
            const validPasswordData = validPassword.getData();
            if (!validPasswordData)
                return new result_1.default(false, null, 'Password does not match', common_1.HttpStatus.BAD_REQUEST);
            const hashedPassword = await this.hash(newPassword);
            const hashedPasswordData = hashedPassword.getData();
            if (!hashedPasswordData)
                return new result_1.default(false, null, 'Unable to hash password', common_1.HttpStatus.BAD_REQUEST);
            const updateResult = await this.userService.updateSensitiveData({ password: hashedPasswordData }, userData.emailAddress);
            const updateResultData = updateResult.getData();
            if (!updateResultData)
                return new result_1.default(false, null, 'Unable to update user password', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, userData, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateEmail(newEmailAddress, userId) {
        try {
            const isValidObjectId = (0, helper_1.validateObjectId)(userId);
            if (!isValidObjectId.getData())
                return new result_1.default(false, null, `Invalid objectId: ${userId}`, common_1.HttpStatus.BAD_REQUEST);
            const user = await this.userService.getUser(userId);
            const userData = user.getData();
            if (!userData)
                return new result_1.default(false, null, `Unable to find user with id: ${userId}`, common_1.HttpStatus.BAD_REQUEST);
            const checkNewEmail = await this.userService.findByEmailAddress(newEmailAddress);
            const checkNewEmailData = checkNewEmail.getData();
            if (!checkNewEmailData)
                return new result_1.default(false, null, 'Email address already exists', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, userData, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async passwordResetRequest(emailAddress) {
        try {
            const subject = 'Password Reset Request';
            const result = await this.userService.findByEmailAddress(emailAddress);
            const resultData = result.getData();
            if (!resultData)
                return new result_1.default(false, null, `Unable to find user with email address: ${emailAddress}`, common_1.HttpStatus.BAD_REQUEST);
            await this.queueVerificationEmail(emailAddress, subject, constant_1.EmailPurpose.PASSWORD_RESET);
            return new result_1.default(true, true, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async passwordReset(token, password) {
        try {
            const decodedToken = await this.verifyToken(token);
            const decodedTokenData = decodedToken.getData();
            if (!decodedTokenData)
                return new result_1.default(false, null, 'Unable to verify token', common_1.HttpStatus.BAD_REQUEST);
            const hashedPassword = await this.hash(password);
            const hashedPasswordData = hashedPassword.getData();
            if (!hashedPasswordData)
                return new result_1.default(false, null, 'Unable to hash user password', common_1.HttpStatus.BAD_REQUEST);
            const updateResult = await this.userService.updateSensitiveData({ password: hashedPasswordData }, decodedTokenData.emailAddress);
            const updateResultData = updateResult.getData();
            if (!updateResultData)
                return new result_1.default(false, null, 'Unable to update user data', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, true, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
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