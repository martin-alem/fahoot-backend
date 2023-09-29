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
exports.AuthenticationController = void 0;
const common_1 = require("@nestjs/common");
const signup_dto_1 = require("./dto/signup.dto");
const authentication_service_1 = require("./authentication.service");
const signin_dto_1 = require("./dto/signin.dto");
const throttler_1 = require("@nestjs/throttler");
const constant_1 = require("./../../utils/constant");
const logger_service_1 = require("../logger/logger.service");
const helper_1 = require("./../../utils/helper");
const security_service_1 = require("../security/security.service");
const response_interceptor_1 = require("./../../interceptor/response.interceptor");
const UserShape_1 = require("./response/UserShape");
const google_auth_dto_1 = require("./dto/google_auth.dto");
let AuthenticationController = exports.AuthenticationController = class AuthenticationController {
    constructor(authenticationService, securityService, loggerService) {
        this.authenticationService = authenticationService;
        this.loggerService = loggerService;
        this.securityService = securityService;
    }
    async signup(payload, request, response) {
        try {
            const user = await this.authenticationService.signUp(payload);
            const accessToken = await this.securityService.generateTokens({ id: user._id, emailAddress: user.emailAddress, role: user.role }, constant_1.JWT_TTL.ACCESS_TOKEN_TTL);
            (0, helper_1.setCookie)(response, constant_1.ACCESS_TOKEN_COOKIE_NAME, accessToken, constant_1.COOKIE.ACCESS_TOKEN_COOKIE_TTL);
            return user;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'manual_signup-error', error.message, request);
            throw error;
        }
    }
    async googleSignup(payload, request, response) {
        try {
            const user = await this.authenticationService.googleSignUp(payload.credential);
            const accessToken = await this.securityService.generateTokens({ id: user._id, emailAddress: user.emailAddress, role: user.role }, constant_1.JWT_TTL.ACCESS_TOKEN_TTL);
            (0, helper_1.setCookie)(response, constant_1.ACCESS_TOKEN_COOKIE_NAME, accessToken, constant_1.COOKIE.ACCESS_TOKEN_COOKIE_TTL);
            return user;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'google_signup-error', error.message, request);
            throw error;
        }
    }
    async signin(payload, request, response) {
        try {
            const user = await this.authenticationService.signIn(payload);
            const accessToken = await this.securityService.generateTokens({ id: user._id, emailAddress: user.emailAddress, role: user.role }, constant_1.JWT_TTL.ACCESS_TOKEN_TTL);
            const rememberMeToken = await this.securityService.generateTokens({ id: user._id, emailAddress: user.emailAddress, role: user.role }, constant_1.JWT_TTL.REMEMBER_ME_TOKEN_TTL);
            (0, helper_1.setCookie)(response, constant_1.ACCESS_TOKEN_COOKIE_NAME, accessToken, constant_1.COOKIE.ACCESS_TOKEN_COOKIE_TTL);
            if (payload.rememberMe)
                (0, helper_1.setCookie)(response, constant_1.REMEMBER_ME_COOKIE_NAME, rememberMeToken, constant_1.COOKIE.REMEMBER_ME_COOKIE_TTL);
            return user;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'manual_signin-error', error.message, request);
            throw error;
        }
    }
    async googleSignin(payload, request, response) {
        try {
            const user = await this.authenticationService.googleSignIn(payload.credential);
            const accessToken = await this.securityService.generateTokens({ id: user._id, emailAddress: user.emailAddress, role: user.role }, constant_1.JWT_TTL.ACCESS_TOKEN_TTL);
            (0, helper_1.setCookie)(response, constant_1.ACCESS_TOKEN_COOKIE_NAME, accessToken, constant_1.COOKIE.ACCESS_TOKEN_COOKIE_TTL);
            return user;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'google_signin-error', error.message, request);
            throw error;
        }
    }
    async autoLogin(request) {
        try {
            const tokenCookie = request.cookies[constant_1.REMEMBER_ME_COOKIE_NAME];
            if (!tokenCookie) {
                throw new common_1.ForbiddenException('Token cookie not found');
            }
            const decodedPayload = await this.securityService.validateToken(tokenCookie);
            return decodedPayload;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'auto_signin-error', error.message, request);
            throw error;
        }
    }
    logout(response) {
        (0, helper_1.clearCookie)(response, {}, constant_1.ACCESS_TOKEN_COOKIE_NAME);
    }
    clearRememberMe(response) {
        (0, helper_1.clearCookie)(response, {}, constant_1.REMEMBER_ME_COOKIE_NAME);
    }
};
__decorate([
    (0, throttler_1.Throttle)(constant_1.SIGNUP_REQUEST.LIMIT, constant_1.SIGNUP_REQUEST.TTL),
    (0, common_1.UseInterceptors)(new response_interceptor_1.ResponseInterceptor(UserShape_1.UserShape)),
    (0, common_1.Post)('/signup'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignUpDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthenticationController.prototype, "signup", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.SIGNUP_REQUEST.LIMIT, constant_1.SIGNUP_REQUEST.TTL),
    (0, common_1.Post)('/google_signup'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [google_auth_dto_1.GoogleOAuthDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthenticationController.prototype, "googleSignup", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.SIGNIN_REQUEST.LIMIT, constant_1.SIGNIN_REQUEST.TTL),
    (0, common_1.UseInterceptors)(new response_interceptor_1.ResponseInterceptor(UserShape_1.UserShape)),
    (0, common_1.Post)('/signin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signin_dto_1.SignInDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthenticationController.prototype, "signin", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.SIGNIN_REQUEST.LIMIT, constant_1.SIGNIN_REQUEST.TTL),
    (0, common_1.Post)('/google_signin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [google_auth_dto_1.GoogleOAuthDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthenticationController.prototype, "googleSignin", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.SIGNIN_REQUEST.LIMIT, constant_1.SIGNIN_REQUEST.TTL),
    (0, common_1.Post)('/auto_login'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthenticationController.prototype, "autoLogin", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.LOGOUT_REQUEST.LIMIT, constant_1.LOGOUT_REQUEST.TTL),
    (0, common_1.Delete)('/logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthenticationController.prototype, "logout", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.LOGOUT_REQUEST.LIMIT, constant_1.LOGOUT_REQUEST.TTL),
    (0, common_1.Delete)('/remember_me'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthenticationController.prototype, "clearRememberMe", null);
exports.AuthenticationController = AuthenticationController = __decorate([
    (0, common_1.Controller)('authentication'),
    __metadata("design:paramtypes", [authentication_service_1.AuthenticationService, security_service_1.SecurityService, logger_service_1.LoggerService])
], AuthenticationController);
//# sourceMappingURL=authentication.controller.js.map