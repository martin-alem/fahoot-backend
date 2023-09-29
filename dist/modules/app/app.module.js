"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_module_1 = require("../user/user.module");
const authentication_module_1 = require("../authentication/authentication.module");
const security_module_1 = require("../security/security.module");
const notification_module_1 = require("../notification/notification.module");
const quiz_module_1 = require("../quiz/quiz.module");
const participation_module_1 = require("../participation/participation.module");
const analytics_module_1 = require("../analytics/analytics.module");
const logger_module_1 = require("../logger/logger.module");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const Joi = require("joi");
const mongoose_1 = require("@nestjs/mongoose");
const rabbitmq_module_1 = require("./../rabbitmq/rabbitmq.module");
const upload_module_1 = require("../upload/upload.module");
const constant_1 = require("./../../utils/constant");
let AppModule = exports.AppModule = class AppModule {
};
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot({
                ttl: 60,
                limit: 1000,
            }),
            user_module_1.UserModule,
            authentication_module_1.AuthenticationModule,
            security_module_1.SecurityModule,
            notification_module_1.NotificationModule,
            quiz_module_1.QuizModule,
            participation_module_1.ParticipationModule,
            analytics_module_1.AnalyticsModule,
            logger_module_1.LoggerModule,
            rabbitmq_module_1.RabbitMQModule,
            upload_module_1.UploadModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: Joi.object({
                    NODE_ENV: Joi.string().valid('development', 'production').default('development'),
                    DATABASE_URL: Joi.string().required(),
                    DATABASE_NAME: Joi.string().required(),
                    COOKIE_SECRET: Joi.string().required(),
                    PORT: Joi.number().default(3000),
                    HOST: Joi.string().default('localhost'),
                    HTTP_PROTOCOL: Joi.string().default('http'),
                    FRONTEND_URL: Joi.string().required(),
                    JWT_SECRET: Joi.string().required(),
                    JWT_TOKEN_AUDIENCE: Joi.string().required(),
                    JWT_TOKEN_ISSUER: Joi.string().required(),
                    RABBITMQ_URI: Joi.string().required(),
                    GMAIL_EMAIL: Joi.string().required(),
                    GMAIL_PASSWORD: Joi.string().required(),
                    CLIENT_API_KEY: Joi.string().required(),
                    VERIFY_EMAIL_URL: Joi.string().required(),
                    PASSWORD_RESET_URL: Joi.string().required(),
                    GOOGLE_CLIENT_KEY: Joi.string().required(),
                    GOOGLE_SECRET_KEY: Joi.string().required(),
                    SPACES_KEY: Joi.string().required(),
                    SPACES_SECRET: Joi.string().required(),
                    SPACES_BUCKET: Joi.string().required(),
                    SPACES_REGION: Joi.string().required(),
                    SPACES_ENDPOINT: Joi.string().required(),
                }),
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                connectionName: constant_1.DEFAULT_DATABASE_CONNECTION,
                useFactory: async (configService) => ({
                    uri: configService.get('DATABASE_URL'),
                    dbName: configService.get('DATABASE_NAME'),
                }),
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map