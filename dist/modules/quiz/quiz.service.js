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
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const quiz_schema_1 = require("./schema/quiz.schema");
const mongoose_1 = require("mongoose");
const helper_1 = require("./../../utils/helper");
const mongoose_2 = require("@nestjs/mongoose");
const logger_service_1 = require("../logger/logger.service");
const transaction_manager_1 = require("../shared/transaction.manager");
const constant_1 = require("./../../utils/constant");
const result_1 = require("../../wrapper/result");
let QuizService = exports.QuizService = class QuizService {
    constructor(loggerService, quizModel, transactionManager) {
        this.loggerService = loggerService;
        this.quizModel = quizModel;
        this.transactionManager = transactionManager;
    }
    async createQuiz(payload, userId) {
        try {
            const isValidObjectId = (0, helper_1.validateObjectId)(userId);
            if (!isValidObjectId.getData())
                return new result_1.default(false, null, `Invalid user objectId: ${userId}`, common_1.HttpStatus.BAD_REQUEST);
            const quiz = await this.quizModel.create({ ...payload, userId });
            if (!quiz)
                return new result_1.default(false, null, 'Unable to create quiz', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, quiz, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getQuizById(quizId) {
        try {
            const isValidObjectId = (0, helper_1.validateObjectId)(quizId);
            if (!isValidObjectId.getData())
                return new result_1.default(false, null, `Invalid quiz objectId: ${quizId}`, common_1.HttpStatus.BAD_REQUEST);
            const quiz = await this.quizModel.findById(quizId);
            if (!quiz)
                return new result_1.default(false, null, 'Quiz not found', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, quiz, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getQuizzes(userId, pagination) {
        try {
            const isValidObjectId = (0, helper_1.validateObjectId)(userId);
            if (!isValidObjectId.getData())
                return new result_1.default(false, null, `Invalid user objectId: ${userId}`, common_1.HttpStatus.BAD_REQUEST);
            const { page, pageSize, query } = pagination;
            const skip = (page == 0 ? 0 : page - 1) * pageSize;
            const sortField = pagination.sortField ?? 'published';
            const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1;
            const totalQuizzes = await this.quizModel.countDocuments({
                userId: userId,
                status: sortField,
                title: { $regex: query ? query : '', $options: 'i' },
            });
            const totalPages = Math.ceil(totalQuizzes / pageSize);
            const results = await this.quizModel
                .find({ userId: userId, status: sortField })
                .where('title')
                .regex(new RegExp(query ? query : '', 'i'))
                .sort({ createdAt: sortOrder })
                .skip(skip)
                .limit(pageSize)
                .exec();
            return new result_1.default(true, { results, total: totalQuizzes, totalPages }, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateQuiz(quizId, userId, payload) {
        try {
            const isValidQuizObjectId = (0, helper_1.validateObjectId)(userId);
            if (!isValidQuizObjectId.getData())
                return new result_1.default(false, null, `Invalid quiz objectId: ${quizId}`, common_1.HttpStatus.BAD_REQUEST);
            const isValidUserObjectId = (0, helper_1.validateObjectId)(userId);
            if (!isValidUserObjectId.getData())
                return new result_1.default(false, null, `Invalid user objectId: ${userId}`, common_1.HttpStatus.BAD_REQUEST);
            const updatedQuiz = await this.quizModel.findOneAndUpdate({ _id: quizId, userId: userId }, payload, { new: true });
            if (!updatedQuiz)
                return new result_1.default(false, null, `Unable to update quiz`, common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, updatedQuiz, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteQuiz(quizId, userId, ses) {
        let session = null;
        try {
            if (ses) {
                session = ses;
            }
            else {
                session = await this.transactionManager.startSession();
            }
            const isValidQuizObjectId = (0, helper_1.validateObjectId)(userId);
            if (!isValidQuizObjectId.getData())
                return new result_1.default(false, null, `Invalid quiz objectId: ${quizId}`, common_1.HttpStatus.BAD_REQUEST);
            await this.transactionManager.startTransaction();
            const result = await this.quizModel.findOneAndDelete({ id: quizId, userId: userId }, { session: session });
            if (!result) {
                await this.transactionManager.abortTransaction();
                return new result_1.default(false, null, 'Unable to delete quiz', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.transactionManager.commitTransaction();
            return new result_1.default(true, result, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            await this.transactionManager.abortTransaction();
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        finally {
            await this.transactionManager.endSession();
        }
    }
    async deleteAllQuizzes(userId, session) {
        try {
            const isValidUserObjectId = (0, helper_1.validateObjectId)(userId);
            if (!isValidUserObjectId.getData())
                return new result_1.default(false, null, `Invalid user objectId: ${userId}`, common_1.HttpStatus.BAD_REQUEST);
            const result = await this.quizModel.deleteMany({ userId: userId }, { session: session });
            if (!result)
                return new result_1.default(false, null, 'Unable to delete quizzes', common_1.HttpStatus.BAD_REQUEST);
            return new result_1.default(true, true, null, common_1.HttpStatus.OK);
        }
        catch (error) {
            return new result_1.default(false, null, error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_2.InjectModel)(quiz_schema_1.Quiz.name, constant_1.DEFAULT_DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [logger_service_1.LoggerService,
        mongoose_1.Model,
        transaction_manager_1.TransactionManager])
], QuizService);
//# sourceMappingURL=quiz.service.js.map