import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { hashPassword } from '../utils/auth';

const users = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 사용자 조회 (관리자 전용)
users.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const { role, search, limit = 50, offset = 0 } = c.req.query();
    
    // teacher 역할인 경우 teachers 테이블과 조인하여 teacher_id 포함
    let query: string;
    if (role === 'teacher') {
      query = `
        SELECT 
          u.id, 
          u.username, 
          u.email, 
          u.name, 
          u.role, 
          u.phone, 
          u.is_active, 
          u.created_at,
          t.id as teacher_id,
          t.subject as teacher_subject
        FROM users u
        LEFT JOIN teachers t ON u.id = t.user_id
        WHERE u.role = ?
      `;
    } else {
      query = 'SELECT id, username, email, name, role, phone, is_active, created_at FROM users WHERE 1=1';
    }
    
    const params: any[] = [];
    
    if (role && role !== 'teacher') {
      query += ' AND role = ?';
      params.push(role);
    } else if (role === 'teacher') {
      params.push(role);
    }
    
    if (search) {
      if (role === 'teacher') {
        query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)';
      } else {
        query += ' AND (name LIKE ? OR email LIKE ? OR username LIKE ?)';
      }
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (role === 'teacher') {
      query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    } else {
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    }
    params.push(Number(limit), Number(offset));
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ users: results });
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 특정 사용자 조회
users.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    const user = await db.prepare(
      'SELECT id, username, email, name, role, phone, is_active, created_at FROM users WHERE id = ?'
    ).bind(id).first();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // 역할별 추가 정보 조회
    let additionalInfo: any = {};
    
    if (user.role === 'student') {
      const student = await db.prepare(
        'SELECT * FROM students WHERE user_id = ?'
      ).bind(id).first();
      
      if (student) {
        // 반 정보 조회
        if (student.class_id) {
          const classInfo = await db.prepare(
            'SELECT * FROM classes WHERE id = ?'
          ).bind(student.class_id).first();
          additionalInfo.class = classInfo;
        }
        additionalInfo.student = student;
      }
    } else if (user.role === 'teacher') {
      const teacher = await db.prepare(
        'SELECT * FROM teachers WHERE user_id = ?'
      ).bind(id).first();
      additionalInfo.teacher = teacher;
    } else if (user.role === 'parent') {
      const children = await db.prepare(`
        SELECT s.*, u.name as student_name, ps.relationship
        FROM parent_student ps
        JOIN students s ON ps.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE ps.parent_user_id = ?
      `).bind(id).all();
      additionalInfo.children = children.results;
    }
    
    return c.json({ user, ...additionalInfo });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 새 사용자 생성 (관리자 전용)
users.post('/', async (c) => {
  try {
    const db = c.env.DB;
    const { username, password, email, name, role, phone } = await c.req.json();
    
    if (!username || !password || !email || !name || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // 비밀번호 해싱
    const passwordHash = await hashPassword(password);
    
    // 사용자 생성
    const result = await db.prepare(
      'INSERT INTO users (username, password_hash, email, name, role, phone) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(username, passwordHash, email, name, role, phone || null).run();
    
    if (!result.success) {
      return c.json({ error: 'Failed to create user' }, 500);
    }
    
    return c.json({ 
      message: 'User created successfully',
      userId: result.meta.last_row_id 
    }, 201);
  } catch (error: any) {
    console.error('Create user error:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return c.json({ error: 'Username or email already exists' }, 409);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 사용자 정보 수정
users.put('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const { email, name, phone, is_active, password } = await c.req.json();
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }
    if (password !== undefined && password !== '') {
      updates.push('password_hash = ?');
      const passwordHash = await hashPassword(password);
      params.push(passwordHash);
    }
    
    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await db.prepare(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...params).run();
    
    return c.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 사용자 권한 변경 (관리자 전용)
users.put('/:id/role', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const { role } = await c.req.json();
    
    if (!role) {
      return c.json({ error: 'Role is required' }, 400);
    }
    
    const validRoles = ['super_admin', 'admin', 'teacher', 'student', 'parent'];
    if (!validRoles.includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }
    
    await db.prepare(
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(role, id).run();
    
    return c.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update user role error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 사용자 삭제 (관리자 전용)
users.delete('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    // 사용자 삭제 (CASCADE로 관련 데이터도 삭제됨)
    await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    
    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default users;
