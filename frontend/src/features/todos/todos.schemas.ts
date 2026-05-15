import { z } from 'zod';
import { ISO_DATE_REGEX } from '@/shared/utils/date';

const isoDate = z.string().regex(ISO_DATE_REGEX, 'YYYY-MM-DD 형식이어야 합니다.');

export const CreateTodoSchema = z
  .object({
    categoryId: z.string().uuid('카테고리를 선택해 주세요.'),
    title: z.string().min(1, '제목은 필수 항목입니다.').max(200),
    description: z.string().max(2000).optional(),
    startDate: isoDate.optional(),
    dueDate: isoDate.optional(),
  })
  .refine((d) => !(d.startDate && d.dueDate) || d.startDate <= d.dueDate, {
    path: ['dueDate'],
    message: '시작일은 마감일보다 같거나 빠른 날짜여야 합니다.',
  });

export const UpdateTodoSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).nullable().optional(),
    startDate: isoDate.nullable().optional(),
    dueDate: isoDate.nullable().optional(),
  })
  .refine(
    (d) => !d.startDate || !d.dueDate || d.startDate <= d.dueDate,
    { path: ['dueDate'], message: '시작일은 마감일보다 같거나 빠른 날짜여야 합니다.' },
  );

export const TodoListFiltersSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    isCompleted: z.boolean().optional(),
    dueDateFrom: isoDate.optional(),
    dueDateTo: isoDate.optional(),
    keyword: z.string().max(100).optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
  })
  .refine(
    (d) => !(d.dueDateFrom && d.dueDateTo) || d.dueDateFrom <= d.dueDateTo,
    {
      path: ['dueDateTo'],
      message: '종료일은 시작일보다 빠를 수 없습니다.',
    },
  );

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
export type TodoListFiltersInput = z.infer<typeof TodoListFiltersSchema>;
