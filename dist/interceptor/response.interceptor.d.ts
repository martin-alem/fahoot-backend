import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
type ResponseShape = {
    [key: string]: boolean;
};
export declare class ResponseInterceptor<T extends {
    [key: string]: any;
}> implements NestInterceptor<T, ResponseShape> {
    private readonly responseShape;
    constructor(responseShape: ResponseShape);
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ResponseShape>;
    private transformData;
}
export {};
