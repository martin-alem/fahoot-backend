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
exports.AuthenticationMiddleware = void 0;
const common_1 = require("@nestjs/common");
const security_service_1 = require("./../modules/security/security.service");
const auth_service_1 = require("./../modules/shared/auth.service");
const user_service_1 = require("./../modules/user/user.service");
let AuthenticationMiddleware = exports.AuthenticationMiddleware = class AuthenticationMiddleware {
    constructor(securityService, userService, authService) {
        this.securityService = securityService;
        this.userService = userService;
        this.authService = authService;
    }
    async use(req, res, next) {
        try {
            const tokenCookie = req.cookies['_access_token'];
            if (!tokenCookie) {
                throw new common_1.UnauthorizedException('Access token not found');
            }
            const decodedPayload = await this.securityService.validateToken(tokenCookie);
            const decodedPayloadData = decodedPayload.getData();
            if (!decodedPayloadData)
                throw new common_1.BadRequestException('Unable to decode token');
            const user = await this.userService.getUser(decodedPayloadData.id);
            const userData = user.getData();
            if (!userData) {
                throw new common_1.BadRequestException(`User ${decodedPayloadData.id} not found`);
            }
            this.authService.setId(decodedPayloadData.id);
            this.authService.setStatus(userData.status);
            this.authService.setRole(decodedPayloadData.role);
            next();
        }
        catch (error) {
            throw error;
        }
    }
};
exports.AuthenticationMiddleware = AuthenticationMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [security_service_1.SecurityService, user_service_1.UserService, auth_service_1.AuthService])
], AuthenticationMiddleware);
//# sourceMappingURL=auth.middleware.js.map