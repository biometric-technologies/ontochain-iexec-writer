import { Injectable } from '@nestjs/common';
import { createFile, deleteFile, getFile } from 'src/common/utils/storage.util';
@Injectable()
export class StorageService {
  private readonly filePath = 'storage';
  private readonly fileExt = 'txt';

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
