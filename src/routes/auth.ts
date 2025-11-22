import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { createToken, hashPassword, verifyPassword } from '../utils/auth';

const auth = new Hono<{ Bindings: CloudflareBindings }>();

// 로그인
auth.post('/login', async (c) => {
  const { username, password } = await c.req.json();
  
  if (!username || !password) {
    return c.json({ error: 'Username and password are required' }, 400);
  }
  
  try {
    const db = c.env.DB;
    
    // 사용자 조회 (부서 정보 포함)
    const user = await db.prepare(
      'SELECT id, username, password_hash, email, name, role, phone, department_id, is_super_admin FROM users WHERE username = ? AND is_active = 1'
    ).bind(username).first();
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // 비밀번호 검증 (실제로는 bcrypt 사용)
    // 현재는 간단하게 직접 비교 (seed.sql의 해시와 맞춰야 함)
    const isValid = user.password_hash === password || 
                    await verifyPassword(password, user.password_hash as string);
    
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // JWT 토큰 생성 (부서 정보 및 최고관리자 여부 포함)
    const token = await createToken(
      user.id as number, 
      user.role as string,
      user.department_id as number | null,
      user.is_super_admin === 1 || user.is_super_admin === true
    );
    
    // 사용자 역할에 따른 추가 정보 조회
    let additionalInfo: any = {};
    
    if (user.role === 'student') {
      const student = await db.prepare(
        'SELECT * FROM students WHERE user_id = ?'
      ).bind(user.id).first();
      additionalInfo.student = student;
    } else if (user.role === 'teacher') {
      const teacher = await db.prepare(
        'SELECT * FROM teachers WHERE user_id = ?'
      ).bind(user.id).first();
      additionalInfo.teacher = teacher;
    }
    
    return c.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        department_id: user.department_id,
        is_super_admin: user.is_super_admin === 1 || user.is_super_admin === true
      },
      ...additionalInfo
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 현재 사용자 정보 조회
auth.get('/me', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    // 토큰에서 사용자 정보 추출
    const payload = JSON.parse(atob(token));
    
    const db = c.env.DB;
    const user = await db.prepare(
      'SELECT id, username, email, name, role, phone FROM users WHERE id = ? AND is_active = 1'
    ).bind(payload.userId).first();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ user });
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// 비밀번호 변경
auth.post('/change-password', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const payload = JSON.parse(atob(token));
    const { oldPassword, newPassword } = await c.req.json();
    
    if (!oldPassword || !newPassword) {
      return c.json({ error: 'Old and new passwords are required' }, 400);
    }
    
    const db = c.env.DB;
    
    // 현재 사용자 조회
    const user = await db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(payload.userId).first();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // 기존 비밀번호 검증
    const isValid = await verifyPassword(oldPassword, user.password_hash as string);
    
    if (!isValid) {
      return c.json({ error: 'Invalid old password' }, 401);
    }
    
    // 새 비밀번호 해싱
    const newHash = await hashPassword(newPassword);
    
    // 비밀번호 업데이트
    await db.prepare(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newHash, payload.userId).run();
    
    return c.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default auth;
