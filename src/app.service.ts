import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAppConfig } from './common/configs/app.config';
import { ConfigNames } from './common/types/enums/configNames.enum';
@Injectable()
export class AppService {
  constructor(private readonly _configService: ConfigService) {}

  async getHello() {
    const iexec = await import('iexec');
    const appConfig = this._configService.getOrThrow<IAppConfig>(
      ConfigNames.APP,
    );

    const {
      walletPrivateKey: privateKey,
      rpc_url,
      iexec_app_address: appAddress,
    } = appConfig;

    const category = 0;

    const signer = iexec.utils.getSignerFromPrivateKey(rpc_url, privateKey);

    const inst = new iexec.IExec({
      ethProvider: signer,
    });

    //
    const app = await inst.app.showApp(appAddress);

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

    const userAddress = await inst.wallet.getAddress();

    const requestOrderToSign = await inst.order.createRequestorder({
      app: appAddress,
      appmaxprice: appOrder.appprice,
      workerpoolmaxprice: workerpoolOrder.workerpoolprice,
      requester: userAddress,
      volume: 1,
      params: { iexec_args: 'hello world' },
      category,
    });

    const isStorageInitialized = await inst.storage.checkStorageTokenExists(
      userAddress,
    );

    if (!isStorageInitialized) {
      const storageToken = await inst.storage.defaultStorageLogin();
      const pushResult = await inst.storage.pushStorageToken(storageToken, {
        forceUpdate: true,
      });
      console.log({ storageToken, pushResult });
    }

    console.log({
      appOrder,
      workerpoolOrder,
      requestOrderToSign,
      isStorageInitialized,
    });

    const requestOrder = await inst.order.signRequestorder(requestOrderToSign);

    const res = await inst.order.matchOrders({
      apporder: appOrder,
      requestorder: requestOrder,
      workerpoolorder: workerpoolOrder,
    });
    console.log({ app, res });

    return { status: 'Success', message: 'Hello World!' };
  }
}
