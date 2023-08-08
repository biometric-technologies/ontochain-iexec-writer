import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AppService } from './services/app.service';
import { PushInfoDto } from './dtos/push_hashes.dto';
import { ApiExcludeEndpoint, ApiParam } from '@nestjs/swagger';
import { GetFileByNameDto } from './dtos/file.dto';
import { StorageService } from './services/storage.service';
import { BasicAuthGuard } from './services/basic-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly storageService: StorageService,
  ) {}

  @Post('hash')
  @UseGuards(BasicAuthGuard)
  async pushHashes(@Body() body: PushInfoDto) {
    return this.appService.pushHashes(body.infos);
  }

  @Get('file/:name')
  @ApiExcludeEndpoint()
  @ApiParam({ name: 'name', type: String })
  async getWorkerpools(@Param() body: GetFileByNameDto) {
    return this.storageService.readInfo(body.name);
  }
}
