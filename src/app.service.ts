import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAppConfig } from './common/configs/app.config';
import { ConfigNames } from './common/types/enums/configNames.enum';
@Injectable()
export class AppService {
  constructor(private readonly _configService: ConfigService) {}

  async pushHashes(hashes: string[]) {
    const iexec = await import('iexec');
    const appConfig = this._configService.getOrThrow<IAppConfig>(
      ConfigNames.APP,
    );

    const {
      walletPrivateKey: privateKey,
      rpc_url,
      iexec_app_address: appAddress,
      hashes_saver_contract_address: contractAddress,
    } = appConfig;

    const category = 0;

    const signer = iexec.utils.getSignerFromPrivateKey(rpc_url, privateKey);

    const inst = new iexec.IExec({
      ethProvider: signer,
    });
    const userAddress = await inst.wallet.getAddress();

    //use locally for deploy app
    //DEPLOY APP
    // const { address } = await inst.app.deployApp({
    //   owner: userAddress,
    //   name: 'hashes-saver',
    //   type: 'DOCKER',
    //   multiaddr: 'docker.io/kykycb/hashes-saver:1.0.0',
    //   checksum:
    //     '0x0993ed1d9df76bee652100681622ed135e6ec6b402d3ea968f074b32f7922b9e',
    // });
    // return { message: `app deployed to ${address}` };
    //

    let { orders } = await inst.orderbook.fetchAppOrderbook(appAddress);

    if (!orders || !orders.length) {
      const order = await inst.order.createApporder({
        app: appAddress,
        appprice: 0,
        volume: 1,
      });
      const signedOrder = await inst.order.signApporder(order);
      await inst.order.publishApporder(signedOrder);

      const newRes = await inst.orderbook.fetchAppOrderbook(appAddress);

      if (!newRes || !newRes.orders?.length) {
        throw new BadRequestException(
          `No apporder found for app ${appAddress}`,
        );
      }

      orders = newRes.orders;
    }
    const appOrder = orders && orders[0] && orders[0].order;

    const { orders: workerpoolOrders } =
      await inst.orderbook.fetchWorkerpoolOrderbook({
        category,
      });

    const workerpoolOrder =
      workerpoolOrders && workerpoolOrders[0] && workerpoolOrders[0].order;

    if (!workerpoolOrder) {
      throw new BadRequestException(
        `no workerpoolorder found for category ${category}`,
      );
    }

    const requestOrderToSign = await inst.order.createRequestorder({
      app: appAddress,
      appmaxprice: appOrder.appprice,
      workerpoolmaxprice: workerpoolOrder.workerpoolprice,
      requester: userAddress,
      volume: 1,
      params: {
        iexec_args: `${privateKey} ${rpc_url} ${contractAddress} ${hashes.join(
          ' ',
        )}`,
      },
      category,
    });

    // const isStorageInitialized = await inst.storage.checkStorageTokenExists(
    //   userAddress,
    // );

    //needs to update every time
    //token can expire
    const storageToken = await inst.storage.defaultStorageLogin();
    await inst.storage.pushStorageToken(storageToken, {
      forceUpdate: true,
      // teeFramework: 'gramine',
    });

    //need for tee framework
    // const isExistsSecret = await inst.secrets.checkRequesterSecretExists(
    //   userAddress,
    //   'secret_one',
    //   { teeFramework: 'gramine' },
    // );
    // if (isExistsSecret) {
    //   await inst.secrets.pushRequesterSecret('secret_one', `i'm secret word`, {
    //     teeFramework: 'gramine',
    //   });
    // }

    const requestOrder = await inst.order.signRequestorder(requestOrderToSign);

    await inst.order.matchOrders({
      apporder: appOrder,
      requestorder: requestOrder,
      workerpoolorder: workerpoolOrder,
    });

    return { status: 'Success', message: 'Hashes pushed successfully' };
  }
}
