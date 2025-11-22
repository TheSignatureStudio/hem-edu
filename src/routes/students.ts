import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';

const students = new Hono<{ Bindings: CloudflareBindings }>();

// 모든 학생 조회
students.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const { grade, class_id, semester_id, status, search, limit = 50, offset = 0 } = c.req.query();
    
    // 학생의 반 정보를 students.class_id에서 직접 가져옴
    let query = `
      SELECT 
        s.*,
        u.name,
        u.email,
        u.phone,
        c.name as class_name,
        c.grade as current_class_grade
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (grade) {
      query += ' AND s.grade = ?';
      params.push(Number(grade));
    }
    
    if (class_id) {
      query += ' AND s.class_id = ?';
      params.push(Number(class_id));
    }
    
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (u.name LIKE ? OR s.student_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY s.grade, s.student_number LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    
    const { results } = await db.prepare(query).bind(...params).all();
    
    return c.json({ students: results });
  } catch (error) {
    console.error('Get students error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 다음 학번 생성
students.get('/next-student-number', async (c) => {
  try {
    const db = c.env.DB;
    
    // 현재 연도
    const currentYear = new Date().getFullYear();
    
    // 해당 연도의 마지막 학번 조회
    const lastStudent = await db.prepare(`
      SELECT student_number 
      FROM students 
      WHERE student_number LIKE ?
      ORDER BY student_number DESC 
      LIMIT 1
    `).bind(`S${currentYear}%`).first();
    
    let nextNumber;
    if (lastStudent) {
      // 마지막 학번에서 숫자 부분 추출하여 +1
      const lastNumber = parseInt(lastStudent.student_number.substring(5)); // 'S2024001' -> '001' -> 1
      nextNumber = `S${currentYear}${String(lastNumber + 1).padStart(3, '0')}`;
    } else {
      // 해당 연도의 첫 학생
      nextNumber = `S${currentYear}001`;
    }
    
    return c.json({ student_number: nextNumber });
  } catch (error) {
    console.error('Generate student number error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// user_id로 학생 조회
students.get('/user/:userId', async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.req.param('userId');
    
    // user_id로 학생 정보 조회
    const student = await db.prepare(`
      SELECT 
        s.*,
        u.name,
        u.email,
        u.phone,
        c.name as class_name,
        c.grade as current_class_grade
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.user_id = ?
    `).bind(userId).first();
    
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }
    
    return c.json({ student });
  } catch (error) {
    console.error('Get student by user_id error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 특정 학생 상세 조회
students.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    
    // 학생 기본 정보 (students.class_id에서 직접 반 정보 가져옴)
    const student = await db.prepare(`
      SELECT 
        s.*,
        u.name,
        u.email,
        u.phone,
        c.name as class_name,
        c.grade as current_class_grade
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `).bind(id).first();
    
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }
    
    // 반 배정 이력
    const classHistory = await db.prepare(`
      SELECT 
        sch.*,
        c.name as class_name,
        c.grade,
        sem.name as semester_name,
        sem.year,
        sem.semester
      FROM student_class_history sch
      JOIN classes c ON sch.class_id = c.id
      JOIN semesters sem ON sch.semester_id = sem.id
      WHERE sch.student_id = ?
      ORDER BY sem.year DESC, sem.semester DESC
    `).bind(id).all();
    
    // 학부모 정보
    const parents = await db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, ps.relationship, ps.is_primary
      FROM parent_student ps
      JOIN users u ON ps.parent_user_id = u.id
      WHERE ps.student_id = ?
    `).bind(id).all();
    
    // 수강 과목
    const enrollments = await db.prepare(`
      SELECT e.*, c.course_name, s.name as subject_name, u.name as teacher_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN subjects s ON c.subject_id = s.id
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE e.student_id = ? AND e.status = 'active'
    `).bind(id).all();
    
    // 동아리 활동
    const clubs = await db.prepare(`
      SELECT cl.name, cl.description, cm.role, cm.joined_date
      FROM club_members cm
      JOIN clubs cl ON cm.club_id = cl.id
      WHERE cm.student_id = ?
    `).bind(id).all();
    
    // 봉사활동 통계
    const volunteerStats = await db.prepare(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(hours) as total_hours,
        SUM(hours) as approved_hours
      FROM volunteer_activities
      WHERE student_id = ?
    `).bind(id).first();
    
    return c.json({
      student,
      classHistory: classHistory.results,
      parents: parents.results,
      enrollments: enrollments.results,
      clubs: clubs.results,
      volunteerStats
    });
  } catch (error) {
    console.error('Get student error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 학생 생성 (관리자 전용)
students.post('/', async (c) => {
  try {
    const db = c.env.DB;
    const data = await c.req.json();
    
    // 필수 필드 검증
    if (!data.name || !data.email || !data.student_number) {
      return c.json({ error: 'Missing required fields: name, email, student_number' }, 400);
    }
    
    // 신규 학생인 경우 계정도 함께 생성
    let userId = data.user_id;
    
    if (!userId && data.username && data.password) {
      // 사용자 계정 생성
      const userResult = await db.prepare(`
        INSERT INTO users (username, password_hash, email, name, role, phone)
        VALUES (?, ?, ?, ?, 'student', ?)
      `).bind(
        data.username,
        data.password, // 실제로는 해시해야 함
        data.email,
        data.name,
        data.phone || null
      ).run();
      
      if (!userResult.success) {
        return c.json({ error: 'Failed to create user account' }, 500);
      }
      
      userId = userResult.meta.last_row_id;
    } else if (!userId) {
      return c.json({ error: 'User ID or username/password required' }, 400);
    }
    
    // 학생 레코드 생성
    const result = await db.prepare(`
      INSERT INTO students (
        user_id, student_number, grade, admission_date, graduation_date, status,
        address, emergency_contact,
        birthdate, gender, blood_type, religion, nationality,
        guardian_name, guardian_relation, guardian_phone, guardian_email, guardian_address,
        previous_school, previous_school_type,
        medical_notes, allergy_info, special_notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      data.student_number,
      data.grade || null,
      data.admission_date || null,
      data.graduation_date || null,
      data.status || 'enrolled',
      data.address || null,
      data.emergency_contact || null,
      data.birthdate || null,
      data.gender || null,
      data.blood_type || null,
      data.religion || null,
      data.nationality || 'KR',
      data.guardian_name || null,
      data.guardian_relation || null,
      data.guardian_phone || null,
      data.guardian_email || null,
      data.guardian_address || null,
      data.previous_school || null,
      data.previous_school_type || null,
      data.medical_notes || null,
      data.allergy_info || null,
      data.special_notes || null
    ).run();
    
    if (!result.success) {
      return c.json({ error: 'Failed to create student' }, 500);
    }
    
    const studentId = result.meta.last_row_id;
    
    // 반 배정이 있는 경우 student_class_history에 기록
    if (data.class_id && data.semester_id) {
      await db.prepare(`
        INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
        VALUES (?, ?, ?, ?, 1)
      `).bind(
        studentId,
        data.class_id,
        data.semester_id,
        data.admission_date || new Date().toISOString().split('T')[0]
      ).run();
    }
    
    return c.json({
      message: 'Student created successfully',
      studentId: studentId,
      userId: userId
    }, 201);
  } catch (error: any) {
    console.error('Create student error:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return c.json({ error: 'Username, email or student number already exists' }, 409);
    }
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// 학생 정보 수정
students.put('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const data = await c.req.json();
    
    // 먼저 학생 정보 조회 (user_id 가져오기)
    const student = await db.prepare(`
      SELECT user_id FROM students WHERE id = ?
    `).bind(id).first();
    
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }
    
    // users 테이블 업데이트
    const userUpdates: string[] = [];
    const userParams: any[] = [];
    const userFields = ['name', 'email', 'phone'];
    
    for (const field of userFields) {
      if (data[field] !== undefined) {
        userUpdates.push(`${field} = ?`);
        userParams.push(data[field]);
      }
    }
    
    if (userUpdates.length > 0) {
      userParams.push(student.user_id);
      await db.prepare(
        `UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`
      ).bind(...userParams).run();
    }
    
    // students 테이블 업데이트
    const updates: string[] = [];
    const params: any[] = [];
    
    const allowedFields = [
      'grade', 'status', 'address', 'emergency_contact', 'admission_date', 'graduation_date',
      'birthdate', 'gender', 'blood_type', 'religion', 'nationality',
      'guardian_name', 'guardian_relation', 'guardian_phone', 'guardian_email', 'guardian_address',
      'previous_school', 'previous_school_type',
      'medical_notes', 'allergy_info', 'special_notes'
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
        `UPDATE students SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...params).run();
    }
    
    // 반 변경이 요청된 경우 student_class_history 업데이트
    if (data.class_id !== undefined && data.semester_id !== undefined) {
      // 현재 학기의 기존 배정 비활성화
      await db.prepare(`
        UPDATE student_class_history 
        SET is_active = 0, end_date = date('now')
        WHERE student_id = ? AND semester_id = ? AND is_active = 1
      `).bind(id, data.semester_id).run();
      
      // 새로운 반 배정
      if (data.class_id !== null) {
        await db.prepare(`
          INSERT INTO student_class_history (student_id, class_id, semester_id, start_date, is_active)
          VALUES (?, ?, ?, date('now'), 1)
        `).bind(id, data.class_id, data.semester_id).run();
      }
    }
    
    return c.json({ message: 'Student updated successfully' });
  } catch (error: any) {
    console.error('Update student error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// 학부모-학생 연결
students.post('/:id/parents', async (c) => {
  try {
    const db = c.env.DB;
    const studentId = c.req.param('id');
    const { parent_user_id, relationship, is_primary } = await c.req.json();
    
    if (!parent_user_id || !relationship) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    await db.prepare(`
      INSERT INTO parent_student (parent_user_id, student_id, relationship, is_primary)
      VALUES (?, ?, ?, ?)
    `).bind(parent_user_id, studentId, relationship, is_primary ? 1 : 0).run();
    
    return c.json({ message: 'Parent linked successfully' });
  } catch (error) {
    console.error('Link parent error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default students;
