"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationModule = void 0;
const common_1 = require("@nestjs/common");
const authentication_service_1 = require("./authentication.service");
const apikey_middleware_1 = require("../../middleware/apikey.middleware");
const authentication_controller_1 = require("./authentication.controller");
const user_module_1 = require("../user/user.module");
const security_module_1 = require("../security/security.module");
const logger_module_1 = require("../logger/logger.module");
const shared_module_1 = require("../shared/shared.module");
let AuthenticationModule = exports.AuthenticationModule = class AuthenticationModule {
    configure(consumer) {
        consumer.apply(apikey_middleware_1.APIKeyMiddleware).forRoutes(authentication_controller_1.AuthenticationController);
    }
};
exports.AuthenticationModule = AuthenticationModule = __decorate([
    (0, common_1.Module)({
        imports: [user_module_1.UserModule, security_module_1.SecurityModule, logger_module_1.LoggerModule, shared_module_1.SharedModule],
        providers: [authentication_service_1.AuthenticationService],
        controllers: [authentication_controller_1.AuthenticationController],
    })
], AuthenticationModule);
//# sourceMappingURL=authentication.module.js.map