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
exports.QuestionSchema = exports.Question = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const option_schemaType_1 = require("./option.schemaType");
const helper_1 = require("./../../../utils/helper");
const constant_1 = require("./../../../utils/constant");
let Question = exports.Question = class Question {
};
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, lowercase: true }),
    __metadata("design:type", String)
], Question.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: constant_1.QuestionType, required: true }),
    __metadata("design:type", String)
], Question.prototype, "questionType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [option_schemaType_1.OptionSchema], required: true, validate: [(0, helper_1.arrayLimitValidator)(constant_1.MAX_QUESTION_PER_QUIZ)] }),
    __metadata("design:type", Array)
], Question.prototype, "options", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], Question.prototype, "duration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], Question.prototype, "points", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false, default: null }),
    __metadata("design:type", String)
], Question.prototype, "mediaUrl", void 0);
exports.Question = Question = __decorate([
    (0, mongoose_1.Schema)()
], Question);
exports.QuestionSchema = mongoose_1.SchemaFactory.createForClass(Question);
//# sourceMappingURL=question.schemaType.js.map