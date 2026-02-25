import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { setDefaultResultOrder } from 'dns';
import express from 'express';
import helmet from 'helmet';
import serverless from 'serverless-http';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './middleware/exception.filter';

const expressApp = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setDefaultResultOrder('ipv4first');
  const configService = app.get(ConfigService);
  const isProd = configService.get('NODE_ENV') === 'production';
  const apiPrefix = configService.get<string>('API_PREFIX') ?? '/api';
  const port = configService.get<string>('PORT') ?? '3000';
  const origins =
    configService.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000';

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: origins.split(','),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const error = errors[0];
        const constraints = error.constraints;
        let message: string = 'Validation failed';
        if (constraints) {
          message = constraints[Object.keys(constraints)[0]];
        }
        return new BadRequestException(message);
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter());
  app.useLogger(isProd ? ['error'] : ['log', 'error']);
  app.use(helmet());
  app.use(cookieParser());

  await app.listen(parseInt(port), () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
bootstrap().catch((err) => console.log(err));

export const handler = serverless(expressApp);
