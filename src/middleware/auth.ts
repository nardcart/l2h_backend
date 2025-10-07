import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: false,
        message: 'No token provided',
      });
      return;
    }
    
    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload) {
      res.status(401).json({
        status: false,
        message: 'Invalid or expired token',
      });
      return;
    }
    
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      status: false,
      message: 'Authentication failed',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: false,
        message: 'Insufficient permissions',
      });
      return;
    }
    
    next();
  };
};

