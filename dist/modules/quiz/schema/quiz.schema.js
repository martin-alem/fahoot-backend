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
exports.QuizSchema = exports.Quiz = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const question_schemaType_1 = require("./question.schemaType");
const setting_schemaType_1 = require("./setting.schemaType");
const helper_1 = require("./../../../utils/helper");
const constant_1 = require("./../../../utils/constant");
let Quiz = exports.Quiz = class Quiz {
};
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, lowercase: true }),
    __metadata("design:type", String)
], Quiz.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.ObjectId, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Quiz.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: constant_1.QuizStatus, required: false, default: constant_1.QuizStatus.DRAFT }),
    __metadata("design:type", String)
], Quiz.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [question_schemaType_1.QuestionSchema], required: true, validate: [(0, helper_1.arrayLimitValidator)(constant_1.MAX_QUESTION_PER_QUIZ)] }),
    __metadata("design:type", Array)
], Quiz.prototype, "questions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: setting_schemaType_1.SettingSchema, required: true }),
    __metadata("design:type", setting_schemaType_1.Settings)
], Quiz.prototype, "settings", void 0);
exports.Quiz = Quiz = __decorate([
    (0, mongoose_1.Schema)({ autoCreate: true, collection: 'quizzes', timestamps: true })
], Quiz);
exports.QuizSchema = mongoose_1.SchemaFactory.createForClass(Quiz);
//# sourceMappingURL=quiz.schema.js.map