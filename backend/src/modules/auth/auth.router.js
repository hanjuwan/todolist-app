'use strict';

const express = require('express');
const { asyncHandler } = require('../../utils/async-handler');
const { validate } = require('../../middlewares/validate.middleware');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { RegisterSchema, LoginSchema } = require('./auth.validator');
const authService = require('./auth.service');

const router = express.Router();

router.post(
  '/register',
  validate(RegisterSchema),
  asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  }),
);

router.post(
  '/login',
  validate(LoginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  }),
);

router.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (_req, res) => {
    // 서버는 JWT를 무상태로 운영(MVP). 클라이언트가 토큰 폐기.
    res.status(200).json({ success: true });
  }),
);

module.exports = router;
