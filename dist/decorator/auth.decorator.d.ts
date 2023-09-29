import { CustomDecorator } from '@nestjs/common';
import { UserRole } from './../types/user.types';
import { Status } from './../utils/constant';
export declare const Role: (role: UserRole) => CustomDecorator<string>;
export declare const Active: (status: Status) => CustomDecorator<string>;
