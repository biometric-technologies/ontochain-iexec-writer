import { registerAs } from '@nestjs/config';
import { ConfigNames } from '../types/enums/configNames.enum';

export interface IAppConfig {
  port: number;
  bcryptSalt: number;
  isDev: boolean;
  isProd: boolean;
  isDevMode: boolean;
}

export default registerAs(ConfigNames.APP, () => {
  const port = process.env.PORT ? +process.env.PORT : 5001;
  const isProd = process.env.NODE_ENV === 'production';
  const devMode = !!process.env.DEV_MODE;

  const config: IAppConfig = {
    port: port,
    bcryptSalt: 4,
    isDev: !isProd,
    isProd: isProd,
    isDevMode: devMode,
  };
  return config;
});
