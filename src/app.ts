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
import { authRouter } from './routers/authRouter';
import { wishlistsRouter } from './routers/wishlistsRouter';
import { wishlistItemsRouter } from './routers/wishlistItemsRouter';
import { wishlistItemTagsRouter } from './routers/wishlistItemTagsRouter';

// router imports

export const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression({ threshold: 1024 }));
app.use(cookieParser());

// cors policy
if (process.env.NODE_ENV?.toLowerCase() === 'development') {
  app.use(
    cors({
      origin: (origin: string | undefined, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          return callback(null, true);
        }

        if (/^http:\/\/192\.168\.0\.\d{2}:(3000|5000)$/.test(origin)) {
          return callback(null, true);
        }

        return callback(null, false);
      },
      credentials: true,
    })
  );
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
app.use('/api/auth', authRouter);
app.use('/api/wishlists', wishlistsRouter);
app.use('/api/wishlistItems', wishlistItemsRouter);
app.use('/api/wishlistItemTags', wishlistItemTagsRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
