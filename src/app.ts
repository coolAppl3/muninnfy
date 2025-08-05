import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import cors from 'cors';
import express, { Application } from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';

// other
import { rateLimiter } from './middleware/rateLimiter';
import { accountsRouter } from './routers/accountsRouter';

// router imports

export const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression({ threshold: 1024 }));
app.use(cookieParser());

// cors policy
if (process.env.NODE_ENV?.toLowerCase() === 'development') {
  const whitelist = ['http://localhost:3000', 'http://localhost:5000'];
  app.use(cors({ origin: whitelist, credentials: true }));
}

// CSP
app.use((req, res, next) => {
  res.set('Content-Security-Policy', `default-src 'self'; script-src 'self'; connect-src 'self';`);
  next();
});

// static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// rate limiter
app.use('/api/', rateLimiter);

// routes
app.use('/api/accounts', accountsRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
