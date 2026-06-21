import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../src/utils/token.utils';

const user = { id: 'u1', email: 'a@b.c', role: 'USER' } as any;

beforeAll(() => {
  process.env.JWT_SECRET = 'test_access_secret_0123456789abcdefghij';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_zyxwvutsrqponml9876';
});

describe('token.utils', () => {
  it('génère un access token vérifiable', () => {
    const { accessToken } = generateTokens(user);
    const payload = verifyAccessToken(accessToken);
    expect(payload.userId).toBe('u1');
    expect(payload.type).toBe('access');
  });

  it('génère un refresh token vérifiable', () => {
    const { refreshToken } = generateTokens(user);
    const payload = verifyRefreshToken(refreshToken);
    expect(payload.userId).toBe('u1');
    expect(payload.type).toBe('refresh');
  });

  it('refuse un access token présenté comme refresh', () => {
    const { accessToken } = generateTokens(user);
    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });

  it('refuse un refresh token présenté comme access (secret séparé)', () => {
    const { refreshToken } = generateTokens(user);
    expect(() => verifyAccessToken(refreshToken)).toThrow();
  });

  it('refuse un token invalide', () => {
    expect(() => verifyAccessToken('pas.un.jwt')).toThrow();
  });
});
