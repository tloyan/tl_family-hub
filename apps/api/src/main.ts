import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  app.useLogger(app.get(Logger));

  app.enableCors({
    origin:
      process.env['NODE_ENV'] === 'production'
        ? (process.env['TRUSTED_ORIGINS']?.split(',') ?? [])
        : ['http://localhost:3000'],
    credentials: true,
  });

  const port = process.env['PORT'] ?? 4000;
  await app.listen(port);
}

void bootstrap();
