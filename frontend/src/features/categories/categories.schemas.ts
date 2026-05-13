import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(1, '카테고리명을 입력하세요.')
    .max(50, '카테고리명은 50자 이하여야 합니다.'),
});

export const UpdateCategorySchema = CreateCategorySchema;

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
