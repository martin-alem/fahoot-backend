import { LEVEL } from 'src/types/log.types';
export declare class FilterDTO {
    event?: string;
    level?: LEVEL;
    hostIP?: string;
    hostName?: string;
    requestMethod?: string;
    createdAt?: Date;
}
