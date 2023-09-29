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
exports.AuthenticationService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const security_service_1 = require("../security/security.service");
const constant_1 = require("./../../utils/constant");
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("@nestjs/config");
const Client = new google_auth_library_1.OAuth2Client();
let AuthenticationService = exports.AuthenticationService = class AuthenticationService {
    constructor(userService, securityService, configService) {
        this.userService = userService;
        this.securityService = securityService;
        this.configService = configService;
    }
    async signUp(payload) {
        try {
            const user = await this.userService.createUser({ ...payload, verified: false, status: constant_1.Status.INACTIVE });
            await this.securityService.queueVerificationEmail(user.emailAddress, 'Verify Email', constant_1.EmailPurpose.EMAIL_VERIFICATION);
            return user;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException(constant_1.ErrorMessages.INTERNAL_ERROR);
        }
    }
    async googleSignUp(payload) {
        try {
            const googleUser = await this.googleOAuthVerification(payload);
            const user = await this.userService.createUser({ ...googleUser, authenticationMethod: constant_1.AuthenticationMethod.GOOGLE_OAUTH });
            return user;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException(constant_1.ErrorMessages.INTERNAL_ERROR);
        }
    }
    async signIn(payload) {
        try {
            const { emailAddress, password } = payload;
            const user = await this.userService.findByEmailAddress(emailAddress);
            const passwordMatched = await this.securityService.compare(password, user.password);
            if (!passwordMatched)
                throw new common_1.BadRequestException(constant_1.ErrorMessages.INVALID_LOGIN);
            return user;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            if (error instanceof common_1.NotFoundException)
                throw new common_1.BadRequestException(constant_1.ErrorMessages.INVALID_LOGIN);
            throw new common_1.InternalServerErrorException(constant_1.ErrorMessages.INTERNAL_ERROR);
        }
    }
    async googleSignIn(payload) {
        try {
            const googleUser = await this.googleOAuthVerification(payload);
            const user = await this.userService.findByEmailAddress(googleUser.emailAddress);
            return user;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            if (error instanceof common_1.NotFoundException)
                throw new common_1.BadRequestException(constant_1.ErrorMessages.INVALID_LOGIN);
            throw new common_1.InternalServerErrorException(constant_1.ErrorMessages.INTERNAL_ERROR);
        }
    }
    async googleOAuthVerification(token) {
        const ticket = await Client.verifyIdToken({ idToken: token, audience: this.configService.get('GOOGLE_CLIENT_KEY') });
        const googlePayload = ticket.getPayload();
        if (!googlePayload)
            throw new common_1.BadRequestException(constant_1.ErrorMessages.GOOGLE_OAUTH_FAILED);
        if (!googlePayload.given_name || !googlePayload.family_name || !googlePayload.email || !googlePayload.email_verified || !googlePayload.picture)
            throw new common_1.BadRequestException(constant_1.ErrorMessages.GOOGLE_OAUTH_FAILED);
        if (!googlePayload.email_verified)
            throw new common_1.BadRequestException(constant_1.ErrorMessages.GOOGLE_OAUTH_FAILED);
        const googleUser = {
            firstName: googlePayload.given_name,
            lastName: googlePayload.family_name,
            emailAddress: googlePayload.email,
            verified: googlePayload.email_verified,
            avatarUrl: googlePayload.picture,
            status: constant_1.Status.ACTIVE,
        };
        return googleUser;
    }
};
exports.AuthenticationService = AuthenticationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService, security_service_1.SecurityService, config_1.ConfigService])
], AuthenticationService);
//# sourceMappingURL=authentication.service.js.map