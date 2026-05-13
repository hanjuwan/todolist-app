'use strict';

function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1_000_000;
    // 민감 정보(Authorization, body)는 로그에 남기지 않는다
    console.log(`[${req.method}] ${req.originalUrl} → ${res.statusCode} ${ms.toFixed(1)}ms`);
  });
  next();
}

module.exports = { requestLogger };
