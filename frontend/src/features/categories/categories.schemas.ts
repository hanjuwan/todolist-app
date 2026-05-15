import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1, '카테고리 이름을 입력해 주세요.').max(50),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, '카테고리 이름을 입력해 주세요.').max(50),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
