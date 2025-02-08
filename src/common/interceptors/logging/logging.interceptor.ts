import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;

    this.logger.log(
      `Incoming ${method} request to ${url} with body: ${JSON.stringify(body)}`,
    );

    return next
      .handle()
      .pipe(
        tap(() => this.logger.log(`Response from ${url} sent successfully.`)),
      );
  }
}
