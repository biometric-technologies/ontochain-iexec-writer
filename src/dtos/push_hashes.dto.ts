import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsHash, IsString } from 'class-validator';

export class PushHashesDto {
  @ApiProperty({ isArray: true, type: String })
  @IsArray()
  @IsString({ each: true })
  @IsHash('sha512', { each: true })
  @ArrayUnique()
  hashes: string[];
}
