import { Injectable } from '@nestjs/common';
import { IAppConfig } from '../common/configs/app.config';
import { createFile, deleteFile, getFile } from 'src/common/utils/storage.util';
import { ConfigService } from '@nestjs/config';
import { ConfigNames } from '../common/types/enums/configNames.enum';
@Injectable()
export class StorageService {
  private readonly filePath: string;
  private readonly fileExt = 'txt';
  constructor(
      private readonly _configService: ConfigService,
  ) {
    this.filePath = this._configService.getOrThrow<IAppConfig>(ConfigNames.APP).storage_path;
  }

  async readInfo(id: string) {
    const fileName = `${id}.${this.fileExt}`;

    const info = await getFile(this.filePath, fileName);
    await deleteFile(this.filePath, fileName);
    return info;
  }

  async writeInfo(id: string, data: string) {
    const fileName = `${id}.${this.fileExt}`;

    await createFile(this.filePath, fileName, data);
  }
}
