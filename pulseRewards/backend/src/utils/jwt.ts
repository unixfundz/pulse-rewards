import jwt from 'jsonwebtoken';

const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY ?? '';
const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY ?? '';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY ?? '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY ?? '7d';

export interface TokenPayload {
  sub: string;   // user ID
  role: string;
  jti?: string;  // refresh token id
}

export function signAccess(payload: TokenPayload): string {
  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: ACCESS_EXPIRY,
  } as jwt.SignOptions);
}

export function signRefresh(payload: TokenPayload): string {
  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: REFRESH_EXPIRY,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as TokenPayload;
}
