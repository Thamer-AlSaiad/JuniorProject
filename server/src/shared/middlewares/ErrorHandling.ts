import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let stack = undefined;
  
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  
  if (process.env.NODE_ENV === 'development') {
    stack = err.stack;
  }
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(stack && { stack })
  });
};