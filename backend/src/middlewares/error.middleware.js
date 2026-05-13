'use strict';

const { ZodError } = require('zod');
const { AppError } = require('../utils/app-error');
const env = require('../config/env');

function notFoundHandler(req, res, _next) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: '요청한 리소스를 찾을 수 없습니다.' },
  });
}

function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '입력값이 올바르지 않습니다.',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
  }

  console.error('[unhandled]', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.isProduction ? '서버 오류가 발생했습니다.' : err.message,
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
