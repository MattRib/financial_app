/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
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
    const serverAny = (app.getHttpAdapter() as any).getInstance();
    // Express adapter
    if (serverAny && typeof serverAny.get === 'function') {
      serverAny.get('/', (_req: any, res: any) => res.redirect('/docs'));
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
