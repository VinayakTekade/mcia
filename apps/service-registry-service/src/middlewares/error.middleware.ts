import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation Error', details: err.errors });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error('[Registry Service Error]', err);

  res.status(status).json({
    error: {
      message,
      status
    }
  });
};
