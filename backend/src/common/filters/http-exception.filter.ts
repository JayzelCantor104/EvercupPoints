import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

// mysql errors that we return as 409
const DB_RULES: Record<string, string> = {
  ER_DUP_ENTRY: 'That value is already in use. It may have just been saved by another request.',
  ER_ROW_IS_REFERENCED_2: 'This record is still referenced by other records, so it cannot be deleted.',
  ER_CHECK_CONSTRAINT_VIOLATED: 'That change would break a data rule (for example a negative points balance).',
};

// same error format for every error (standard error response from lab 05)
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'An unexpected error occurred.';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, any>;
        const raw = b.message;
        if (Array.isArray(raw)) {
          // class-validator returns an array of messages
          message = 'Validation failed.';
          errors = raw;
        } else if (typeof raw === 'string') {
          message = raw;
        }
      }
    }

    // db constraint errors -> 409 instead of 500
    if (exception instanceof QueryFailedError) {
      const known = DB_RULES[(exception as any).driverError?.code];
      if (known) {
        status = HttpStatus.CONFLICT;
        message = known;
      }
    }

    if (errors.length === 0) {
      errors = [message];
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
