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
exports.APIKeyMiddleware = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./../modules/shared/auth.service");
let APIKeyMiddleware = exports.APIKeyMiddleware = class APIKeyMiddleware {
    constructor(configService, authService) {
        this.configService = configService;
        this.authService = authService;
    }
    use(req, res, next) {
        const authorizationHeader = req.headers['authorization'] ?? null;
        if (!authorizationHeader)
            throw new common_1.ForbiddenException('No authorization header');
        const apiKey = authorizationHeader.split(' ')[1];
        if (!apiKey)
            throw new common_1.ForbiddenException('No API key');
        if (apiKey !== this.configService.get('CLIENT_API_KEY'))
            throw new common_1.ForbiddenException('Invalid API key');
        this.authService.setUserAgent(req.get('user-agent') ?? '');
        this.authService.setIpAddress(req.ip);
        this.authService.setPath(req.path);
        this.authService.setHostName(req.hostname);
        this.authService.setOriginalUrl(req.originalUrl);
        next();
    }
};
exports.APIKeyMiddleware = APIKeyMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, auth_service_1.AuthService])
], APIKeyMiddleware);
//# sourceMappingURL=apikey.middleware.js.map