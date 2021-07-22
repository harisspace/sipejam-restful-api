import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class DataTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const dataType = context.switchToWs().getData(); // e.g {vehicle: 33, iot_token: 'dfsfsfs'}

    const dataTypeRoles = this.reflector.get<string[]>(
      'data-type-roles',
      context.getHandler(),
    );

    // check data is contain base on data-type-roles
    for (const type of Object.keys(dataType)) {
      console.log(type);
      if (type === dataTypeRoles[0]) return true;
    }
    return false;
  }
}
