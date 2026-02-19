import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  app.useLogger(app.get(Logger));

  // Re-enable body parsing for all routes except /api/auth/*
  // Better Auth's toNodeHandler needs the raw request stream unparsed
  const jsonParser = express.json();
  const urlencodedParser = express.urlencoded({ extended: true });

  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.originalUrl.startsWith('/api/auth')) {
      next();
      return;
    }
    jsonParser(req, res, (err?: unknown) => {
      if (err) {
        next(err);
        return;
      }
      urlencodedParser(req, res, next);
    });
  });

  const port = process.env['PORT'] ?? 4000;
  await app.listen(port);
}

void bootstrap();
