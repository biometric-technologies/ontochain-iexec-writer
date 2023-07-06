import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IAppConfig } from './common/configs/app.config';
import { ConfigNames } from './common/types/enums/configNames.enum';
import { customExpectaionFactory } from './common/utils/customExpectationFactory';
import requestIp from 'request-ip';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: customExpectaionFactory,
    }),
  );

  app.use(requestIp.mw());

  app.enableCors({
    credentials: true,
    origin: true,
  });

  const configService = app.get(ConfigService);
  const config = configService.get<IAppConfig>(ConfigNames.APP);

  if (!config) {
    throw new Error('App config does not exists');
  }

  await app.listen(config.port);
}
bootstrap();
