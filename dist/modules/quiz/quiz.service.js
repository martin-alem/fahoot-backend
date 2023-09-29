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
const log_types_1 = require("./../../types/log.types");
const helper_1 = require("./../../utils/helper");
const mongoose_2 = require("@nestjs/mongoose");
const logger_service_1 = require("../logger/logger.service");
const transaction_manager_1 = require("../shared/transaction.manager");
const constant_1 = require("./../../utils/constant");
let QuizService = exports.QuizService = class QuizService {
    constructor(loggerService, quizModel, transactionManager) {
        this.loggerService = loggerService;
        this.quizModel = quizModel;
        this.transactionManager = transactionManager;
    }
    async createQuiz(payload, userId) {
        try {
            (0, helper_1.validateObjectId)(userId);
            const quiz = await this.quizModel.create({ ...payload, userId });
            if (!quiz)
                throw new common_1.InternalServerErrorException();
            return quiz;
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async getQuizById(quizId) {
        try {
            (0, helper_1.validateObjectId)(quizId);
            const quiz = await this.quizModel.findById(quizId);
            if (!quiz)
                throw new common_1.InternalServerErrorException();
            return quiz;
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async getQuizzes(userId, pagination) {
        try {
            (0, helper_1.validateObjectId)(userId);
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
            return { results, total: totalQuizzes, totalPages };
        }
        catch (error) {
            if (!(error instanceof common_1.InternalServerErrorException))
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async updateQuiz(quizId, userId, payload) {
        try {
            (0, helper_1.validateObjectId)(quizId);
            (0, helper_1.validateObjectId)(userId);
            const updatedQuiz = await this.quizModel.findOneAndUpdate({ _id: quizId, userId: userId }, payload, { new: true });
            if (!updatedQuiz)
                throw new common_1.BadRequestException('Unable to update quiz');
            return updatedQuiz;
        }
        catch (error) {
            console.log(error);
            this.loggerService.log(JSON.stringify({ event: 'error_updating_quiz', description: error.message, level: log_types_1.LEVEL.CRITICAL }));
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
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
            (0, helper_1.validateObjectId)(quizId);
            await this.transactionManager.startTransaction();
            await this.quizModel.findOneAndDelete({ id: quizId, userId: userId }, { session: session });
            await this.transactionManager.commitTransaction();
            return;
        }
        catch (error) {
            await this.transactionManager.abortTransaction();
            if (error instanceof common_1.BadRequestException)
                throw error;
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
        finally {
            await this.transactionManager.endSession();
        }
    }
    async deleteQuizzes(userId, quizId, ses) {
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
            await this.quizModel.deleteMany({ _id: { $in: quizId } }, { session: session });
            await this.transactionManager.commitTransaction();
            return;
        }
        catch (error) {
            await this.transactionManager.abortTransaction();
            if (error instanceof common_1.BadRequestException)
                throw error;
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
        }
        finally {
            await this.transactionManager.endSession();
        }
    }
    async deleteAllQuizzes(userId, ses) {
        try {
            (0, helper_1.validateObjectId)(userId);
            await this.quizModel.deleteMany({ userId: userId }, { session: ses });
            return;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException(error.message);
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