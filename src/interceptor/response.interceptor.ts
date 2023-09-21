/* eslint-disable @typescript-eslint/no-explicit-any */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type ResponseShape = { [key: string]: boolean };

@Injectable()
export class ResponseInterceptor<T extends { [key: string]: any }> implements NestInterceptor<T, ResponseShape> {
  private readonly responseShape: ResponseShape;

  constructor(responseShape: ResponseShape) {
    this.responseShape = responseShape;
  }

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ResponseShape> {
    return next.handle().pipe(map((data: T) => this.transformData(data)));
  }

  private transformData(data: T): ResponseShape {
    const shapedData: ResponseShape = {};
    const dataObj = data.toObject();
    for (const key of Object.keys(this.responseShape)) {
      if (dataObj.hasOwnProperty(key)) {
        shapedData[key] = dataObj[key];
      }
    }
    return shapedData;
  }
}
