import { ApiProperty } from '@nestjs/swagger';

export class GetTaskInfoDto {
  @ApiProperty()
  taskId: string;
}
