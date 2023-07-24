import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import { IAppConfig } from '../common/configs/app.config';
import { HASHES_SAVER_ABI } from '../common/contracts/ABIs/contractAbi';
import { ConfigNames } from '../common/types/enums/configNames.enum';
import { InfoDto } from '../dtos/push_hashes.dto';
import { StorageService } from './storage.service';
import { v4 as uuidv4 } from 'uuid';
import { globalPrefix } from 'src/common/constants/index';

@Injectable()
export class AppService {
  private readonly appConfig: IAppConfig;
  constructor(
    private readonly _configService: ConfigService,
    private readonly _storageService: StorageService,
  ) {
    this.appConfig = this._configService.getOrThrow<IAppConfig>(
      ConfigNames.APP,
    );
  }

  async pushHashes(hashes: InfoDto[]) {
    const iexec = await import('iexec');
    const {
      app_owner_private_key: privateKey,
      rpc_url,
      iexec_app_address: appAddress,
    } = this.appConfig;

    const signer = iexec.utils.getSignerFromPrivateKey(rpc_url, privateKey);

    const category = 0;

    const inst = new iexec.IExec({
      ethProvider: signer,
    });

    const userAddress = await inst.wallet.getAddress();
    //use locally for deploy app
    //DEPLOY APP
    // const { address } = await inst.app.deployApp({
    //   owner: userAddress,
    //   name: 'info-saver-v1.0.6',
    //   type: 'DOCKER',
    //   multiaddr: 'docker.io/kykycb/info-saver:1.0.6',
    //   checksum:
    //     '0x133169c7dc512a71d8f02ceed1dd6cd380c9d03e413776a7f2f231561d23636e',
    // });
    // return { message: `app deployed to ${address}` };
    //
    const transaction = await this._prepareSignedTx(hashes);

    if (!transaction) {
      throw new BadRequestException(`Hashes already pushed`);
    }

    const fileName = uuidv4();

    await this._storageService.writeInfo(fileName, transaction);

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

    const iexecSupportWorkerpool = '0x0e7bc972c99187c191a17f3cae4a2711a4188c3f';

    const { orders: workerpoolOrders } =
      await inst.orderbook.fetchWorkerpoolOrderbook({
        category,
        workerpool: iexecSupportWorkerpool,
      });

    const workerpoolOrder =
      workerpoolOrders && workerpoolOrders[0] && workerpoolOrders[0].order;

    if (!workerpoolOrder) {
      throw new BadRequestException(
        `no workerpoolorder found for category ${category}`,
      );
    }

    const callLink = `${this.appConfig.origin_url}/${globalPrefix}/file/${fileName}`;

    const requestOrderToSign = await inst.order.createRequestorder({
      app: appAddress,
      appmaxprice: appOrder.appprice,
      workerpoolmaxprice: workerpoolOrder.workerpoolprice,
      requester: userAddress,
      volume: 1,
      params: {
        iexec_args: `${rpc_url} ${callLink}`,
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

  async getWorkerpools() {
    const iexec = await import('iexec');
    const { app_owner_private_key: privateKey, rpc_url } = this.appConfig;

    const signer = iexec.utils.getSignerFromPrivateKey(rpc_url, privateKey);

    const inst = new iexec.IExec({
      ethProvider: signer,
    });

    const { orders: workerpoolOrders } =
      await inst.orderbook.fetchWorkerpoolOrderbook({ category: 3 });

    return {
      message: 'success',
      data: JSON.parse(JSON.stringify(workerpoolOrders)),
    };
  }

  async getTaskInfo(id: string) {
    const iexec = await import('iexec');
    const { app_owner_private_key: privateKey, rpc_url } = this.appConfig;

    const signer = iexec.utils.getSignerFromPrivateKey(rpc_url, privateKey);

    const inst = new iexec.IExec({
      ethProvider: signer,
    });

    const info = await inst.task.obsTask(id);

    await new Promise<void>((res, rej) => {
      info.subscribe({
        next: console.log,
        error: (e) => {
          console.log(e);
          rej();
        },
        complete: () => {
          console.log('completed');
          res();
        },
      });
    });

    return {
      message: 'success',
    };
  }

  private async _prepareSignedTx(infos: InfoDto[]) {
    const {
      contract_owner_private_key: privateKey,
      rpc_url,
      hashes_saver_contract_address: contractAddress,
    } = this.appConfig;

    const provider = new JsonRpcProvider(rpc_url);
    const wallet = new Wallet(privateKey, provider);

    const contract = new Contract(contractAddress, HASHES_SAVER_ABI, wallet);

    const checkedHashes = await Promise.all(
      infos.map(async (info) => {
        try {
          const data = await contract.getHashInfo(info.hash);
          if (data) {
            return null;
          } else {
            return info;
          }
        } catch (error) {
          return info;
        }
      }),
    );

    // filter only not pushed hashes
    const validHashes = checkedHashes
      .filter((info): info is InfoDto => !!info)
      //need to send touple [hash, timestamp, loanId]
      .map((item) => {
        return [item.hash, item.timestamp, String(item.loanId)];
      });

    if (validHashes.length) {
      const resultTx = await contract.saveHashes.populateTransaction(
        validHashes,
      );
      const populatedTx = await wallet.populateTransaction(resultTx);
      const signedTx = await wallet.signTransaction(populatedTx);
      return signedTx;
    }

    return null;
  }
}
