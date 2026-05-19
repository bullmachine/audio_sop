import express from 'express';
import dotenv from 'dotenv';
import { router } from './routes/index.route';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import corsMiddleware from './middleware/cors.middleware';
// import { apiLimiter } from './middleware/rateLimit.middleware';
import path from 'path';
import { UPLOADS_ROOT } from './config/paths.config';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(corsMiddleware);
// app.use(apiLimiter);

app.set("trust proxy", 1);

const uploadsPath = UPLOADS_ROOT;

// Serve static uploads with headers so the SPA (different port) can play audio
app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(uploadsPath, {
    fallthrough: true,
    setHeaders(res) {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

//  Router configuration   
app.use('/api', router);

export default app;
