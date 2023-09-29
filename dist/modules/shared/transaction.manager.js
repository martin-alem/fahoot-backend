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
exports.TransactionManager = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const constant_1 = require("./../../utils/constant");
let TransactionManager = exports.TransactionManager = class TransactionManager {
    constructor(connection) {
        this.connection = connection;
    }
    async startSession() {
        this.session = await this.connection.startSession();
        return this.session;
    }
    async startTransaction() {
        this.session.startTransaction();
    }
    async commitTransaction() {
        await this.session.commitTransaction();
    }
    async endSession() {
        await this.session.endSession();
    }
    async abortTransaction() {
        await this.session.abortTransaction();
    }
    getSession() {
        return this.session;
    }
};
exports.TransactionManager = TransactionManager = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)(constant_1.DEFAULT_DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [mongoose_2.Connection])
], TransactionManager);
//# sourceMappingURL=transaction.manager.js.map