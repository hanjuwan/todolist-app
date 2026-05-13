'use strict';

const express = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../../utils/async-handler');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  CreateTodoSchema,
  UpdateTodoSchema,
  ToggleCompleteSchema,
  ListTodosQuerySchema,
} = require('./todos.validator');
const service = require('./todos.service');

const router = express.Router();
const IdParams = z.object({ id: z.string().uuid() });

router.use(authMiddleware);

router.get(
  '/',
  validate(ListTodosQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const result = await service.list(req.user.id, req.query);
    res.json({ success: true, data: result.items, pagination: result.pagination });
  }),
);

router.post(
  '/',
  validate(CreateTodoSchema),
  asyncHandler(async (req, res) => {
    const created = await service.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: created });
  }),
);

router.get(
  '/:id',
  validate(IdParams, 'params'),
  asyncHandler(async (req, res) => {
    const todo = await service.getById(req.user.id, req.params.id);
    res.json({ success: true, data: todo });
  }),
);

router.patch(
  '/:id',
  validate(IdParams, 'params'),
  validate(UpdateTodoSchema),
  asyncHandler(async (req, res) => {
    const updated = await service.update(req.user.id, req.params.id, req.body);
    res.json({ success: true, data: updated });
  }),
);

router.patch(
  '/:id/complete',
  validate(IdParams, 'params'),
  validate(ToggleCompleteSchema),
  asyncHandler(async (req, res) => {
    const updated = await service.toggleComplete(req.user.id, req.params.id, req.body.isCompleted);
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
