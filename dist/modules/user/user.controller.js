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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const throttler_1 = require("@nestjs/throttler");
const update_user_dto_1 = require("./dto/update_user.dto");
const auth_service_1 = require("../shared/auth.service");
const auth_decorator_1 = require("./../../decorator/auth.decorator");
const auth_guard_1 = require("./../../guard/auth.guard");
const constant_1 = require("./../../utils/constant");
const user_types_1 = require("./../../types/user.types");
const logger_service_1 = require("../logger/logger.service");
const helper_1 = require("./../../utils/helper");
const log_types_1 = require("./../../types/log.types");
const response_interceptor_1 = require("./../../interceptor/response.interceptor");
const UserShape_1 = require("../authentication/response/UserShape");
let UserController = exports.UserController = class UserController {
    constructor(userService, authService, loggerService) {
        this.userService = userService;
        this.authService = authService;
        this.loggerService = loggerService;
    }
    async getUser(request) {
        try {
            const id = this.authService.getId();
            const user = await this.userService.getUser(id);
            return user;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'get_user_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async updateUser(payload, request) {
        try {
            const id = this.authService.getId();
            const updatedUser = await this.userService.updateUser(payload, id);
            return updatedUser;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'update_user_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async deleteUser(request) {
        try {
            const id = this.authService.getId();
            await this.userService.deleteUser(id);
            return;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'update_user_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
};
__decorate([
    (0, throttler_1.Throttle)(constant_1.GET_USER_REQUEST.LIMIT, constant_1.GET_USER_REQUEST.TTL),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.UseInterceptors)(new response_interceptor_1.ResponseInterceptor(UserShape_1.UserShape)),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.UPDATE_USER_REQUEST.LIMIT, constant_1.UPDATE_USER_REQUEST.TTL),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, auth_decorator_1.Active)(constant_1.Status.ACTIVE),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.UseInterceptors)(new response_interceptor_1.ResponseInterceptor(UserShape_1.UserShape)),
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_user_dto_1.UpdateUserDTO, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.DELETE_USER_REQUEST.LIMIT, constant_1.DELETE_USER_REQUEST.TTL),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService, auth_service_1.AuthService, logger_service_1.LoggerService])
], UserController);
//# sourceMappingURL=user.controller.js.map