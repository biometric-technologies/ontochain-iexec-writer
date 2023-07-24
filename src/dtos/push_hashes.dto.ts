import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsHash,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class InfoDto {
  @ApiProperty()
  @IsString()
  @IsHash('sha512')
  @IsNotEmpty()
  hash: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  loanId: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  timestamp: number;
}

export class PushInfoDto {
  @ApiProperty({ isArray: true, type: InfoDto })
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayMinSize(1)
  @ArrayUnique<InfoDto>((info) => info.hash)
  infos: InfoDto[];
}
