import { z } from 'zod';
import { ISO_DATE_REGEX } from '@/shared/utils/date';

const isoDate = z.string().regex(ISO_DATE_REGEX, 'YYYY-MM-DD 형식이어야 합니다.');

export const CreateTodoSchema = z.object({
  categoryId: z.string().uuid('카테고리를 선택하세요.'),
  title: z.string().min(1, '제목을 입력하세요.').max(200),
  description: z.string().max(2000).optional(),
  dueDate: isoDate.optional(),
});

export const UpdateTodoSchema = z.object({
  categoryId: z.string().uuid().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  dueDate: isoDate.nullable().optional(),
});

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
      message: '시작일은 종료일 이전이어야 합니다.',
      path: ['dueDateFrom'],
    },
  );

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
export type TodoListFiltersInput = z.infer<typeof TodoListFiltersSchema>;
