import rateLimit from "express-rate-limit";
import { Request } from "express";

// Helper function to get client IP from various headers
const getClientIP = (req: Request): string => {
  // Check common proxy headers in order of preference
  const forwardedFor = req.headers['x-forwarded-for'] as string;
  if (forwardedFor) {
    // Take the first IP if it's a comma-separated list
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = req.headers['x-real-ip'] as string;
  if (realIP) {
    return realIP.trim();
  }

  const cfConnectingIP = req.headers['cf-connecting-ip'] as string;
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  // Fallback to req.ip (set by express trust proxy)
  return req.ip || '127.0.0.1';
};

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // max 60 requests per minute
  message: "Too many requests, please try again later.",
  keyGenerator: getClientIP,
  skip: (req: Request) => {
    return req.path === '/api/auth/refresh' || req.path === '/auth/refresh';
  },
});

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 15, // max 5 login attempts per window
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIP,
  skip: (req: Request) => {
    // Skip rate limiting for refresh token endpoints
    return req.path === '/api/auth/refresh' || req.path === '/auth/refresh';
  },
});
