import { ValidatorOptions, ValidationError } from 'class-validator';

// export interface ValidationPipeOptions extends ValidatorOptions {
//   transform?: boolean;
//   forbidUnknownValues?: boolean;
//   exceptionFactory?: (errors: ValidationError[]) => any;
// }
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}
