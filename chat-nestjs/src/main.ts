import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeormStore } from 'connect-typeorm/out';
import { Session } from './utils/typeorm';
import * as session from 'express-session';
import * as passport from 'passport';
import { getRepository } from 'typeorm';
import { WebsocketAdapter } from './gateway/gateway.adapter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { getCorsOrigins } from './utils/cors';

async function bootstrap() {
  const { PORT, COOKIE_SECRET, ENVIRONMENT } = process.env;
  const isProduction = ENVIRONMENT === 'PRODUCTION';

  if (!COOKIE_SECRET) throw new Error('COOKIE_SECRET chưa được đặt.');
  // Giá trị mẫu ký được cookie phiên bất kỳ. Chỉ chặn ở production để lệnh
  // quickstart `cp .env.example .env && docker compose up` vẫn chạy được.
  if (isProduction && COOKIE_SECRET.startsWith('change-me'))
    throw new Error(
      'COOKIE_SECRET còn giá trị mẫu. Sinh chuỗi ngẫu nhiên: openssl rand -base64 48',
    );

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const sessionRepository = getRepository(Session);
  const adapter = new WebsocketAdapter(app);
  app.useWebSocketAdapter(adapter);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: getCorsOrigins(), credentials: true });
  app.useGlobalPipes(new ValidationPipe());
  // Production đứng sau reverse proxy: 'loopback' làm req.ips rỗng nên
  // ThrottlerBehindProxyGuard gộp mọi người dùng vào chung một hạn mức.
  app.set('trust proxy', isProduction ? 1 : 'loopback');
  app.use(
    session({
      secret: COOKIE_SECRET,
      saveUninitialized: false,
      resave: false,
      name: 'CHAT_APP_SESSION_ID',
      cookie: {
        maxAge: 86400000, // cookie expires 1 day later
        httpOnly: true,
        // SPA khác origin với API, nên production cần SameSite=None — mà
        // trình duyệt chỉ nhận None khi đi kèm Secure.
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const config = new DocumentBuilder()
    .setTitle('Zalo-web-clone')
    .setDescription('The zalo-web-clone API description')
    .setVersion('1.0')
    .addTag('chat')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  try {
    await app.listen(PORT, () => {
      console.log(`Running on Port ${PORT}`);
      // console.log(
      //   `Running in ${process.env.ENVIRONMENT} mode: ${process.env.ENVIRONMENT_MESSAGE}`,
      // );
    });
  } catch (err) {
    console.log(err);
  }
}
bootstrap();
