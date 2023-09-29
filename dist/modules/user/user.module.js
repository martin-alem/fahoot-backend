"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const user_schema_1 = require("./schema/user.schema");
const mongoose_1 = require("@nestjs/mongoose");
const security_module_1 = require("./../security/security.module");
const user_controller_1 = require("./user.controller");
const shared_module_1 = require("./../shared/shared.module");
const apikey_middleware_1 = require("./../../middleware/apikey.middleware");
const auth_middleware_1 = require("./../../middleware/auth.middleware");
const constant_1 = require("./../../utils/constant");
const quiz_module_1 = require("../quiz/quiz.module");
let UserModule = exports.UserModule = class UserModule {
    configure(consumer) {
        consumer.apply(apikey_middleware_1.APIKeyMiddleware, auth_middleware_1.AuthenticationMiddleware).forRoutes(user_controller_1.UserController);
    }
};
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }], constant_1.DEFAULT_DATABASE_CONNECTION),
            (0, common_1.forwardRef)(() => security_module_1.SecurityModule),
            (0, common_1.forwardRef)(() => quiz_module_1.QuizModule),
            shared_module_1.SharedModule,
        ],
        providers: [user_service_1.UserService],
        exports: [user_service_1.UserService],
        controllers: [user_controller_1.UserController],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map