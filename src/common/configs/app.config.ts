import { registerAs } from '@nestjs/config';
import { ConfigNames } from '../types/enums/configNames.enum';

export interface IAppConfig {
  port: number;
  app_owner_private_key: string;
  contract_owner_private_key: string;
  rpc_url: string;
  origin_url: string;
  iexec_app_address: string;
  hashes_saver_contract_address: string;
}

export default registerAs(ConfigNames.APP, () => {
  const port = process.env.PORT ? +process.env.PORT : 5001;
  const app_owner_private_key = process.env.APP_OWNER_PRIVATE_KEY;
  const contract_owner_private_key = process.env.CONTRACT_OWNER_PRIVATE_KEY;
  const rpc_url = process.env.RPC_URL;
  const origin_url = process.env.ORIGIN_URL;
  const iexec_app_address = process.env.IEXEC_APP_ADDRESS;
  const hashes_saver_contract_address = process.env.HASH_SAVER_CONTRACT_ADDRESS;
  if (
    !app_owner_private_key ||
    !contract_owner_private_key ||
    !rpc_url ||
    !origin_url ||
    !iexec_app_address ||
    !hashes_saver_contract_address
  ) {
    throw new Error('Failed to get ENV variables');
  }

  const config: IAppConfig = {
    port: port,
    app_owner_private_key,
    contract_owner_private_key,
    rpc_url,
    origin_url,
    iexec_app_address,
    hashes_saver_contract_address,
  };
  return config;
});
