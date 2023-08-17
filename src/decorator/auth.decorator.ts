import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/types/user.types';
import { Status } from 'src/utils/constant';

export const Role = (role: UserRole): CustomDecorator<string> => SetMetadata('role', role);

export const Active = (status: Status): CustomDecorator<string> => SetMetadata('status', status);
