import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';

const groups = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 구역/소그룹 조회
groups.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const { group_type, is_active } = c.req.query();
    
    let query = `
      SELECT 
        g.*,
        m.name as leader_name,
        COUNT(gm.id) as member_count
      FROM groups g
      LEFT JOIN members m ON g.leader_member_id = m.id
      LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.is_active = 1
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (group_type) {
      query += ' AND g.group_type = ?';
      params.push(group_type);
    }
    
    if (is_active !== undefined) {
      query += ' AND g.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    
    query += ' GROUP BY g.id ORDER BY g.group_type, g.name';
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ groups: results });
  } catch (error) {
    console.error('Get groups error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 특정 구역/소그룹 상세 조회
groups.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    // 그룹 기본 정보
    const group = await db.prepare(`
      SELECT 
        g.*,
        m.name as leader_name,
        m.phone as leader_phone
      FROM groups g
      LEFT JOIN members m ON g.leader_member_id = m.id
      WHERE g.id = ?
    `).bind(id).first();
    
    if (!group) {
      return c.json({ error: 'Group not found' }, 404);
    }
    
    // 그룹 회원 목록
    const members = await db.prepare(`
      SELECT 
        gm.*,
        m.name,
        m.phone,
        m.gender,
        m.birth_date
      FROM group_members gm
      JOIN members m ON gm.member_id = m.id
      WHERE gm.group_id = ? AND gm.is_active = 1
      ORDER BY 
        CASE gm.role
          WHEN '리더' THEN 1
          WHEN '부리더' THEN 2
          ELSE 3
        END,
        m.name
    `).bind(id).all();
    
    return c.json({
      group,
      members: members.results
    });
  } catch (error) {
    console.error('Get group error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 구역/소그룹 생성
groups.post('/', async (c) => {
  try {
    const db = c.env.DB;
    const data = await c.req.json();
    
    if (!data.name || !data.group_type) {
      return c.json({ error: 'Missing required fields: name, group_type' }, 400);
    }
    
    const result = await db.prepare(`
      INSERT INTO groups (
        name, group_type, leader_member_id, description,
        meeting_day, meeting_time, meeting_place, is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.group_type,
      data.leader_member_id || null,
      data.description || null,
      data.meeting_day || null,
      data.meeting_time || null,
      data.meeting_place || null,
      data.is_active !== undefined ? data.is_active : 1
    ).run();
    
    if (!result.success) {
      return c.json({ error: 'Failed to create group' }, 500);
    }
    
    return c.json({
      message: 'Group created successfully',
      groupId: result.meta.last_row_id
    }, 201);
  } catch (error: any) {
    console.error('Create group error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// 구역/소그룹 수정
groups.put('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const data = await c.req.json();
    
    const updates: string[] = [];
    const params: any[] = [];
    
    const allowedFields = [
      'name', 'group_type', 'leader_member_id', 'description',
      'meeting_day', 'meeting_time', 'meeting_place', 'is_active'
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
        `UPDATE groups SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...params).run();
    }
    
    return c.json({ message: 'Group updated successfully' });
  } catch (error: any) {
    console.error('Update group error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// 그룹에 회원 추가
groups.post('/:id/members', async (c) => {
  try {
    const db = c.env.DB;
    const groupId = c.req.param('id');
    const { member_id, role } = await c.req.json();
    
    if (!member_id) {
      return c.json({ error: 'Missing required field: member_id' }, 400);
    }
    
    await db.prepare(`
      INSERT INTO group_members (group_id, member_id, role, joined_date, is_active)
      VALUES (?, ?, ?, date('now'), 1)
    `).bind(groupId, member_id, role || '회원').run();
    
    return c.json({ message: 'Member added to group successfully' });
  } catch (error: any) {
    console.error('Add group member error:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return c.json({ error: 'Member already in this group' }, 409);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 그룹에서 회원 제거
groups.delete('/:groupId/members/:memberId', async (c) => {
  try {
    const db = c.env.DB;
    const groupId = c.req.param('groupId');
    const memberId = c.req.param('memberId');
    
    await db.prepare(`
      UPDATE group_members 
      SET is_active = 0 
      WHERE group_id = ? AND member_id = ?
    `).bind(groupId, memberId).run();
    
    return c.json({ message: 'Member removed from group successfully' });
  } catch (error) {
    console.error('Remove group member error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default groups;


