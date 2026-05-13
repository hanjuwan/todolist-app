'use strict';

const { verifyToken } = require('../utils/jwt');
const { AppError } = require('../utils/app-error');

/**
 * @typedef {{ id: string }} ReqUser
 */

function authMiddleware(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'UNAUTHENTICATED', '인증이 필요합니다.'));
  }

  try {
    const payload = verifyToken(token);
    if (!payload || typeof payload.sub !== 'string') {
      throw new Error('Invalid payload');
    }
    req.user = { id: payload.sub };
    next();
  } catch (_err) {
    next(new AppError(401, 'UNAUTHENTICATED', '세션이 만료되었거나 유효하지 않습니다.'));
  }
}

module.exports = { authMiddleware };
