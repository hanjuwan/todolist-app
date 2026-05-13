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

const UUID = '11111111-2222-3333-4444-555555555555';

describe('LoginSchema', () => {
  it('정상', () => {
    expect(LoginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });
  it('잘못된 이메일', () => {
    expect(LoginSchema.safeParse({ email: 'not-email', password: 'x' }).success).toBe(false);
  });
  it('빈 비밀번호', () => {
    expect(LoginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  const base = { email: 'a@b.co', name: '홍길동', password: 'pw12345!', passwordConfirm: 'pw12345!' };
  it('정상', () => {
    expect(RegisterSchema.safeParse(base).success).toBe(true);
  });
  it('비밀번호 8자 미만', () => {
    expect(RegisterSchema.safeParse({ ...base, password: '1234567', passwordConfirm: '1234567' }).success).toBe(
      false,
    );
  });
  it('비밀번호 확인 불일치', () => {
    const r = RegisterSchema.safeParse({ ...base, passwordConfirm: 'different' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === 'passwordConfirm')).toBe(true);
    }
  });
  it('이름 누락', () => {
    expect(RegisterSchema.safeParse({ ...base, name: '' }).success).toBe(false);
  });
});

describe('UpdateProfileSchema', () => {
  it('이름만 변경', () => {
    expect(UpdateProfileSchema.safeParse({ name: '새이름' }).success).toBe(true);
  });
  it('비밀번호 변경: current + new + confirm 모두', () => {
    expect(
      UpdateProfileSchema.safeParse({
        currentPassword: 'old',
        newPassword: 'newpass1',
        newPasswordConfirm: 'newpass1',
      }).success,
    ).toBe(true);
  });
  it('비밀번호 변경: current만 있고 new 없으면 실패', () => {
    expect(UpdateProfileSchema.safeParse({ currentPassword: 'old' }).success).toBe(false);
  });
  it('비밀번호 변경: new만 있고 current 없으면 실패', () => {
    expect(UpdateProfileSchema.safeParse({ newPassword: 'newpass1' }).success).toBe(false);
  });
  it('새 비밀번호 확인 불일치', () => {
    const r = UpdateProfileSchema.safeParse({
      currentPassword: 'old',
      newPassword: 'newpass1',
      newPasswordConfirm: 'different',
    });
    expect(r.success).toBe(false);
  });
});

describe('WithdrawSchema', () => {
  it('정상', () => {
    expect(WithdrawSchema.safeParse({ currentPassword: 'x' }).success).toBe(true);
  });
  it('빈 비밀번호 실패', () => {
    expect(WithdrawSchema.safeParse({ currentPassword: '' }).success).toBe(false);
  });
});

describe('CreateTodoSchema', () => {
  it('정상 (필수만)', () => {
    expect(
      CreateTodoSchema.safeParse({ categoryId: UUID, title: '할일' }).success,
    ).toBe(true);
  });
  it('정상 (전체 필드)', () => {
    expect(
      CreateTodoSchema.safeParse({
        categoryId: UUID,
        title: '할일',
        description: '설명',
        dueDate: '2026-05-20',
      }).success,
    ).toBe(true);
  });
  it('categoryId가 UUID가 아니면 실패', () => {
    expect(CreateTodoSchema.safeParse({ categoryId: 'x', title: 't' }).success).toBe(false);
  });
  it('제목 빈 문자열 실패', () => {
    expect(CreateTodoSchema.safeParse({ categoryId: UUID, title: '' }).success).toBe(false);
  });
  it('dueDate 형식 오류', () => {
    expect(
      CreateTodoSchema.safeParse({ categoryId: UUID, title: 't', dueDate: '2026/05/20' }).success,
    ).toBe(false);
  });
});

describe('UpdateTodoSchema', () => {
  it('빈 객체 허용 (모두 optional)', () => {
    expect(UpdateTodoSchema.safeParse({}).success).toBe(true);
  });
  it('dueDate: null 허용 (해제)', () => {
    expect(UpdateTodoSchema.safeParse({ dueDate: null }).success).toBe(true);
  });
});

describe('TodoListFiltersSchema', () => {
  it('빈 필터 허용', () => {
    expect(TodoListFiltersSchema.safeParse({}).success).toBe(true);
  });
  it('dueDateFrom <= dueDateTo 정상', () => {
    expect(
      TodoListFiltersSchema.safeParse({ dueDateFrom: '2026-05-01', dueDateTo: '2026-05-31' })
        .success,
    ).toBe(true);
  });
  it('dueDateFrom > dueDateTo 실패', () => {
    const r = TodoListFiltersSchema.safeParse({
      dueDateFrom: '2026-06-01',
      dueDateTo: '2026-05-01',
    });
    expect(r.success).toBe(false);
  });
  it('from만 또는 to만 단독은 허용', () => {
    expect(TodoListFiltersSchema.safeParse({ dueDateFrom: '2026-05-01' }).success).toBe(true);
    expect(TodoListFiltersSchema.safeParse({ dueDateTo: '2026-05-01' }).success).toBe(true);
  });
});

describe('Category schemas', () => {
  it('생성 정상', () => {
    expect(CreateCategorySchema.safeParse({ name: '업무' }).success).toBe(true);
  });
  it('빈 이름 실패', () => {
    expect(CreateCategorySchema.safeParse({ name: '' }).success).toBe(false);
  });
  it('50자 초과 실패', () => {
    expect(CreateCategorySchema.safeParse({ name: 'x'.repeat(51) }).success).toBe(false);
  });
  it('수정 스키마 동일', () => {
    expect(UpdateCategorySchema.safeParse({ name: '개인' }).success).toBe(true);
  });
});
