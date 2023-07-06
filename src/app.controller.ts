import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello() {
    return this.appService.getHello();
  }

  @Get('/hello')
  async getHelloBlockchain(
    @Query() body: { message: string },
  ): Promise<string> {
    console.log({ status: 'success', message: body.message });
    return 'OK';
  }
}
