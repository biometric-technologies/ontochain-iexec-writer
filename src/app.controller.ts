import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PushHashesDto } from './dtos/push_hashes.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('hash')
  async pushHashes(@Body() body: PushHashesDto) {
    return this.appService.pushHashes(body.hashes);
  }
}
