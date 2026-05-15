'use strict';

const { z } = require('zod');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 합니다.');

const CreateTodoSchema = z
  .object({
    categoryId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    startDate: isoDate.optional(),
    dueDate: isoDate.optional(),
  })
  .refine((d) => !(d.startDate && d.dueDate) || d.startDate <= d.dueDate, {
    path: ['dueDate'],
    message: 'dueDate는 startDate보다 같거나 이후여야 합니다.',
  });

const UpdateTodoSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).nullable().optional(),
    startDate: isoDate.nullable().optional(),
    dueDate: isoDate.nullable().optional(),
  })
  .refine(
    (d) => {
      if (!d.startDate || !d.dueDate) return true;
      return d.startDate <= d.dueDate;
    },
    { path: ['dueDate'], message: 'dueDate는 startDate보다 같거나 이후여야 합니다.' },
  );

const ToggleCompleteSchema = z.object({
  isCompleted: z.boolean(),
});

const ListTodosQuerySchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    isCompleted: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
      .optional(),
    dueDateFrom: isoDate.optional(),
    dueDateTo: isoDate.optional(),
    keyword: z.string().max(100).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  })
  .refine(
    (d) => !(d.dueDateFrom && d.dueDateTo) || d.dueDateFrom <= d.dueDateTo,
    { message: 'dueDateFrom은 dueDateTo보다 이전이어야 합니다.' },
  );

module.exports = { CreateTodoSchema, UpdateTodoSchema, ToggleCompleteSchema, ListTodosQuerySchema };
