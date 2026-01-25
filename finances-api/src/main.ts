import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow multiple development origins and make it configurable via env var `CORS_ORIGINS`.
  // Example: CORS_ORIGINS='http://localhost:5173,http://localhost:5174'
  const allowedOrigins = (
    process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:5174'
  )
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server requests or tools like curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Finanças Pessoais API')
    .setDescription('API para gerenciamento de finanças pessoais')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
  });
  SwaggerModule.setup('docs', app, document);

  // Redirect root to docs (useful when `api` global prefix is set)
  try {
    const serverAny = app.getHttpAdapter().getInstance() as { get?: (path: string, handler: (req: unknown, res: { redirect: (url: string) => void }) => void) => void };
    // Express adapter
    if (serverAny && typeof serverAny.get === 'function') {
      serverAny.get('/', (_req: unknown, res: { redirect: (url: string) => void }) => res.redirect('/docs'));
    }
  } catch (err) {
    // ignore adapters where `getInstance()` is not available
    console.warn(
      'Could not register root redirect (non-express adapter):',
      err,
    );
  }

  await app.listen(process.env.PORT ?? 3333);

  console.log(`🚀 Server running on http://localhost:3333`);
  console.log(`📚 Swagger docs: http://localhost:3333/docs`);
}

void bootstrap();
