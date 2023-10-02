"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResult = exports.generateRandomToken = exports.clearCookie = exports.setCookie = exports.log = exports.arrayLimitValidator = exports.validateObjectId = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const mongoose_1 = require("mongoose");
const log_types_1 = require("./../types/log.types");
const result_1 = require("../wrapper/result");
function validateObjectId(objectId) {
    if (!mongoose_1.Types.ObjectId.isValid(objectId)) {
        return new result_1.default(false, false, null, common_1.HttpStatus.BAD_REQUEST);
    }
    return new result_1.default(true, true, null, common_1.HttpStatus.OK);
}
exports.validateObjectId = validateObjectId;
function arrayLimitValidator(limit) {
    return function arrayLimit(val) {
        return val.length <= limit;
    };
}
exports.arrayLimitValidator = arrayLimitValidator;
function log(loggerService, event, description, request, level = log_types_1.LEVEL.CRITICAL) {
    loggerService.log(JSON.stringify({
        event: event,
        description,
        hostIP: request?.ip,
        hostName: request?.hostname,
        requestURI: request?.originalUrl,
        requestMethod: request?.method,
        userAgent: request?.get('user-agent'),
        level,
    }));
}
exports.log = log;
function setCookie(response, name, value, ttl, options = {}) {
    const defaultOptions = {
        secure: process.env.NODE_ENV === 'production' ? true : false,
        httpOnly: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: process.env.NODE_ENV === 'production' ? true : false,
        maxAge: ttl,
    };
    response.cookie(name, value, { ...defaultOptions, ...options });
}
exports.setCookie = setCookie;
function clearCookie(response, options = {}, ...names) {
    const defaultOptions = {
        secure: process.env.NODE_ENV === 'production' ? true : false,
        httpOnly: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: process.env.NODE_ENV === 'production' ? true : false,
        maxAge: 0,
    };
    for (const name of names) {
        response.cookie(name, '', { ...defaultOptions, ...options });
    }
}
exports.clearCookie = clearCookie;
function generateRandomToken() {
    const randomToken = crypto.randomBytes(64).toString('hex');
    return randomToken;
}
exports.generateRandomToken = generateRandomToken;
function handleResult(result) {
    if (!result.isSuccess() || result.getData() === null) {
        const errorMsg = result.getError() ?? 'An unknown error occurred';
        const errorCode = result.getErrorCode() ?? 500;
        throw new common_1.HttpException(errorMsg, errorCode);
    }
    return result.getData();
}
exports.handleResult = handleResult;
//# sourceMappingURL=helper.js.map