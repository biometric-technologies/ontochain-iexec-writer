import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IAppConfig } from './common/configs/app.config';
import { ConfigNames } from './common/types/enums/configNames.enum';
import { customExpectaionFactory } from './common/utils/customExpectationFactory';
import requestIp from 'request-ip';
import { setupSwagger } from './common/utils/setupSwagger';
import { globalPrefix } from './common/constants/index';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(globalPrefix);

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

  setupSwagger(app);

  const configService = app.get(ConfigService);
  const config = configService.get<IAppConfig>(ConfigNames.APP);

  if (!config) {
    throw new Error('App config does not exists');
  }

  await app.listen(config.port);
}
bootstrap();
