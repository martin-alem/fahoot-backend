"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidPassword = void 0;
const class_validator_1 = require("class-validator");
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,64}$/;
function IsValidPassword(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isValidPassword',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    return typeof value === 'string' && PWD_REGEX.test(value);
                },
            },
        });
    };
}
exports.IsValidPassword = IsValidPassword;
//# sourceMappingURL=isValidPassword.decorator.js.map