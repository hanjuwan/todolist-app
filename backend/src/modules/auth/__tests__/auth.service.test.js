'use strict';

// CJS + vitest 환경에서 vi.mock 인터셉트가 비활성화되므로 vi.spyOn으로 모듈 메서드 패치

const usersRepo = require('../../users/users.repository');
const pw = require('../../../utils/password');
const jwtUtil = require('../../../utils/jwt');
const service = require('../auth.service');

describe('auth.service.register', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('중복 이메일 → 409 EMAIL_DUPLICATED', async () => {
    vi.spyOn(usersRepo, 'findByEmail').mockResolvedValue({ id: 'u' });
    const createSpy = vi.spyOn(usersRepo, 'create');
    await expect(service.register({ email: 'a@b.c', password: 'p', name: 'n' })).rejects.toMatchObject({
      statusCode: 409,
      code: 'EMAIL_DUPLICATED',
    });
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('정상 가입 → users.create에 bcrypt 해시 전달 ($2b$, cost 12)', async () => {
    vi.spyOn(usersRepo, 'findByEmail').mockResolvedValue(null);
    const createSpy = vi
      .spyOn(usersRepo, 'create')
      .mockResolvedValue({ id: 'u1', email: 'a@b.c', name: 'n' });
    const r = await service.register({ email: 'a@b.c', password: 'pass1234', name: 'n' });
    expect(createSpy).toHaveBeenCalledTimes(1);
    const call = createSpy.mock.calls[0][0];
    expect(call.email).toBe('a@b.c');
    expect(call.name).toBe('n');
    expect(call.passwordHash).toMatch(/^\$2[aby]\$12\$.{53}$/);
    expect(r).toEqual({ id: 'u1', email: 'a@b.c', name: 'n' });
  });
});

describe('auth.service.login', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('미가입 이메일 → 401 INVALID_CREDENTIALS', async () => {
    vi.spyOn(usersRepo, 'findByEmail').mockResolvedValue(null);
    await expect(service.login({ email: 'x@y.z', password: 'p' })).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('비밀번호 불일치 → 401 (실제 bcrypt compare)', async () => {
    const realHash = await pw.hashPassword('correct-password');
    vi.spyOn(usersRepo, 'findByEmail').mockResolvedValue({ id: 'u', password_hash: realHash });
    await expect(service.login({ email: 'a@b.c', password: 'wrong-password' })).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('정상 로그인 → accessToken + user 반환 (실제 JWT 발급·검증)', async () => {
    const realHash = await pw.hashPassword('mypassword');
    vi.spyOn(usersRepo, 'findByEmail').mockResolvedValue({
      id: 'uid1',
      email: 'a@b.c',
      name: 'n',
      password_hash: realHash,
    });
    const r = await service.login({ email: 'a@b.c', password: 'mypassword' });
    expect(r.user).toEqual({ id: 'uid1', email: 'a@b.c', name: 'n' });
    expect(typeof r.accessToken).toBe('string');
    // 발급된 토큰은 verifyToken으로 검증되며 sub = user.id
    const payload = jwtUtil.verifyToken(r.accessToken);
    expect(payload.sub).toBe('uid1');
  });

  it('signToken 결과는 verifyToken으로 검증 가능 (실제 jwt 라이브러리 호출)', () => {
    const token = jwtUtil.signToken({ sub: 'verify-test-uid' });
    expect(typeof token).toBe('string');
    expect(jwtUtil.verifyToken(token).sub).toBe('verify-test-uid');
  });
});
