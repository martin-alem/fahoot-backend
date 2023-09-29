"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const helmet_1 = require("helmet");
const common_1 = require("@nestjs/common");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./modules/app/app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.use(cookieParser(process.env.COOKIE_SECRET));
    app.enableCors({
        origin: function (origin, callback) {
            const allowedOrigins = ['http://localhost:8000', 'https://fahoot.com', 'https://www.fahoot.com'];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new common_1.InternalServerErrorException('Not allowed by CORS'));
            }
        },
        credentials: true,
        allowedHeaders: ['Access-Control-Allow-Origin', 'Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        disableErrorMessages: process.env.NODE_ENV === 'production' ? true : false,
    }));
    const config = new swagger_1.DocumentBuilder().setTitle('Fahoot API').setDescription('Fahoot API documentation').setVersion('1.0').addTag('Fahoot').build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(3000);
}
bootstrap().catch((error) => console.error(error));
//# sourceMappingURL=main.js.map