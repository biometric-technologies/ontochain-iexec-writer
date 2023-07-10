import { registerAs } from '@nestjs/config';
import { ConfigNames } from '../types/enums/configNames.enum';

export interface IAppConfig {
  port: number;
  walletPrivateKey: string;
  rpc_url: string;
  iexec_app_address: string;
  hashes_saver_contract_address: string;
}

export default registerAs(ConfigNames.APP, () => {
  const port = process.env.PORT ? +process.env.PORT : 5001;
  const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;
  const rpc_url = process.env.RPC_URL;
  const iexec_app_address = process.env.IEXEC_APP_ADDRESS;
  const hashes_saver_contract_address = process.env.HASH_SAVER_CONTRACT_ADDRESS;
  if (
    !walletPrivateKey ||
    !rpc_url ||
    !iexec_app_address ||
    !hashes_saver_contract_address
  ) {
    throw new Error('Failed to get ENV variables');
  }

  const config: IAppConfig = {
    port: port,
    walletPrivateKey,
    rpc_url,
    iexec_app_address,
    hashes_saver_contract_address,
  };
  return config;
});
