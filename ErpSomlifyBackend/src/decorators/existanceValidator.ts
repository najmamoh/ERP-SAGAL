import 'reflect-metadata';
import { MetadataKeys } from './MetadataKeys';

export function existanceValidator(tableName: string, column: string) {
  return function(target: any, key: string, desc: PropertyDescriptor) {
    Reflect.defineMetadata(MetadataKeys.existanceValidator, { tableName, key: column}, target, key)
  } 
}