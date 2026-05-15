import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않습니다.').max(255),
  password: z.string().min(1, '비밀번호를 입력해 주세요.').max(72),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(1, '이름을 입력해 주세요.').max(50),
    email: z.string().email('이메일 형식이 올바르지 않습니다.').max(255),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.').max(72),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않습니다.',
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
