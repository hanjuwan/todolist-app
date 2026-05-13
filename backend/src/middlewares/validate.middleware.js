'use strict';

/**
 * zod 스키마로 req.body / req.query / req.params 검증 팩토리.
 * 통과 시 파싱된 결과를 req[target]에 재할당.
 */
function validate(schema, target = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) return next(result.error);
    req[target] = result.data;
    next();
  };
}

module.exports = { validate };
