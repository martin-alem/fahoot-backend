/* eslint-disable @typescript-eslint/no-explicit-any */
import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  message?: string;
  [key: string]: any; // This allows for other properties
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = (exception instanceof HttpException ? exception.getResponse() : 'Internal Server Error Martin') as ErrorResponse;
    const message = errorResponse.message ?? errorResponse;

    response.status(httpStatus).json({
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      message: message,
      path: request.url,
      method: request.method,
    });
  }
}
