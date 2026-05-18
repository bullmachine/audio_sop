import express from 'express';
import dotenv from 'dotenv';
import { router } from './routes/index.route';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import corsMiddleware from './middleware/cors.middleware';
// import { apiLimiter } from './middleware/rateLimit.middleware';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(corsMiddleware);
// app.use(apiLimiter);

app.set("trust proxy", 1);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

//  Router configuration   
app.use('/api', router);

export default app;
