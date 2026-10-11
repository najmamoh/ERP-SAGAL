import 'reflect-metadata';
import { MetadataKeys } from './MetadataKeys';

export function queryValidator(...keys: string[]) {
  return function(target: any, key: string, desc: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKeys.queryValidator, keys, target, key);
  }
}

