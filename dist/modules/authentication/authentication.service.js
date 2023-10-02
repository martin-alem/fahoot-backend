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
const result_1 = require("../../wrapper/result");
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
            const userData = user.getData();
            if (!userData)
                return new result_1.default(false, null, 'Could not create user', common_1.HttpStatus.BAD_REQUEST);
            const result = await this.securityService.queueVerificationEmail(userData.emailAddress, 'Verify Email', constant_1.EmailPurpose.EMAIL_VERIFICATION);
            if (!result.isSuccess)
                return new result_1.default(false, null, 'Could not enqueue verification email', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, userData, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async googleSignUp(payload) {
        try {
            const googleUser = await this.googleOAuthVerification(payload);
            const googleUserData = googleUser.getData();
            if (!googleUserData)
                return new result_1.default(false, null, 'Could not get user data from google', common_1.HttpStatus.BAD_REQUEST);
            const user = await this.userService.createUser({ ...googleUserData, authenticationMethod: constant_1.AuthenticationMethod.GOOGLE_OAUTH });
            const userData = user.getData();
            if (!userData)
                return new result_1.default(false, null, 'Could not create user using google account', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, userData, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async signIn(payload) {
        try {
            const { emailAddress, password } = payload;
            const user = await this.userService.findByEmailAddress(emailAddress);
            const userData = user.getData();
            if (!userData)
                return new result_1.default(false, null, 'Could not find email address', common_1.HttpStatus.BAD_REQUEST);
            const passwordMatched = await this.securityService.compare(password, userData.password);
            if (!passwordMatched.getData())
                return new result_1.default(false, null, 'Invalid password', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, userData, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async googleSignIn(payload) {
        try {
            const googleUser = await this.googleOAuthVerification(payload);
            const googleUserData = googleUser.getData();
            if (!googleUserData)
                return new result_1.default(false, null, 'Could not get user data from google', common_1.HttpStatus.BAD_REQUEST);
            const user = await this.userService.findByEmailAddress(googleUserData.emailAddress);
            const userData = user.getData();
            if (!userData)
                return new result_1.default(false, null, 'Could not find email address for google signin', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, userData, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async googleOAuthVerification(token) {
        const ticket = await Client.verifyIdToken({ idToken: token, audience: this.configService.get('GOOGLE_CLIENT_KEY') });
        const googlePayload = ticket.getPayload();
        if (!googlePayload)
            throw new common_1.BadRequestException(constant_1.ErrorMessages.GOOGLE_OAUTH_FAILED);
        if (!googlePayload.given_name || !googlePayload.family_name || !googlePayload.email || !googlePayload.email_verified || !googlePayload.picture) {
            return new result_1.default(false, null, 'Invalid google payload', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!googlePayload.email_verified)
            return new result_1.default(false, null, 'Google authentication failed', common_1.HttpStatus.BAD_REQUEST);
        const googleUser = {
            firstName: googlePayload.given_name,
            lastName: googlePayload.family_name,
            emailAddress: googlePayload.email,
            verified: googlePayload.email_verified,
            avatarUrl: googlePayload.picture,
            status: constant_1.Status.ACTIVE,
        };
        return new result_1.default(true, googleUser, null, common_1.HttpStatus.OK);
    }
};
exports.AuthenticationService = AuthenticationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService, security_service_1.SecurityService, config_1.ConfigService])
], AuthenticationService);
//# sourceMappingURL=authentication.service.js.map