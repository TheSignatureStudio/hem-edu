import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { authMiddleware, requireDepartmentAccess, requireSuperAdmin } from '../middleware/auth';

const trainings = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 미들웨어 적용
trainings.use('*', authMiddleware);

// 모든 훈련 조회 (부서별 필터링)
trainings.get('/', requireDepartmentAccess, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const userDepartmentId = c.get('userDepartmentId');
    const isSuperAdmin = c.get('isSuperAdmin');
    const { department_id, is_active } = c.req.query();
    
    let query = `
      SELECT 
        t.*,
        d.name as department_name,
        u.name as creator_name
      FROM trainings t
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    // 최고관리자가 아니면 자신의 부서만 조회
    if (!isSuperAdmin && userDepartmentId) {
      query += ' AND t.department_id = ?';
      params.push(userDepartmentId);
    } else if (department_id) {
      query += ' AND t.department_id = ?';
      params.push(Number(department_id));
    }
    
    if (is_active !== undefined) {
      query += ' AND t.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY t.start_date DESC, t.created_at DESC';
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ trainings: results });
  } catch (error) {
    console.error('Get trainings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 특정 훈련 상세 조회
trainings.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const userDepartmentId = c.get('userDepartmentId');
    const isSuperAdmin = c.get('isSuperAdmin');
    const id = c.req.param('id');
    
    const training = await db.prepare(`
      SELECT 
        t.*,
        d.name as department_name,
        u.name as creator_name
      FROM trainings t
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `).bind(id).first();
    
    if (!training) {
      return c.json({ error: 'Training not found' }, 404);
    }
    
    // 부서 접근 권한 확인
    if (!isSuperAdmin && userDepartmentId && training.department_id !== userDepartmentId) {
      return c.json({ error: 'Forbidden: You do not have access to this training' }, 403);
    }
    
    return c.json({ training });
  } catch (error) {
    console.error('Get training error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 훈련 추가
trainings.post('/', requireDepartmentAccess, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const userDepartmentId = c.get('userDepartmentId');
    const isSuperAdmin = c.get('isSuperAdmin');
    const { department_id, name, description, start_date, end_date, location, instructor } = await c.req.json();
    
    if (!name || !department_id) {
      return c.json({ error: 'Name and department_id are required' }, 400);
    }
    
    // 부서 접근 권한 확인
    if (!isSuperAdmin && userDepartmentId && Number(department_id) !== userDepartmentId) {
      return c.json({ error: 'Forbidden: You can only create trainings for your department' }, 403);
    }
    
    const result = await db.prepare(`
      INSERT INTO trainings (
        department_id, name, description, start_date, end_date, 
        location, instructor, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      department_id,
      name,
      description || null,
      start_date || null,
      end_date || null,
      location || null,
      instructor || null,
      userId
    ).run();
    
    return c.json({ 
      message: 'Training created successfully',
      id: result.meta.last_row_id 
    });
  } catch (error: any) {
    console.error('Create training error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// 훈련 수정
trainings.put('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const userDepartmentId = c.get('userDepartmentId');
    const isSuperAdmin = c.get('isSuperAdmin');
    const id = c.req.param('id');
    const { name, description, start_date, end_date, location, instructor, is_active } = await c.req.json();
    
    // 기존 훈련 조회
    const existing = await db.prepare('SELECT * FROM trainings WHERE id = ?').bind(id).first();
    
    if (!existing) {
      return c.json({ error: 'Training not found' }, 404);
    }
    
    // 부서 접근 권한 확인
    if (!isSuperAdmin && userDepartmentId && existing.department_id !== userDepartmentId) {
      return c.json({ error: 'Forbidden: You do not have access to this training' }, 403);
    }
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      params.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push('end_date = ?');
      params.push(end_date);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      params.push(location);
    }
    if (instructor !== undefined) {
      updates.push('instructor = ?');
      params.push(instructor);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }
    
    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);
      
      await db.prepare(`
        UPDATE trainings SET ${updates.join(', ')} WHERE id = ?
      `).bind(...params).run();
    }
    
    return c.json({ message: 'Training updated successfully' });
  } catch (error: any) {
    console.error('Update training error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// 훈련 삭제
trainings.delete('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const userDepartmentId = c.get('userDepartmentId');
    const isSuperAdmin = c.get('isSuperAdmin');
    const id = c.req.param('id');
    
    // 기존 훈련 조회
    const existing = await db.prepare('SELECT * FROM trainings WHERE id = ?').bind(id).first();
    
    if (!existing) {
      return c.json({ error: 'Training not found' }, 404);
    }
    
    // 부서 접근 권한 확인
    if (!isSuperAdmin && userDepartmentId && existing.department_id !== userDepartmentId) {
      return c.json({ error: 'Forbidden: You do not have access to this training' }, 403);
    }
    
    await db.prepare('DELETE FROM trainings WHERE id = ?').bind(id).run();
    
    return c.json({ message: 'Training deleted successfully' });
  } catch (error) {
    console.error('Delete training error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default trainings;

