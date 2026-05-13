'use strict';

const express = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../../utils/async-handler');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { CreateCategorySchema, UpdateCategorySchema } = require('./categories.validator');
const service = require('./categories.service');

const router = express.Router();
const IdParams = z.object({ id: z.string().uuid() });

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const list = await service.list(req.user.id);
    res.json({ success: true, data: list });
  }),
);

router.post(
  '/',
  validate(CreateCategorySchema),
  asyncHandler(async (req, res) => {
    const created = await service.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: created });
  }),
);

router.patch(
  '/:id',
  validate(IdParams, 'params'),
  validate(UpdateCategorySchema),
  asyncHandler(async (req, res) => {
    const updated = await service.update(req.user.id, req.params.id, req.body);
    res.json({ success: true, data: updated });
  }),
);

router.delete(
  '/:id',
  validate(IdParams, 'params'),
  asyncHandler(async (req, res) => {
    await service.remove(req.user.id, req.params.id);
    res.status(204).send();
  }),
);

module.exports = router;
