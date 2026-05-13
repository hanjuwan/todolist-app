'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const env = require('./config/env');
const { requestLogger } = require('./middlewares/request-logger.middleware');
const authRouter = require('./modules/auth/auth.router');
const usersRouter = require('./modules/users/users.router');
const categoriesRouter = require('./modules/categories/categories.router');
const todosRouter = require('./modules/todos/todos.router');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: false }));
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

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/todos', todosRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
