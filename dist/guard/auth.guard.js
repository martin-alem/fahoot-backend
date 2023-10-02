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
exports.AuthorizationGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const auth_service_1 = require("./../modules/shared/auth.service");
let AuthorizationGuard = exports.AuthorizationGuard = class AuthorizationGuard {
    constructor(authService, reflector) {
        this.authService = authService;
        this.reflector = reflector;
    }
    canActivate(context) {
        const role = this.reflector.get('role', context.getHandler());
        const status = this.reflector.get('status', context.getHandler());
        if (!role && !status)
            return true;
        else if (role && !status)
            return this.authService.getRole() == role;
        else if (this.authService.getRole() == role && this.authService.getStatus() == status)
            return true;
        throw new common_1.UnauthorizedException('Unauthorized access');
    }
};
exports.AuthorizationGuard = AuthorizationGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService, core_1.Reflector])
], AuthorizationGuard);
//# sourceMappingURL=auth.guard.js.map