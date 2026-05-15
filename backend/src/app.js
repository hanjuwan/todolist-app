'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require(path.resolve(__dirname, '../../swagger/swagger.json'));
const env = require('./config/env');
const { requestLogger } = require('./middlewares/request-logger.middleware');
const authRouter = require('./modules/auth/auth.router');
const usersRouter = require('./modules/users/users.router');
const categoriesRouter = require('./modules/categories/categories.router');
const todosRouter = require('./modules/todos/todos.router');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());

const corsMatchers = env.corsOrigin
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((pattern) => {
    if (!pattern.includes('*')) return (origin) => origin === pattern;
    const escaped = pattern.replace(/[.+^${}()|[\]\\?]/g, '\\$&').replace(/\*/g, '.*');
    const re = new RegExp(`^${escaped}$`);
    return (origin) => re.test(origin);
  });

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || corsMatchers.some((m) => m(origin))) return cb(null, true);
      console.log(`[cors] blocked origin=${origin}`);
      return cb(null, false);
    },
    credentials: false,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// 운영 환경에서 HTTPS 강제 (proxy 뒤에서 x-forwarded-proto 체크)
if (env.isProduction) {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    if (req.protocol !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }
    next();
  });
}

app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));

app.get('/api/docs/swagger.json', (_req, res) => res.json(swaggerDocument));
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { customSiteTitle: 'TodoList API Docs' }),
);

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/todos', todosRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
