'use strict';

const { z } = require('zod');

const UpdateProfileSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
    currentPassword: z.string().min(1).max(72).optional(),
    newPassword: z.string().min(8).max(72).optional(),
  })
  .refine(
    (d) => (d.newPassword === undefined) === (d.currentPassword === undefined),
    { message: '비밀번호 변경은 currentPassword와 newPassword를 함께 보내야 합니다.' },
  );

const WithdrawSchema = z.object({
  currentPassword: z.string().min(1).max(72),
});

module.exports = { UpdateProfileSchema, WithdrawSchema };
