import 'reflect-metadata';
import { MetadataKeys } from './MetadataKeys';

export function lengthValidator(length: number, ...keys: string[]) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKeys.lengthValidator, { length, keys}, target, key);
  }
}