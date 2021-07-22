import { SetMetadata } from '@nestjs/common';

export const DataTypeRoles = (...roles: string[]) =>
  SetMetadata('data-type-roles', roles);
