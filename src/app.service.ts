import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
// import { IExec, utils } from 'iexec';
// import { utils, IExec } from 'iexec';
@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    const iexec = await import('iexec');
    const wallet = ethers.Wallet.createRandom();
    const { privateKey } = wallet;
    const signer = iexec.utils.getSignerFromPrivateKey(
      'https://bellecour.iex.ec',
      privateKey,
    );

    const inst = new iexec.IExec({
      ethProvider: signer,
    });

    const appAddress = '0x307C30bD6364f76eb27B218F1f2cdbd36Cf3A16B';
    const app = await inst.app.showApp(appAddress);

    const signedOrder = await inst.order.signApporder(
      await inst.order.createApporder({
        app: appAddress,
        appprice: 0,
        volume: 1,
      }),
    );
    const orderHash = await inst.order.publishApporder(signedOrder);
    console.log({ orderHash });

    const { orders: appOrders } = await inst.orderbook.fetchAppOrderbook(
      appAddress,
    );

    const appOrder = appOrders && appOrders[0] && appOrders[0].order;
    if (!appOrder) {
      return `no apporder found for app ${appAddress}`;
    }
    const { orders: workerpoolOrders } =
      await inst.orderbook.fetchWorkerpoolOrderbook({
        category: 0,
      });
    const workerpoolOrder =
      workerpoolOrders && workerpoolOrders[0] && workerpoolOrders[0].order;
    if (!workerpoolOrder) {
      return `no workerpoolorder found for category ${0}`;
    }

    const userAddress = await inst.wallet.getAddress();

    const requestOrderToSign = await inst.order.createRequestorder({
      app: appAddress,
      appmaxprice: appOrder.appprice,
      workerpoolmaxprice: workerpoolOrder.workerpoolprice,
      requester: userAddress,
      volume: 1,
      params: { iexec_args: 'one, two' },
      category: 0,
    });

    const requestOrder = await inst.order.signRequestorder(requestOrderToSign);

    const res = await inst.order.matchOrders({
      apporder: appOrder,
      requestorder: requestOrder,
      workerpoolorder: workerpoolOrder,
    });
    console.log({ app, res });

    // result.stdout?.on('data', console.log);
    return 'Hello World!';
  }
}
