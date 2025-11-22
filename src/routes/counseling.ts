import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { authMiddleware } from '../middleware/auth';

const counseling = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 미들웨어 적용
counseling.use('*', authMiddleware);

// 상담기록 목록 조회
counseling.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const { member_id, counseling_type, limit = 100 } = c.req.query();
    
    let query = `
      SELECT 
        cr.*,
        m.name as member_name,
        m.member_number
      FROM counseling cr
      JOIN members m ON cr.member_id = m.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (member_id) {
      query += ' AND cr.member_id = ?';
      params.push(parseInt(member_id));
    }
    
    if (counseling_type) {
      query += ' AND cr.counseling_type = ?';
      params.push(counseling_type);
    }
    
    query += ' ORDER BY cr.counseling_date DESC, cr.created_at DESC LIMIT ?';
    params.push(parseInt(limit as string));
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ records: results || [] });
  } catch (error: any) {
    console.error('상담기록 조회 오류:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 상담기록 단일 조회
counseling.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = parseInt(c.req.param('id'));
    
    const result = await db.prepare(`
      SELECT 
        cr.*,
        m.name as member_name,
        m.member_number,
        m.phone
      FROM counseling cr
      JOIN members m ON cr.member_id = m.id
      WHERE cr.id = ?
    `).bind(id).first();
    
    if (!result) {
      return c.json({ error: '상담기록을 찾을 수 없습니다' }, 404);
    }
    
    return c.json(result);
  } catch (error: any) {
    console.error('상담기록 조회 오류:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 상담기록 생성
counseling.post('/', async (c) => {
  try {
    const db = c.env.DB;
    const { member_id, counseling_date, counseling_type, counselor, content, follow_up, is_private, recorded_by } = await c.req.json();
    
    if (!member_id || !counseling_date || !counselor || !content) {
      return c.json({ error: '필수 항목을 입력해주세요' }, 400);
    }
    
    const result = await db.prepare(`
      INSERT INTO counseling (
        member_id, counseling_date, counseling_type, counselor, 
        content, follow_up, is_private, recorded_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      member_id,
      counseling_date,
      counseling_type || '개인상담',
      counselor,
      content,
      follow_up || null,
      is_private !== undefined ? is_private : 1,
      recorded_by || null
    ).run();
    
    return c.json({ 
      message: '상담기록이 저장되었습니다',
      id: result.meta.last_row_id 
    });
  } catch (error: any) {
    console.error('상담기록 생성 오류:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 상담기록 수정
counseling.put('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = parseInt(c.req.param('id'));
    const { counseling_date, counseling_type, counselor, content, follow_up, is_private } = await c.req.json();
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (counseling_date) {
      updates.push('counseling_date = ?');
      params.push(counseling_date);
    }
    if (counseling_type) {
      updates.push('counseling_type = ?');
      params.push(counseling_type);
    }
    if (counselor) {
      updates.push('counselor = ?');
      params.push(counselor);
    }
    if (content) {
      updates.push('content = ?');
      params.push(content);
    }
    if (follow_up !== undefined) {
      updates.push('follow_up = ?');
      params.push(follow_up);
    }
    if (is_private !== undefined) {
      updates.push('is_private = ?');
      params.push(is_private);
    }
    
    if (updates.length === 0) {
      return c.json({ error: '수정할 내용이 없습니다' }, 400);
    }
    
    params.push(id);
    
    await db.prepare(`
      UPDATE counseling 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...params).run();
    
    return c.json({ message: '상담기록이 수정되었습니다' });
  } catch (error: any) {
    console.error('상담기록 수정 오류:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 상담기록 삭제
counseling.delete('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = parseInt(c.req.param('id'));
    
    await db.prepare('DELETE FROM counseling WHERE id = ?').bind(id).run();
    
    return c.json({ message: '상담기록이 삭제되었습니다' });
  } catch (error: any) {
    console.error('상담기록 삭제 오류:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default counseling;
