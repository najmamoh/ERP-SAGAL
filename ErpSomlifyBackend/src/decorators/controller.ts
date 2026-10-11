import 'reflect-metadata';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppRouter } from '../AppRouter';
import { Methods } from './Methods';
import { MetadataKeys } from './MetadataKeys';
import { prisma } from '../prisma';

interface LengthValidator {
  length: number,
  keys: string[]
}
interface UniqueValidator {
  tableName: string,
  keys: []
}

interface ExistanceValidator {
  tableName: string,
  key: string
}

function bodyValidator(keys: string[]): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    if (!req.body) {
      return res.status(422).send({ message: 'Invalid request' });
    }

    if (Array.isArray(req.body)) {
      // when request body is array (mulitple records)
      const records = req.body;
      for (let idx = 0; idx < records.length; idx++) {
        const record = records[idx];
        for (let key of keys) {
          if (record[key] === undefined) {
            res.status(422).send({
              message: `Missing '${key}' in one of your request record. index: ${idx}`
            });
            return;
          }
        }
      }
    } else {
      // when request body is a single object (record)
      for (let key of keys) {
        if (req.body[key] === undefined) {
          res.status(422).send({
            message: `Missing '${key}' in your request`
          });
          return;
        }
      }
    }
    next()
  }
}

function queryValidator(keys: string[]): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    for (let key of keys) {
      if (req.query[key] === undefined) {
        res.status(422).send({
          message: `Missing '${key}' query in your request`
        });
        return;
      }
    }
    next();
  }
}

function lengthValidator (props: LengthValidator) {
  return function(req: Request, res: Response, next: NextFunction) {
    if (!req.body) {
      return res.status(422).send({ message: 'Invalid request' })
    }
    
    if (Array.isArray(req.body)) {
      const records = req.body;
      for (let idx = 0; idx < records.length; idx++) {
        const record = records[idx];
        for (const key of props.keys) {
          if (record[key].length > props.length) {
            return res.status(422).send({ message: `${key} must be ${props.length} characters long or less. index: ${idx}` })
          }
        } 
      }
    } else {
      for (const key of props.keys) {
        if (req.body[key].length > props.length) {
          return res.status(422).send({
            message: `${key} must be ${props.length} characters long or less`
          })
        }
      }
    }
    next();
  }
}

function uniqueValidator(props: UniqueValidator) {
  return async function(req: Request, res: Response, next: NextFunction) {
    if (!req.body) {
      return res.status(422).send({ message: 'Invalid request' })
    }

    for (const key of props.keys) {
      const row: {}[] = await prisma.$queryRawUnsafe(`SELECT * FROM ${props.tableName} WHERE ${key}='${req.body[key]}'`)
      if (row.length > 0) {
        return res.status(422).send({ message: `that ${key} is taken. Try another one.` })
      }
    }
    next();
  }
}

function existanceValidator (props: ExistanceValidator) {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (!req.body) {
      return res.status(422).send({ message: 'Invalid request' })
    }

    if (props.tableName) {
      const row: {}[] = await prisma.$queryRawUnsafe(`SELECT * FROM ${props.tableName} WHERE ${props.key}='${req.body[props.key]}'`)
      if (row.length === 0) {
        return res.status(404).send({ message: `404 ${props.key} was not found.` })
      }
    }
    next()
  }
}

export function controller(routePrefix: string) {
  return function(target: Function) {
    const router = AppRouter.getIntance();
    Object.getOwnPropertyNames(target.prototype).forEach(key => {
      const routeHandler = target.prototype[key];
      const path = Reflect.getMetadata(
        MetadataKeys.path,
        target.prototype,
        key
      )

      const method: Methods = Reflect.getMetadata(
        MetadataKeys.method,
        target.prototype,
        key
      )

      const middlewares = Reflect.getMetadata(MetadataKeys.middleware, target.prototype, key) || [];

      const requiredBodyProps = Reflect.getMetadata(
        MetadataKeys.bodyValidator,
        target.prototype,
        key
      ) || [];
      const validateBody = bodyValidator(requiredBodyProps);

      const requiredQueryProps = Reflect.getMetadata(
        MetadataKeys.queryValidator,
        target.prototype,
        key
      ) || [];
      const validateQuery = queryValidator(requiredQueryProps);
      
      const requiredLengthProps = Reflect.getMetadata(
        MetadataKeys.lengthValidator,
        target.prototype,
        key
      ) || { length: 0, keys: [] };
      const validateLength = lengthValidator(requiredLengthProps);

      const requiredUniqeProps = Reflect.getMetadata(
        MetadataKeys.uniqueValidator,
        target.prototype,
        key
      ) || { tableName: '', keys: [] }
      const validateUnique = uniqueValidator(requiredUniqeProps);

      const requiredExistanceProps = Reflect.getMetadata(
        MetadataKeys.existanceValidator,
        target.prototype,
        key
      ) || { tableName: '', key: '' }
      const validateExistance = existanceValidator(requiredExistanceProps);
  
      if (path) {
        router[method](
          `${routePrefix}${path}`,
          validateBody,
          validateQuery,
          validateLength,
          validateUnique,
          validateExistance,
          ...middlewares,
          routeHandler
        )
      }
    })
  }
}
