import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already in the Response format, just return it
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return data;
        }

        let meta = undefined;
        let message = undefined;
        let actualData = data;

        // Extract meta/message if returned from controller in a wrapped way
        if (data && typeof data === 'object' && ('_meta' in data || '_message' in data)) {
          meta = data._meta;
          message = data._message;
          delete data._meta;
          delete data._message;
          actualData = data.data !== undefined ? data.data : data;
        }

        return {
          success: true,
          data: actualData,
          message,
          meta,
        };
      }),
    );
  }
}
