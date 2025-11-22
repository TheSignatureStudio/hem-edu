import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';

const attendance = new Hono<{ Bindings: CloudflareBindings }>();

// 출석 기록 조회
attendance.get('/', async (c) => {
  try {
  const db = c.env.DB;
    const { member_id, service_type, date_from, date_to, limit = 100 } = c.req.query();
  
  let query = `
      SELECT 
        a.*,
        m.name as member_name,
        m.member_number
    FROM attendance a
      JOIN members m ON a.member_id = m.id
    WHERE 1=1
  `;
  const params: any[] = [];
  
    if (member_id) {
      query += ' AND a.member_id = ?';
      params.push(Number(member_id));
    }
    
    if (service_type) {
      query += ' AND a.service_type = ?';
      params.push(service_type);
    }
    
  if (date_from) {
    query += ' AND a.attendance_date >= ?';
    params.push(date_from);
  }
    
  if (date_to) {
    query += ' AND a.attendance_date <= ?';
    params.push(date_to);
  }
  
    query += ' ORDER BY a.attendance_date DESC, m.name LIMIT ?';
    params.push(Number(limit));
  
  const { results } = await db.prepare(query).bind(...params).all();
  return c.json({ attendance: results });
  } catch (error) {
    console.error('Get attendance error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 날짜별 출석 조회
attendance.get('/by-date', async (c) => {
  try {
    const db = c.env.DB;
    const { date, service_type = '주일예배' } = c.req.query();
    
    if (!date) {
      return c.json({ error: 'date parameter is required' }, 400);
    }
    
    // 모든 활성 교인과 해당 날짜의 출석 기록
    const query = `
      SELECT 
        m.id as member_id,
        m.member_number,
        m.name,
        m.phone,
        m.family_id,
        f.family_name,
        a.id as attendance_id,
        a.status,
        a.note,
        a.service_type
      FROM members m
      LEFT JOIN families f ON m.family_id = f.id
      LEFT JOIN attendance a ON m.id = a.member_id 
        AND a.attendance_date = ? 
        AND a.service_type = ?
      WHERE m.member_status = 'active'
      ORDER BY m.name
    `;
    
    const { results } = await db.prepare(query).bind(date, service_type).all();
    return c.json({ members: results });
  } catch (error) {
    console.error('Get by-date attendance error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 출석 통계
attendance.get('/stats', async (c) => {
  try {
    const db = c.env.DB;
    const { date_from, date_to, service_type } = c.req.query();
    
    let query = `
      SELECT 
        service_type,
        attendance_date,
        status,
        COUNT(*) as count
      FROM attendance
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (date_from) {
      query += ' AND attendance_date >= ?';
      params.push(date_from);
    }
    
    if (date_to) {
      query += ' AND attendance_date <= ?';
      params.push(date_to);
    }
    
    if (service_type) {
      query += ' AND service_type = ?';
      params.push(service_type);
    }
    
    query += ' GROUP BY service_type, attendance_date, status ORDER BY attendance_date DESC';
    
    const { results } = await db.prepare(query).bind(...params).all();
    return c.json({ stats: results });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 출석 체크 (단일)
attendance.post('/', async (c) => {
  try {
  const db = c.env.DB;
    const { member_id, attendance_date, service_type, status, note, recorded_by } = await c.req.json();
    
    if (!member_id || !attendance_date || !service_type || !status) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
  
  const result = await db.prepare(`
      INSERT INTO attendance (member_id, attendance_date, service_type, status, note, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(member_id, attendance_date, service_type) 
    DO UPDATE SET status = ?, note = ?, recorded_by = ?
    `).bind(
      member_id, 
      attendance_date, 
      service_type, 
      status, 
      note || null, 
      recorded_by,
      status, 
      note || null, 
      recorded_by
    ).run();
    
    return c.json({ 
      message: 'Attendance recorded', 
      id: result.meta.last_row_id 
    });
  } catch (error) {
    console.error('Post attendance error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 일괄 출석 체크
attendance.post('/bulk', async (c) => {
  try {
  const db = c.env.DB;
    const { attendance_date, service_type, records, recorded_by } = await c.req.json();
    
    if (!attendance_date || !service_type || !records) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // records: [{ member_id, status, note }]
  for (const record of records) {
    await db.prepare(`
        INSERT INTO attendance (member_id, attendance_date, service_type, status, note, recorded_by)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(member_id, attendance_date, service_type)
      DO UPDATE SET status = ?, note = ?, recorded_by = ?
    `).bind(
        record.member_id,
      attendance_date,
        service_type,
      record.status,
      record.note || null,
      recorded_by,
      record.status,
      record.note || null,
      recorded_by
    ).run();
  }
  
  return c.json({ message: 'Bulk attendance recorded' });
  } catch (error: any) {
    console.error('Bulk attendance error:', error);
    console.error('Error details:', {
      message: error?.message,
      cause: error?.cause,
      stack: error?.stack,
      name: error?.name
    });
    
    // 데이터베이스 제약 조건 에러인 경우 더 자세한 정보 제공
    let errorMessage = 'Internal server error';
    if (error?.message) {
      errorMessage = error.message;
      // CHECK constraint 에러인 경우
      if (error.message.includes('CHECK constraint')) {
        errorMessage = `데이터베이스 제약 조건 오류: ${error.message}. 시스템 설정에서 예배 구분을 확인해주세요.`;
      } else if (error.message.includes('UNIQUE constraint')) {
        errorMessage = `중복된 출석 기록입니다: ${error.message}`;
      } else if (error.message.includes('FOREIGN KEY constraint')) {
        errorMessage = `잘못된 데이터입니다: ${error.message}`;
      }
    }
    
    return c.json({ 
      error: errorMessage,
      details: error?.message,
      type: error?.name || 'DatabaseError'
    }, 500);
  }
});

// 출석 삭제
attendance.delete('/:id', async (c) => {
  try {
  const db = c.env.DB;
    const id = c.req.param('id');
    
    await db.prepare('DELETE FROM attendance WHERE id = ?').bind(id).run();
    
    return c.json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default attendance;
