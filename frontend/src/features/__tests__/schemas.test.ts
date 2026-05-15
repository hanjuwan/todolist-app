import { describe, it, expect } from 'vitest';
import { LoginSchema, RegisterSchema } from '@/features/auth/auth.schemas';
import { UpdateProfileSchema, WithdrawSchema } from '@/features/users/users.schemas';
import {
  CreateTodoSchema,
  UpdateTodoSchema,
  TodoListFiltersSchema,
} from '@/features/todos/todos.schemas';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from '@/features/categories/categories.schemas';

const UUID = '11111111-1111-1111-1111-111111111111';

describe('LoginSchema', () => {
  it('정상 이메일·비밀번호 통과', () => {
    expect(LoginSchema.safeParse({ email: 'user@example.com', password: 'pw' }).success).toBe(true);
  });
  it('잘못된 이메일 형식 실패', () => {
    expect(LoginSchema.safeParse({ email: 'invalid', password: 'pw' }).success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  const base = {
    name: '홍길동',
    email: 'user@example.com',
    password: 'password1',
    passwordConfirm: 'password1',
  };
  it('정상 입력 통과', () => {
    expect(RegisterSchema.safeParse(base).success).toBe(true);
  });
  it('비밀번호 8자 미만 실패', () => {
    expect(
      RegisterSchema.safeParse({ ...base, password: 'pw1', passwordConfirm: 'pw1' }).success,
    ).toBe(false);
  });
  it('passwordConfirm 불일치 실패 (path: passwordConfirm)', () => {
    const r = RegisterSchema.safeParse({ ...base, passwordConfirm: 'mismatched' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].path).toContain('passwordConfirm');
    }
  });
  it('이름 빈 문자열 실패', () => {
    expect(RegisterSchema.safeParse({ ...base, name: '' }).success).toBe(false);
  });
});

describe('UpdateProfileSchema', () => {
  it('이름만 변경 — 통과', () => {
    expect(UpdateProfileSchema.safeParse({ name: '새이름' }).success).toBe(true);
  });
  it('비밀번호 동반 누락 — 실패 (newPassword만)', () => {
    expect(UpdateProfileSchema.safeParse({ newPassword: 'newpass123' }).success).toBe(false);
  });
  it('비밀번호 동반 누락 — 실패 (currentPassword만)', () => {
    expect(UpdateProfileSchema.safeParse({ currentPassword: 'curpass' }).success).toBe(false);
  });
  it('비밀번호 변경 정상 — 통과', () => {
    expect(
      UpdateProfileSchema.safeParse({
        currentPassword: 'curpass',
        newPassword: 'newpass123',
        newPasswordConfirm: 'newpass123',
      }).success,
    ).toBe(true);
  });
  it('새 비밀번호 확인 불일치 — 실패', () => {
    expect(
      UpdateProfileSchema.safeParse({
        currentPassword: 'curpass',
        newPassword: 'newpass123',
        newPasswordConfirm: 'mismatched',
      }).success,
    ).toBe(false);
  });
});

describe('WithdrawSchema', () => {
  it('현재 비밀번호 입력 — 통과', () => {
    expect(WithdrawSchema.safeParse({ currentPassword: 'cur' }).success).toBe(true);
  });
  it('빈 문자열 — 실패', () => {
    expect(WithdrawSchema.safeParse({ currentPassword: '' }).success).toBe(false);
  });
});

describe('CreateTodoSchema', () => {
  it('UUID·제목·dueDate(YYYY-MM-DD) 통과', () => {
    expect(
      CreateTodoSchema.safeParse({ categoryId: UUID, title: '할일', dueDate: '2026-05-14' }).success,
    ).toBe(true);
  });
  it('잘못된 UUID 실패', () => {
    expect(CreateTodoSchema.safeParse({ categoryId: 'not-uuid', title: '할일' }).success).toBe(false);
  });
  it('제목 빈 문자열 실패', () => {
    expect(CreateTodoSchema.safeParse({ categoryId: UUID, title: '' }).success).toBe(false);
  });
  it('잘못된 dueDate 형식 실패', () => {
    expect(
      CreateTodoSchema.safeParse({ categoryId: UUID, title: '할일', dueDate: '2026/05/14' }).success,
    ).toBe(false);
  });
  it('startDate <= dueDate 통과', () => {
    expect(
      CreateTodoSchema.safeParse({ categoryId: UUID, title: '할일', startDate: '2026-05-10', dueDate: '2026-05-20' }).success,
    ).toBe(true);
  });
  it('startDate === dueDate 통과', () => {
    expect(
      CreateTodoSchema.safeParse({ categoryId: UUID, title: '할일', startDate: '2026-05-15', dueDate: '2026-05-15' }).success,
    ).toBe(true);
  });
  it('startDate > dueDate 실패 (path: dueDate)', () => {
    const r = CreateTodoSchema.safeParse({ categoryId: UUID, title: '할일', startDate: '2026-05-20', dueDate: '2026-05-10' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].path).toContain('dueDate');
    }
  });
});

describe('UpdateTodoSchema', () => {
  it('description null 허용', () => {
    expect(UpdateTodoSchema.safeParse({ description: null }).success).toBe(true);
  });
  it('dueDate null 허용', () => {
    expect(UpdateTodoSchema.safeParse({ dueDate: null }).success).toBe(true);
  });
  it('빈 객체도 통과 (모두 optional)', () => {
    expect(UpdateTodoSchema.safeParse({}).success).toBe(true);
  });
  it('startDate <= dueDate 통과', () => {
    expect(UpdateTodoSchema.safeParse({ startDate: '2026-05-10', dueDate: '2026-05-20' }).success).toBe(true);
  });
  it('startDate > dueDate 실패 (path: dueDate)', () => {
    const r = UpdateTodoSchema.safeParse({ startDate: '2026-05-20', dueDate: '2026-05-10' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].path).toContain('dueDate');
    }
  });
});

describe('TodoListFiltersSchema', () => {
  it('dueDateFrom > dueDateTo 실패', () => {
    const r = TodoListFiltersSchema.safeParse({
      dueDateFrom: '2026-05-20',
      dueDateTo: '2026-05-10',
    });
    expect(r.success).toBe(false);
  });
  it('dueDateFrom <= dueDateTo 통과', () => {
    expect(
      TodoListFiltersSchema.safeParse({
        dueDateFrom: '2026-05-10',
        dueDateTo: '2026-05-20',
      }).success,
    ).toBe(true);
  });
  it('dueDateFrom 단독 허용', () => {
    expect(TodoListFiltersSchema.safeParse({ dueDateFrom: '2026-05-10' }).success).toBe(true);
  });
  it('dueDateTo 단독 허용', () => {
    expect(TodoListFiltersSchema.safeParse({ dueDateTo: '2026-05-20' }).success).toBe(true);
  });
});

describe('CreateCategorySchema / UpdateCategorySchema', () => {
  it('1~50자 이름 통과', () => {
    expect(CreateCategorySchema.safeParse({ name: '업무' }).success).toBe(true);
    expect(UpdateCategorySchema.safeParse({ name: '업무' }).success).toBe(true);
  });
  it('빈 문자열 실패', () => {
    expect(CreateCategorySchema.safeParse({ name: '' }).success).toBe(false);
  });
  it('51자 이상 실패', () => {
    expect(CreateCategorySchema.safeParse({ name: 'a'.repeat(51) }).success).toBe(false);
  });
});
