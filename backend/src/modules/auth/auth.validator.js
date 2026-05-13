'use strict';

const { z } = require('zod');

const RegisterSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않습니다.').max(255),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.').max(72),
  name: z.string().min(1).max(50),
});

const LoginSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않습니다.').max(255),
  password: z.string().min(1).max(72),
});

module.exports = { RegisterSchema, LoginSchema };
