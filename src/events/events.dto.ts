import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSpeed1Dto {
  @IsNotEmpty()
  @IsString()
  iot_token: string;

  @IsNotEmpty()
  speed: number;
}
export class CreateSpeed2Dto {
  @IsNotEmpty()
  @IsString()
  iot_token: string;

  @IsNotEmpty()
  speed: number;
}
export class CreateVehicle1Dto {
  @IsNotEmpty()
  @IsString()
  iot_token: string;

  @IsNotEmpty()
  vehicle: number;
}
export class CreateVehicle2Dto {
  @IsNotEmpty()
  @IsString()
  iot_token: string;

  @IsNotEmpty()
  vehicle: number;
}
