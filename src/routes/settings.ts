import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';

const settings = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 설정 조회
settings.get('/', async (c) => {
  try {
    const db = c.env.DB;
    
    const { results } = await db.prepare(`
      SELECT * FROM settings ORDER BY key
    `).all();
    
    return c.json({ settings: results });
  } catch (error) {
    console.error('Get settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 설정 업데이트
settings.put('/:key', async (c) => {
  try {
    const db = c.env.DB;
    const key = c.req.param('key');
    const { value } = await c.req.json();
    
    await db.prepare(`
      INSERT INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET 
        value = ?,
        updated_at = CURRENT_TIMESTAMP
    `).bind(key, value, value).run();
    
    return c.json({ message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Update setting error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 예배 구분 조회
settings.get('/service-types', async (c) => {
  try {
    const db = c.env.DB;
    
    const { results } = await db.prepare(`
      SELECT * FROM service_types WHERE is_active = 1 ORDER BY display_order
    `).all();
    
    return c.json({ serviceTypes: results });
  } catch (error) {
    console.error('Get service types error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 예배 구분 추가
settings.post('/service-types', async (c) => {
  try {
    const db = c.env.DB;
    const { name, display_order } = await c.req.json();
    
    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }
    
    const result = await db.prepare(`
      INSERT INTO service_types (name, display_order)
      VALUES (?, ?)
    `).bind(name, display_order || 999).run();
    
    return c.json({ 
      message: 'Service type added successfully',
      id: result.meta.last_row_id
    });
  } catch (error: any) {
    console.error('Add service type error:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return c.json({ error: '이미 존재하는 예배 구분입니다.' }, 409);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 예배 구분 수정
settings.put('/service-types/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const { name, display_order, is_active } = await c.req.json();
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (display_order !== undefined) {
      updates.push('display_order = ?');
      params.push(display_order);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }
    
    if (updates.length > 0) {
      params.push(id);
      await db.prepare(`
        UPDATE service_types SET ${updates.join(', ')} WHERE id = ?
      `).bind(...params).run();
    }
    
    return c.json({ message: 'Service type updated successfully' });
  } catch (error) {
    console.error('Update service type error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 예배 구분 삭제
settings.delete('/service-types/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    // 해당 예배 구분을 사용하는 출석 기록이 있는지 확인
    const { results } = await db.prepare(`
      SELECT COUNT(*) as count FROM attendance 
      WHERE service_type = (SELECT name FROM service_types WHERE id = ?)
    `).bind(id).all();
    
    if (results && results[0] && (results[0] as any).count > 0) {
      return c.json({ error: '출석 기록이 있는 예배 구분은 삭제할 수 없습니다.' }, 400);
    }
    
    await db.prepare('DELETE FROM service_types WHERE id = ?').bind(id).run();
    
    return c.json({ message: 'Service type deleted successfully' });
  } catch (error) {
    console.error('Delete service type error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 선생님 목록 조회
settings.get('/teachers', async (c) => {
  try {
    const db = c.env.DB;
    
    const { results } = await db.prepare(`
      SELECT * FROM teachers WHERE is_active = 1 ORDER BY name
    `).all();
    
    return c.json({ teachers: results });
  } catch (error) {
    console.error('Get teachers error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 선생님 추가
settings.post('/teachers', async (c) => {
  try {
    const db = c.env.DB;
    const { name, phone, email, position, note } = await c.req.json();
    
    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }
    
    const result = await db.prepare(`
      INSERT INTO teachers (name, phone, email, position, note)
      VALUES (?, ?, ?, ?, ?)
    `).bind(name, phone || null, email || null, position || null, note || null).run();
    
    return c.json({ 
      message: 'Teacher added successfully',
      id: result.meta.last_row_id
    });
  } catch (error) {
    console.error('Add teacher error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 선생님 수정
settings.put('/teachers/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const { name, phone, email, position, is_active, note } = await c.req.json();
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (position !== undefined) {
      updates.push('position = ?');
      params.push(position);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }
    if (note !== undefined) {
      updates.push('note = ?');
      params.push(note);
    }
    
    if (updates.length > 0) {
      params.push(id);
      await db.prepare(`
        UPDATE teachers SET ${updates.join(', ')} WHERE id = ?
      `).bind(...params).run();
    }
    
    return c.json({ message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Update teacher error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 선생님 삭제
settings.delete('/teachers/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    await db.prepare('DELETE FROM teachers WHERE id = ?').bind(id).run();
    
    return c.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default settings;
