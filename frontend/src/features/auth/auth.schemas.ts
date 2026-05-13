import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않습니다.').max(255),
  password: z.string().min(1, '비밀번호를 입력하세요.').max(72),
});

export const RegisterSchema = z
  .object({
    email: z.string().email('이메일 형식이 올바르지 않습니다.').max(255),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .max(72, '비밀번호는 72자 이하여야 합니다.'),
    passwordConfirm: z.string(),
    name: z
      .string()
      .min(1, '이름을 입력하세요.')
      .max(50, '이름은 50자 이하여야 합니다.'),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
