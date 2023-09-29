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
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const user_types_1 = require("../../../types/user.types");
const constant_1 = require("../../../utils/constant");
let User = exports.User = class User {
};
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, lowercase: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, lowercase: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, unique: true, lowercase: true }),
    __metadata("design:type", String)
], User.prototype, "emailAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false, default: null }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: constant_1.AuthenticationMethod, required: true }),
    __metadata("design:type", String)
], User.prototype, "authenticationMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false, default: null }),
    __metadata("design:type", String)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, required: false, default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "verified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false, enum: constant_1.Status, default: constant_1.Status.INACTIVE }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false, enum: user_types_1.UserRole, default: user_types_1.UserRole.USER }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ autoCreate: true, collection: constant_1.CollectName.USER, timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
//# sourceMappingURL=user.schema.js.map