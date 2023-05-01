import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let allowedList = [];
if (process.env.ALLOW_LIST) allowedList = process.env.ALLOW_LIST.split(',');

if (allowedList.length === 0) allowedList.push('http://localhost:3000');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: allowedList,
  });

  await app.listen(process.env.PORT || 3002);
}
bootstrap();
