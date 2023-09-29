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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const user_schema_1 = require("./schema/user.schema");
const mongoose_1 = require("mongoose");
const security_service_1 = require("./../security/security.service");
const mongoose_2 = require("@nestjs/mongoose");
const constant_1 = require("./../../utils/constant");
const helper_1 = require("./../../utils/helper");
const transaction_manager_1 = require("../shared/transaction.manager");
const quiz_service_1 = require("../quiz/quiz.service");
let UserService = exports.UserService = class UserService {
    constructor(securityService, userModel, transactionManager, quizService) {
        this.securityService = securityService;
        this.userModel = userModel;
        this.transactionManager = transactionManager;
        this.quizService = quizService;
    }
    async createUser(payload, session) {
        try {
            const userExist = await this.userModel.findOne({ emailAddress: payload.emailAddress });
            if (userExist)
                throw new common_1.BadRequestException(`User ${payload.emailAddress} already exist`);
            let hashedPassword = null;
            if (payload.password) {
                hashedPassword = await this.securityService.hash(payload.password);
            }
            const user = await this.userModel.create([{ ...payload, password: hashedPassword }], { session: session });
            return user[0];
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException(constant_1.ErrorMessages.INTERNAL_ERROR);
        }
    }
    async getUser(userId) {
        try {
            (0, helper_1.validateObjectId)(userId);
            const user = await this.userModel.findById(userId);
            if (!user)
                throw new common_1.NotFoundException(`User ${userId} not found`);
            return user;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException(constant_1.ErrorMessages.INTERNAL_ERROR);
        }
    }
    async findByEmailAddress(emailAddress) {
        try {
            const user = await this.userModel.findOne({ emailAddress });
            if (!user)
                throw new common_1.BadRequestException(constant_1.ErrorMessages.USER_NOT_FOUND);
            return user;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException(constant_1.ErrorMessages.INTERNAL_ERROR);
        }
    }
    async updateUser(payload, userId, session) {
        try {
            (0, helper_1.validateObjectId)(userId);
            const updatedUser = await this.userModel.findByIdAndUpdate(userId, payload, { new: true, session: session });
            if (!updatedUser)
                throw new common_1.BadRequestException('Unable to update user');
            return updatedUser;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException(constant_1.ErrorMessages.INTERNAL_ERROR);
        }
    }
    async updateSensitiveData(payload, emailAddress, session) {
        try {
            const updatedUser = await this.userModel.findOneAndUpdate({ emailAddress: emailAddress }, payload, { new: true, session: session });
            if (!updatedUser)
                throw new common_1.BadRequestException('Unable to update user');
            return;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException(constant_1.ErrorMessages.INTERNAL_ERROR);
        }
    }
    async deleteUser(userId, ses) {
        let session = null;
        try {
            if (ses) {
                session = ses;
            }
            else {
                session = await this.transactionManager.startSession();
            }
            (0, helper_1.validateObjectId)(userId);
            await this.transactionManager.startTransaction();
            await this.userModel.findByIdAndDelete(userId, { session: session });
            await this.quizService.deleteAllQuizzes(userId, session);
            await this.transactionManager.commitTransaction();
            return;
        }
        catch (error) {
            await this.transactionManager.abortTransaction();
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(constant_1.ErrorMessages.INTERNAL_ERROR);
        }
        finally {
            await this.transactionManager.endSession();
        }
    }
};
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_2.InjectModel)(user_schema_1.User.name, constant_1.DEFAULT_DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [security_service_1.SecurityService,
        mongoose_1.Model,
        transaction_manager_1.TransactionManager,
        quiz_service_1.QuizService])
], UserService);
//# sourceMappingURL=user.service.js.map