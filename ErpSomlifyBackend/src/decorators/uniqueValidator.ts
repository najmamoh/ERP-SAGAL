import 'reflect-metadata';
import { MetadataKeys } from './MetadataKeys';

export function uniqueValidator(tableName: string, ...keys: string[]) {
  return function(target: any, key: string, desc: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKeys.uniqueValidator, {tableName, keys}, target, key);
  }
}
