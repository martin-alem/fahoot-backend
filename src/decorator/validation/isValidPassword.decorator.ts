import { ValidationOptions, registerDecorator } from 'class-validator';

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,64}$/;
export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isValidPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && PWD_REGEX.test(value); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}
