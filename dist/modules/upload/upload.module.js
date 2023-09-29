"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadModule = void 0;
const common_1 = require("@nestjs/common");
const upload_controller_1 = require("./upload.controller");
const update_service_1 = require("./update.service");
const apikey_middleware_1 = require("./../../middleware/apikey.middleware");
const auth_middleware_1 = require("./../../middleware/auth.middleware");
const shared_module_1 = require("../shared/shared.module");
const security_module_1 = require("../security/security.module");
const user_module_1 = require("../user/user.module");
let UploadModule = exports.UploadModule = class UploadModule {
    configure(consumer) {
        consumer.apply(apikey_middleware_1.APIKeyMiddleware, auth_middleware_1.AuthenticationMiddleware).forRoutes(upload_controller_1.UploadController);
    }
};
exports.UploadModule = UploadModule = __decorate([
    (0, common_1.Module)({
        imports: [shared_module_1.SharedModule, security_module_1.SecurityModule, user_module_1.UserModule],
        controllers: [upload_controller_1.UploadController],
        providers: [update_service_1.UploadService],
        exports: [update_service_1.UploadService],
    })
], UploadModule);
//# sourceMappingURL=upload.module.js.map