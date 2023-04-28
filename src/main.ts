import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // if (process.env.NODE_ENV === 'development')
  app.enableCors({
    allowedHeaders: ['content-type'],
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  await app.listen(3002);
}
bootstrap();
