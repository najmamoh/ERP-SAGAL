import { Request, Response, NextFunction } from 'express';

export const requestMustBeArray = (req: Request, res: Response, next: NextFunction) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).send({ message: 'req body must be array' });
  }

  next();
}