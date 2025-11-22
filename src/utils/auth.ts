import type { Context } from 'hono';
import type { CloudflareBindings } from '../types';

// JWT 시크릿 키 (실제로는 환경 변수로 관리)
const JWT_SECRET = 'your-secret-key-change-in-production';

// 간단한 JWT 생성 (실제로는 hono/jwt 사용 권장)
export async function createToken(
  userId: number, 
  role: string, 
  departmentId: number | null = null,
  isSuperAdmin: boolean = false
): Promise<string> {
  const payload = {
    userId,
    role,
    departmentId,
    isSuperAdmin,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24시간
  };
  
  // 간단한 Base64 인코딩 (실제로는 proper JWT 사용)
  const token = btoa(JSON.stringify(payload));
  return token;
}

// 토큰 검증
export async function verifyToken(token: string): Promise<any> {
  try {
    const payload = JSON.parse(atob(token));
    
    // 만료 체크
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

// 비밀번호 해싱 (간단한 구현, 실제로는 bcrypt 사용)
export async function hashPassword(password: string): Promise<string> {
  // Cloudflare Workers에서 bcrypt가 제대로 동작하지 않을 수 있으므로
  // Web Crypto API 사용
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

// 비밀번호 검증
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

// 인증 미들웨어
export async function authMiddleware(c: Context<{ Bindings: CloudflareBindings }>, next: () => Promise<void>) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const payload = await verifyToken(token);
  
  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  // 사용자 정보를 컨텍스트에 저장
  c.set('user', payload);
  
  await next();
}

// 권한 체크 미들웨어
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: () => Promise<void>) => {
    const user = c.get('user');
    
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    await next();
  };
}
