import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';
import { authMiddleware, requireDepartmentAccess } from '../middleware/auth';

const classes = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 미들웨어 적용
classes.use('*', authMiddleware);

// 모든 반 조회 (부서별 필터링)
classes.get('/', requireDepartmentAccess, async (c) => {
  try {
    const db = c.env.DB;
    const userDepartmentId = c.get('userDepartmentId');
    const isSuperAdmin = c.get('isSuperAdmin');
    const { grade_level, is_active, department_id } = c.req.query();
    
    let query = `
      SELECT 
        c.*,
        d.name as department_name,
        COUNT(m.id) as student_count
      FROM classes c
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN members m ON c.id = m.class_id AND m.member_status = 'active'
      WHERE 1=1
    `;
    const params: any[] = [];
    
    // 최고관리자가 아니면 자신의 부서만 조회
    if (!isSuperAdmin && userDepartmentId) {
      query += ' AND c.department_id = ?';
      params.push(userDepartmentId);
    } else if (department_id) {
      query += ' AND c.department_id = ?';
      params.push(Number(department_id));
    }
    
    if (grade_level) {
      query += ' AND c.grade_level = ?';
      params.push(grade_level);
    }
    
    if (is_active !== undefined) {
      query += ' AND c.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    
    query += ' GROUP BY c.id ORDER BY c.id';
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ classes: results || [] });
  } catch (error: any) {
    console.error('Get classes error:', error);
    return c.json({ error: error?.message || 'Internal server error', classes: [] }, 500);
  }
});

// 특정 반 상세 조회
classes.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    // 반 기본 정보
    const classInfo = await db.prepare(`
      SELECT * FROM classes WHERE id = ?
    `).bind(id).first();
    
    if (!classInfo) {
      return c.json({ error: 'Class not found' }, 404);
    }
    
    // 반 학생 목록
    const { results: students } = await db.prepare(`
      SELECT 
        m.*
      FROM members m
      WHERE m.class_id = ? AND m.member_status = 'active'
      ORDER BY m.birth_date
    `).bind(id).all();
    
    return c.json({
      class: classInfo,
      students: students
    });
  } catch (error) {
    console.error('Get class error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 반 생성
classes.post('/', requireDepartmentAccess, async (c) => {
  try {
    const db = c.env.DB;
    const userDepartmentId = c.get('userDepartmentId');
    const isSuperAdmin = c.get('isSuperAdmin');
    const { name, grade_level, department_id, teacher_name, teacher_phone, room_number, meeting_time, description } = await c.req.json();
    
    if (!name || !grade_level) {
      return c.json({ error: 'Missing required fields: name, grade_level' }, 400);
    }
    
    // 부서 ID 설정 (최고관리자가 아니면 자신의 부서로 고정)
    const finalDepartmentId = (!isSuperAdmin && userDepartmentId) ? userDepartmentId : (department_id || null);
    
    const result = await db.prepare(`
      INSERT INTO classes (name, grade_level, department_id, teacher_name, teacher_phone, room_number, meeting_time, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name,
      grade_level,
      finalDepartmentId,
      teacher_name || null,
      teacher_phone || null,
      room_number || null,
      meeting_time || null,
      description || null
    ).run();
    
    if (!result.success) {
      return c.json({ error: 'Failed to create class' }, 500);
    }
    
    return c.json({
      message: 'Class created successfully',
      classId: result.meta.last_row_id
    }, 201);
  } catch (error: any) {
    console.error('Create class error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// 반 수정
classes.put('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const data = await c.req.json();
    
    const updates: string[] = [];
    const params: any[] = [];
    
    const allowedFields = [
      'name', 'grade_level', 'department_id', 'teacher_name', 'teacher_phone', 
      'room_number', 'meeting_time', 'description', 'is_active'
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
        `UPDATE classes SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...params).run();
    }
    
    return c.json({ message: 'Class updated successfully' });
  } catch (error: any) {
    console.error('Update class error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// 반 삭제
classes.delete('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    // 학생이 있는지 확인
    const { results } = await db.prepare(
      'SELECT COUNT(*) as count FROM members WHERE class_id = ?'
    ).bind(id).all();
    
    if (results && results[0] && (results[0] as any).count > 0) {
      return c.json({ error: '학생이 배정된 반은 삭제할 수 없습니다.' }, 400);
    }
    
    await db.prepare('DELETE FROM classes WHERE id = ?').bind(id).run();
    
    return c.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 학생 반 배정
classes.post('/:id/assign', async (c) => {
  try {
    const db = c.env.DB;
    const classId = c.req.param('id');
    const { member_id } = await c.req.json();
    
    if (!member_id) {
      return c.json({ error: 'Missing required field: member_id' }, 400);
    }
    
    await db.prepare(`
      UPDATE members SET class_id = ? WHERE id = ?
    `).bind(classId, member_id).run();
    
    return c.json({ message: 'Student assigned to class successfully' });
  } catch (error) {
    console.error('Assign student error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 학생 반 배정 해제
classes.delete('/:id/assign/:memberId', async (c) => {
  try {
    const db = c.env.DB;
    const memberId = c.req.param('memberId');
    
    await db.prepare(`
      UPDATE members SET class_id = NULL WHERE id = ?
    `).bind(memberId).run();
    
    return c.json({ message: 'Student unassigned from class successfully' });
  } catch (error) {
    console.error('Unassign student error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 학년 자동 갱신 (매년 실행)
classes.post('/update-grades', async (c) => {
  try {
    const db = c.env.DB;
    
    // grade_override가 0인 학생들의 학년을 생년월일 기준으로 자동 계산
    const { results: members } = await db.prepare(`
      SELECT id, birth_date, school_grade 
      FROM members 
      WHERE member_status = 'active' 
        AND birth_date IS NOT NULL 
        AND grade_override = 0
    `).all();
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    for (const member of members as any[]) {
      const birthYear = new Date(member.birth_date).getFullYear();
      let age = currentYear - birthYear;
      
      // 3월 이전이면 나이에서 1을 뺌 (학년은 3월 기준)
      if (currentMonth < 3) {
        age -= 1;
      }
      
      let newGrade = '';
      
      if (age <= 3) {
        newGrade = '영아부';
      } else if (age <= 6) {
        newGrade = '유치부';
      } else if (age <= 7) {
        newGrade = '유년부';
      } else if (age <= 13) {
        const grade = age - 7;
        newGrade = `초${grade}`;
      } else if (age <= 16) {
        const grade = age - 13;
        newGrade = `중${grade}`;
      } else if (age <= 19) {
        const grade = age - 16;
        newGrade = `고${grade}`;
      } else {
        newGrade = '청년부';
      }
      
      // 학년이 변경된 경우에만 업데이트
      if (newGrade !== member.school_grade) {
        await db.prepare(`
          UPDATE members SET school_grade = ? WHERE id = ?
        `).bind(newGrade, member.id).run();
      }
    }
    
    return c.json({ message: 'Grades updated successfully' });
  } catch (error) {
    console.error('Update grades error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default classes;

