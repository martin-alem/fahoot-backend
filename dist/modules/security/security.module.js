"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const security_service_1 = require("./security.service");
const security_controller_1 = require("./security.controller");
const tokens_schema_1 = require("./schema/tokens.schema");
const mongoose_1 = require("@nestjs/mongoose");
const user_module_1 = require("./../user/user.module");
const jwt_1 = require("@nestjs/jwt");
const shared_module_1 = require("./../shared/shared.module");
const apikey_middleware_1 = require("./../../middleware/apikey.middleware");
const auth_middleware_1 = require("./../../middleware/auth.middleware");
const constant_1 = require("./../../utils/constant");
let SecurityModule = exports.SecurityModule = class SecurityModule {
    configure(consumer) {
        consumer.apply(apikey_middleware_1.APIKeyMiddleware).forRoutes(security_controller_1.SecurityController);
        consumer
            .apply(auth_middleware_1.AuthenticationMiddleware)
            .forRoutes({ path: 'security/update_password', method: common_1.RequestMethod.POST }, { path: 'security/update_email', method: common_1.RequestMethod.POST });
    }
};
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: tokens_schema_1.Token.name, schema: tokens_schema_1.TokenSchema }], constant_1.DEFAULT_DATABASE_CONNECTION),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
            }),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            shared_module_1.SharedModule,
        ],
        providers: [security_service_1.SecurityService],
        controllers: [security_controller_1.SecurityController],
        exports: [security_service_1.SecurityService],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map