import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //?  Remueve todo lo que no está incluído en los DTOs
      forbidNonWhitelisted: true, //? Retorna bad request si hay propiedades en el objeto no requeridas
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Teslo Shop')
    .setDescription('Teslo Shop Backend')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
}
bootstrap();
