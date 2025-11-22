import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth';

const informationAccess = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 미들웨어 적용
informationAccess.use('*', authMiddleware);

// 정보 열람 기록 생성
informationAccess.post('/log', async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { member_id, access_type = 'view', accessed_fields } = await c.req.json();
    
    if (!member_id) {
      return c.json({ error: 'member_id is required' }, 400);
    }
    
    // 요청 정보 가져오기
    const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';
    
    const result = await db.prepare(`
      INSERT INTO information_access_logs (
        accessed_by, accessed_member_id, access_type, accessed_fields, ip_address, user_agent
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      member_id,
      access_type,
      accessed_fields ? JSON.stringify(accessed_fields) : null,
      ipAddress,
      userAgent
    ).run();
    
    return c.json({ 
      message: 'Access logged successfully',
      id: result.meta.last_row_id 
    });
  } catch (error: any) {
    console.error('Log information access error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// 정보 열람 기록 조회 (최고관리자만)
informationAccess.get('/logs', requireSuperAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const { member_id, accessed_by, date_from, date_to, limit = 100, offset = 0 } = c.req.query();
    
    let query = `
      SELECT 
        l.*,
        u.name as accessed_by_name,
        u.username as accessed_by_username,
        m.name as member_name,
        m.member_number
      FROM information_access_logs l
      LEFT JOIN users u ON l.accessed_by = u.id
      LEFT JOIN members m ON l.accessed_member_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (member_id) {
      query += ' AND l.accessed_member_id = ?';
      params.push(Number(member_id));
    }
    
    if (accessed_by) {
      query += ' AND l.accessed_by = ?';
      params.push(Number(accessed_by));
    }
    
    if (date_from) {
      query += ' AND DATE(l.created_at) >= ?';
      params.push(date_from);
    }
    
    if (date_to) {
      query += ' AND DATE(l.created_at) <= ?';
      params.push(date_to);
    }
    
    query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ logs: results });
  } catch (error) {
    console.error('Get access logs error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 통계 조회 (최고관리자만)
informationAccess.get('/stats', requireSuperAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const { date_from, date_to } = c.req.query();
    
    let query = `
      SELECT 
        DATE(l.created_at) as date,
        COUNT(*) as total_access,
        COUNT(DISTINCT l.accessed_by) as unique_users,
        COUNT(DISTINCT l.accessed_member_id) as unique_members
      FROM information_access_logs l
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (date_from) {
      query += ' AND DATE(l.created_at) >= ?';
      params.push(date_from);
    }
    
    if (date_to) {
      query += ' AND DATE(l.created_at) <= ?';
      params.push(date_to);
    }
    
    query += ' GROUP BY DATE(l.created_at) ORDER BY date DESC';
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ stats: results });
  } catch (error) {
    console.error('Get access stats error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default informationAccess;

