import { Request, Response, NextFunction } from 'express';

export const validateReportParams = (req: Request, res: Response, next: NextFunction): void => {
  const { start_date, end_date } = req.query;
  
  if (!start_date || !end_date) {
    res.status(400).json({ message: 'Missing required query parameters: start_date, end_date' });
    return;
  }

  const startDate = new Date(start_date as string);
  const endDate = new Date(end_date as string);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    res.status(400).json({ message: 'Invalid date format' });
    return;
  }

  next();
};