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
exports.QuizController = void 0;
const common_1 = require("@nestjs/common");
const quiz_service_1 = require("./quiz.service");
const throttler_1 = require("@nestjs/throttler");
const constant_1 = require("./../../utils/constant");
const auth_decorator_1 = require("./../../decorator/auth.decorator");
const user_types_1 = require("./../../types/user.types");
const auth_guard_1 = require("./../../guard/auth.guard");
const create_quiz_dto_1 = require("./dto/create_quiz.dto");
const auth_service_1 = require("../shared/auth.service");
const logger_service_1 = require("../logger/logger.service");
const log_types_1 = require("./../../types/log.types");
const helper_1 = require("./../../utils/helper");
let QuizController = exports.QuizController = class QuizController {
    constructor(quizService, authService, loggerService) {
        this.quizService = quizService;
        this.authService = authService;
        this.loggerService = loggerService;
    }
    async createQuiz(payload, request) {
        try {
            const userId = this.authService.getId();
            const quiz = await this.quizService.createQuiz(payload, userId);
            return quiz;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'create_quiz_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async getQuiz(quizId, request) {
        try {
            const quiz = await this.quizService.getQuizById(quizId);
            return quiz;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'get_quiz_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async getQuizzes(page, query, pageSize, sortField, sortOrder, request) {
        try {
            const pagination = { page: page, query: query, pageSize: pageSize, sortOrder: sortOrder, sortField: sortField };
            const userId = this.authService.getId();
            const quizzes = await this.quizService.getQuizzes(userId, pagination);
            return quizzes;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'get_quizzes_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async updateQuiz(quizId, payload, request) {
        try {
            const userId = this.authService.getId();
            const updatedQuiz = await this.quizService.updateQuiz(quizId, userId, payload);
            return updatedQuiz;
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'update_quiz_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async deleteQuiz(quizId, request) {
        try {
            const userId = this.authService.getId();
            return await this.quizService.deleteQuiz(quizId, userId);
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'delete_one_quiz_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
    async deleteAllQuizzes(quizId, request) {
        try {
            const userId = this.authService.getId();
            const ids = quizId.split(',');
            return await this.quizService.deleteQuizzes(userId, ids);
        }
        catch (error) {
            (0, helper_1.log)(this.loggerService, 'delete_many_quizzes_error', error.message, request, log_types_1.LEVEL.CRITICAL);
            throw error;
        }
    }
};
__decorate([
    (0, throttler_1.Throttle)(constant_1.CREATE_QUIZ_REQUEST.LIMIT, constant_1.CREATE_QUIZ_REQUEST.TTL),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, auth_decorator_1.Active)(constant_1.Status.ACTIVE),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_quiz_dto_1.CreateQuizDTO, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "createQuiz", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.GET_QUIZ_REQUEST.LIMIT, constant_1.GET_QUIZ_REQUEST.TTL),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, auth_decorator_1.Active)(constant_1.Status.ACTIVE),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.Get)(':quizId'),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "getQuiz", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.GET_QUIZZES_REQUEST.LIMIT, constant_1.GET_QUIZZES_REQUEST.TTL),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, auth_decorator_1.Active)(constant_1.Status.ACTIVE),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('query')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('sortField')),
    __param(4, (0, common_1.Query)('sortOrder')),
    __param(5, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "getQuizzes", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.UPDATE_QUIZ_REQUEST.LIMIT, constant_1.UPDATE_QUIZ_REQUEST.TTL),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, auth_decorator_1.Active)(constant_1.Status.ACTIVE),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.Put)(':quizId'),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "updateQuiz", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.DELETE_QUIZ_REQUEST.LIMIT, constant_1.DELETE_QUIZ_REQUEST.TTL),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, auth_decorator_1.Active)(constant_1.Status.ACTIVE),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.Delete)(':quizId'),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "deleteQuiz", null);
__decorate([
    (0, throttler_1.Throttle)(constant_1.DELETE_QUIZ_REQUEST.LIMIT, constant_1.DELETE_QUIZ_REQUEST.TTL),
    (0, auth_decorator_1.Role)(user_types_1.UserRole.USER),
    (0, auth_decorator_1.Active)(constant_1.Status.ACTIVE),
    (0, common_1.UseGuards)(auth_guard_1.AuthorizationGuard),
    (0, common_1.Delete)('/quizzes'),
    __param(0, (0, common_1.Query)('quizId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "deleteAllQuizzes", null);
exports.QuizController = QuizController = __decorate([
    (0, common_1.Controller)('quiz'),
    __metadata("design:paramtypes", [quiz_service_1.QuizService, auth_service_1.AuthService, logger_service_1.LoggerService])
], QuizController);
//# sourceMappingURL=quiz.controller.js.map