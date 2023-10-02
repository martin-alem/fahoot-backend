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
const result_1 = require("../../wrapper/result");
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
                return new result_1.default(false, null, `User ${payload.emailAddress} already exist`, common_1.HttpStatus.BAD_REQUEST);
            let hashedPassword = null;
            let hashedPasswordData = null;
            if (payload.password) {
                hashedPassword = await this.securityService.hash(payload.password);
                hashedPasswordData = hashedPassword.getData();
                if (!hashedPasswordData)
                    return new result_1.default(false, null, 'Unable to hash password', common_1.HttpStatus.BAD_REQUEST);
            }
            const user = await this.userModel.create([{ ...payload, password: hashedPasswordData }], { session: session });
            return new result_1.default(true, user[0], null, common_1.HttpStatus.CREATED);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUser(userId) {
        try {
            const isValidObjectId = (0, helper_1.validateObjectId)(userId);
            if (!isValidObjectId.getData())
                return new result_1.default(false, null, `Invalid objectId: ${userId}`, common_1.HttpStatus.BAD_REQUEST);
            const user = await this.userModel.findById(userId);
            if (!user)
                return new result_1.default(false, null, `User ${userId} not found`, common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, user, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findByEmailAddress(emailAddress) {
        try {
            const user = await this.userModel.findOne({ emailAddress });
            if (!user)
                return new result_1.default(false, null, `User with ${emailAddress} not found`, common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, user, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateUser(payload, userId, session) {
        try {
            const isValidObjectId = (0, helper_1.validateObjectId)(userId);
            if (!isValidObjectId.getData())
                return new result_1.default(false, null, `Invalid objectId: ${userId}`, common_1.HttpStatus.BAD_REQUEST);
            const updatedUser = await this.userModel.findByIdAndUpdate(userId, payload, { new: true, session: session });
            if (!updatedUser)
                return new result_1.default(false, null, 'unable to update user', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, updatedUser, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateSensitiveData(payload, emailAddress, session) {
        try {
            const updatedUser = await this.userModel.findOneAndUpdate({ emailAddress: emailAddress }, payload, { new: true, session: session });
            if (!updatedUser)
                return new result_1.default(false, null, 'Unable to update sensitive data', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, null, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteUser(userId) {
        try {
            const session = await this.transactionManager.startSession();
            const isValidObjectId = (0, helper_1.validateObjectId)(userId);
            if (!isValidObjectId.getData()) {
                await this.transactionManager.abortTransaction();
                return new result_1.default(false, null, `Invalid objectId: ${userId}`, common_1.HttpStatus.BAD_REQUEST);
            }
            await this.transactionManager.startTransaction();
            const deletedUser = await this.userModel.findByIdAndDelete(userId, { session: session });
            if (!deletedUser) {
                await this.transactionManager.abortTransaction();
                return new result_1.default(false, null, `Could not delete user`, common_1.HttpStatus.BAD_REQUEST);
            }
            const deleteQuizzes = await this.quizService.deleteAllQuizzes(userId, session);
            if (!deleteQuizzes.isSuccess()) {
                await this.transactionManager.abortTransaction();
                return new result_1.default(false, null, `Could not delete user quizzes`, common_1.HttpStatus.BAD_REQUEST);
            }
            await this.transactionManager.commitTransaction();
            return new result_1.default(true, deletedUser, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            await this.transactionManager.abortTransaction();
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
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