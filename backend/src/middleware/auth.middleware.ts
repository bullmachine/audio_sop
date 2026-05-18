import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { verifyAccessToken } from '../utils/token';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;  
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
