import { z } from 'zod';

export const UpdateProfileSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
    currentPassword: z.string().min(1).max(72).optional(),
    newPassword: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.').max(72).optional(),
    newPasswordConfirm: z.string().optional(),
  })
  .refine(
    (d) => (d.newPassword === undefined) === (d.currentPassword === undefined),
    {
      path: ['currentPassword'],
      message: '비밀번호 변경 시 현재 비밀번호와 새 비밀번호를 모두 입력해야 합니다.',
    },
  )
  .refine(
    (d) => d.newPassword === undefined || d.newPassword === d.newPasswordConfirm,
    {
      path: ['newPasswordConfirm'],
      message: '새 비밀번호가 일치하지 않습니다.',
    },
  );

export const WithdrawSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해 주세요.').max(72),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type WithdrawInput = z.infer<typeof WithdrawSchema>;
