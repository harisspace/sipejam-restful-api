import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSystemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  placed: string;

  @IsNotEmpty()
  @IsString()
  system_maker: string;
}

export class UpdateSystemDto {
  name?: string;
  placed?: string;
}

export class RequestToBeAdminDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  from_uid: string;

  @IsNotEmpty()
  @IsString()
  to_uid: string;

  @IsNotEmpty()
  @IsString()
  payload: string;
}

export class AddAdminDto {
  @IsNotEmpty()
  @IsString()
  user_uid: string;

  @IsNotEmpty()
  @IsString()
  system_uid: string;
}
