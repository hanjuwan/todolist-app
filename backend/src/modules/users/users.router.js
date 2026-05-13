'use strict';

const express = require('express');
const { asyncHandler } = require('../../utils/async-handler');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { UpdateProfileSchema, WithdrawSchema } = require('./users.validator');
const usersService = require('./users.service');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const user = await usersService.getMe(req.user.id);
    res.json({ success: true, data: user });
  }),
);

router.patch(
  '/me',
  validate(UpdateProfileSchema),
  asyncHandler(async (req, res) => {
    const user = await usersService.updateMe(req.user.id, req.body);
    res.json({ success: true, data: user });
  }),
);

router.delete(
  '/me',
  validate(WithdrawSchema),
  asyncHandler(async (req, res) => {
    await usersService.withdraw(req.user.id, req.body.currentPassword);
    res.status(204).send();
  }),
);

module.exports = router;
