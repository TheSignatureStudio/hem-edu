import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';

const members = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 교인 조회
members.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const { status, search, family_id, group_id, limit = 100, offset = 0 } = c.req.query();
    
    let query = `
      SELECT 
        m.*,
        f.family_name
      FROM members m
      LEFT JOIN families f ON m.family_id = f.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (status) {
      query += ' AND m.member_status = ?';
      params.push(status);
    }
    
    if (family_id) {
      query += ' AND m.family_id = ?';
      params.push(Number(family_id));
    }
    
    if (group_id) {
      query += ' AND m.id IN (SELECT member_id FROM group_members WHERE group_id = ?)';
      params.push(Number(group_id));
    }
    
    if (search) {
      query += ' AND (m.name LIKE ? OR m.member_number LIKE ? OR m.phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY m.name LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ members: results });
  } catch (error) {
    console.error('Get members error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 다음 교인 번호 생성
members.get('/next-member-number', async (c) => {
  try {
    const db = c.env.DB;
    
    const currentYear = new Date().getFullYear();
    
    const lastMember = await db.prepare(`
      SELECT member_number 
      FROM members 
      WHERE member_number LIKE ?
      ORDER BY member_number DESC 
      LIMIT 1
    `).bind(`M${currentYear}%`).first();
    
    let nextNumber;
    if (lastMember) {
      const lastNumber = parseInt(lastMember.member_number.substring(5));
      nextNumber = `M${currentYear}${String(lastNumber + 1).padStart(3, '0')}`;
    } else {
      nextNumber = `M${currentYear}001`;
    }
    
    return c.json({ member_number: nextNumber });
  } catch (error) {
    console.error('Generate member number error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 특정 교인 상세 조회
members.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    // 교인 기본 정보
    const member = await db.prepare(`
      SELECT 
        m.*,
        f.family_name
      FROM members m
      LEFT JOIN families f ON m.family_id = f.id
      WHERE m.id = ?
    `).bind(id).first();
    
    if (!member) {
      return c.json({ error: 'Member not found' }, 404);
    }
    
    // 소속 구역/소그룹
    const groups = await db.prepare(`
      SELECT 
        g.id,
        g.name,
        g.group_type,
        gm.role,
        gm.joined_date
      FROM group_members gm
      JOIN groups g ON gm.group_id = g.id
      WHERE gm.member_id = ? AND gm.is_active = 1
    `).bind(id).all();
    
    // 최근 출석 기록 (최근 10개)
    const attendance = await db.prepare(`
      SELECT *
      FROM attendance
      WHERE member_id = ?
      ORDER BY attendance_date DESC
      LIMIT 10
    `).bind(id).all();
    
    // 상담 기록 (최근 5개, 비공개는 제외 가능)
    const counseling = await db.prepare(`
      SELECT *
      FROM counseling
      WHERE member_id = ?
      ORDER BY counseling_date DESC
      LIMIT 5
    `).bind(id).all();
    
    // 봉사 기록
    const services = await db.prepare(`
      SELECT *
      FROM services
      WHERE member_id = ?
      ORDER BY start_date DESC
    `).bind(id).all();
    
    // 헌금 통계 (최근 1년)
    const donationStats = await db.prepare(`
      SELECT 
        donation_type,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM donations
      WHERE member_id = ? 
        AND donation_date >= date('now', '-1 year')
      GROUP BY donation_type
    `).bind(id).all();
    
    return c.json({
      member,
      groups: groups.results,
      attendance: attendance.results,
      counseling: counseling.results,
      services: services.results,
      donationStats: donationStats.results
    });
  } catch (error) {
    console.error('Get member error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 교인 생성
members.post('/', async (c) => {
  try {
    const db = c.env.DB;
    const data = await c.req.json();
    
    // 필수 필드 검증
    if (!data.name || !data.member_number) {
      return c.json({ error: 'Missing required fields: name, member_number' }, 400);
    }
    
    // 교인 레코드 생성
    const result = await db.prepare(`
      INSERT INTO members (
        member_number, name, name_english, birth_date, gender, phone, email, address, zip_code,
        baptism_date, baptism_place, baptism_type, confession_date,
        registration_date, member_status, previous_church, transfer_date,
        family_id, family_role, current_service, service_history,
        photo_url, note, emergency_contact, emergency_contact_name
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.member_number,
      data.name,
      data.name_english || null,
      data.birth_date || null,
      data.gender || null,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.zip_code || null,
      data.baptism_date || null,
      data.baptism_place || null,
      data.baptism_type || null,
      data.confession_date || null,
      data.registration_date || null,
      data.member_status || 'active',
      data.previous_church || null,
      data.transfer_date || null,
      data.family_id || null,
      data.family_role || null,
      data.current_service || null,
      data.service_history || null,
      data.photo_url || null,
      data.note || null,
      data.emergency_contact || null,
      data.emergency_contact_name || null
    ).run();
    
    if (!result.success) {
      return c.json({ error: 'Failed to create member' }, 500);
    }
    
    const memberId = result.meta.last_row_id;
    
    return c.json({
      message: 'Member created successfully',
      memberId: memberId
    }, 201);
  } catch (error: any) {
    console.error('Create member error:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return c.json({ error: 'Member number already exists' }, 409);
    }
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// 교인 정보 수정
members.put('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const data = await c.req.json();
    
    const updates: string[] = [];
    const params: any[] = [];
    
    const allowedFields = [
      'name', 'name_english', 'birth_date', 'gender', 'phone', 'email', 'address', 'zip_code',
      'baptism_date', 'baptism_place', 'baptism_type', 'confession_date',
      'registration_date', 'member_status', 'previous_church', 'transfer_date',
      'family_id', 'family_role', 'current_service', 'service_history',
      'photo_url', 'note', 'emergency_contact', 'emergency_contact_name'
    ];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
    }
    
    if (updates.length > 0) {
      params.push(id);
      await db.prepare(
        `UPDATE members SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).bind(...params).run();
    }
    
    return c.json({ message: 'Member updated successfully' });
  } catch (error: any) {
    console.error('Update member error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// 교인 삭제
members.delete('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    await db.prepare('DELETE FROM members WHERE id = ?').bind(id).run();
    
    return c.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default members;


