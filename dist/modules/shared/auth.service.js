"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
let AuthService = exports.AuthService = class AuthService {
    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
    setStatus(status) {
        this.status = status;
    }
    getStatus() {
        return this.status;
    }
    setRole(role) {
        this.role = role;
    }
    getRole() {
        return this.role;
    }
    setUserAgent(userAgent) {
        this.userAgent = userAgent;
    }
    getUserAgent() {
        return this.userAgent;
    }
    setIpAddress(ipAddress) {
        this.ipAddress = ipAddress;
    }
    getIpAddress() {
        return this.ipAddress;
    }
    setMethod(method) {
        this.method = method;
    }
    getMethod() {
        return this.method;
    }
    setPath(path) {
        this.path = path;
    }
    getPath() {
        return this.path;
    }
    setHostName(hostName) {
        this.hostName = hostName;
    }
    getHostName() {
        return this.hostName;
    }
    setOriginalUrl(originalUrl) {
        this.originalUrl = originalUrl;
    }
    getOriginalUrl() {
        return this.originalUrl;
    }
};
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST })
], AuthService);
//# sourceMappingURL=auth.service.js.map