import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';

const attendance = new Hono<{ Bindings: CloudflareBindings }>();

// 출석 기록 조회
attendance.get('/', async (c) => {
  const db = c.env.DB;
  const { student_id, course_id, date_from, date_to } = c.req.query();
  
  let query = `
    SELECT a.*, e.student_id, e.course_id, s.student_number, u.name as student_name, c.course_name
    FROM attendance a
    JOIN enrollments e ON a.enrollment_id = e.id
    JOIN students s ON e.student_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN courses c ON e.course_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];
  
  if (student_id) {
    query += ' AND e.student_id = ?';
    params.push(Number(student_id));
  }
  if (course_id) {
    query += ' AND e.course_id = ?';
    params.push(Number(course_id));
  }
  if (date_from) {
    query += ' AND a.attendance_date >= ?';
    params.push(date_from);
  }
  if (date_to) {
    query += ' AND a.attendance_date <= ?';
    params.push(date_to);
  }
  
  query += ' ORDER BY a.attendance_date DESC';
  
  const { results } = await db.prepare(query).bind(...params).all();
  return c.json({ attendance: results });
});

// 출석 체크
attendance.post('/', async (c) => {
  const db = c.env.DB;
  const { enrollment_id, attendance_date, status, note, recorded_by } = await c.req.json();
  
  const result = await db.prepare(`
    INSERT INTO attendance (enrollment_id, attendance_date, status, note, recorded_by)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(enrollment_id, attendance_date) 
    DO UPDATE SET status = ?, note = ?, recorded_by = ?
  `).bind(enrollment_id, attendance_date, status, note || null, recorded_by, status, note || null, recorded_by).run();
  
  return c.json({ message: 'Attendance recorded', id: result.meta.last_row_id });
});

// 일괄 출석 체크 (반 전체)
attendance.post('/bulk', async (c) => {
  const db = c.env.DB;
  const { course_id, attendance_date, records, recorded_by } = await c.req.json();
  
  // records: [{ enrollment_id, status, note }]
  for (const record of records) {
    await db.prepare(`
      INSERT INTO attendance (enrollment_id, attendance_date, status, note, recorded_by)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(enrollment_id, attendance_date)
      DO UPDATE SET status = ?, note = ?, recorded_by = ?
    `).bind(
      record.enrollment_id,
      attendance_date,
      record.status,
      record.note || null,
      recorded_by,
      record.status,
      record.note || null,
      recorded_by
    ).run();
  }
  
  return c.json({ message: 'Bulk attendance recorded' });
});

// 날짜별 학생 출석 체크용 API (간단 버전)
attendance.get('/by-date', async (c) => {
  const db = c.env.DB;
  const { date } = c.req.query();
  
  if (!date) {
    return c.json({ error: 'date parameter is required' }, 400);
  }
  
  // 모든 학생과 해당 날짜의 출석 기록을 가져옴
  const query = `
    SELECT 
      s.id as student_id,
      s.student_number,
      u.name as student_name,
      s.grade,
      cl.name as class_name,
      COALESCE(
        (
          SELECT a.status 
          FROM attendance a
          JOIN enrollments e ON a.enrollment_id = e.id
          WHERE e.student_id = s.id 
          AND a.attendance_date = ?
          LIMIT 1
        ),
        'not_recorded'
      ) as status,
      COALESCE(
        (
          SELECT a.note
          FROM attendance a
          JOIN enrollments e ON a.enrollment_id = e.id
          WHERE e.student_id = s.id 
          AND a.attendance_date = ?
          LIMIT 1
        ),
        ''
      ) as notes
    FROM students s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN student_class_history sch ON s.id = sch.student_id 
      AND sch.semester_id = (SELECT id FROM semesters WHERE is_current = 1 LIMIT 1)
    LEFT JOIN classes cl ON sch.class_id = cl.id
    WHERE s.status IN ('active', 'enrolled')
    ORDER BY s.student_number
  `;
  
  const { results } = await db.prepare(query).bind(date, date).all();
  return c.json({ success: true, attendance: results });
});

// 학생별 출석 저장 (간단 버전)
attendance.post('/simple', async (c) => {
  const db = c.env.DB;
  const { student_id, attendance_date, status, notes } = await c.req.json();
  
  if (!student_id || !attendance_date || !status) {
    return c.json({ error: 'student_id, attendance_date, and status are required' }, 400);
  }
  
  // 현재 학생의 enrollment 찾기 (아무 과목이나)
  const enrollment = await db.prepare(`
    SELECT id FROM enrollments 
    WHERE student_id = ? 
    LIMIT 1
  `).bind(student_id).first();
  
  if (!enrollment) {
    // enrollment가 없으면 임시로 하나 생성 (나중에 제대로 처리 필요)
    return c.json({ error: 'Student has no enrollments' }, 400);
  }
  
  // 출석 저장
  const result = await db.prepare(`
    INSERT INTO attendance (enrollment_id, attendance_date, status, note, recorded_by)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(enrollment_id, attendance_date)
    DO UPDATE SET status = ?, note = ?
  `).bind(
    enrollment.id,
    attendance_date,
    status,
    notes || null,
    1, // TODO: 실제 로그인한 사용자 ID
    status,
    notes || null
  ).run();
  
  return c.json({ success: true, message: 'Attendance recorded' });
});

// 일괄 출석 저장 (날짜별 전체 학생)
attendance.post('/bulk-simple', async (c) => {
  const db = c.env.DB;
  const { attendance_date, records } = await c.req.json();
  
  if (!attendance_date || !records || !Array.isArray(records)) {
    return c.json({ error: 'attendance_date and records array are required' }, 400);
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const record of records) {
    try {
      const { student_id, status, notes } = record;
      
      // 학생의 enrollment 찾기 (우선순위: 현재 학기)
      let enrollment = await db.prepare(`
        SELECT e.id FROM enrollments e
        JOIN courses co ON e.course_id = co.id
        JOIN semesters sem ON co.semester_id = sem.id
        WHERE e.student_id = ? AND sem.is_current = TRUE
        LIMIT 1
      `).bind(student_id).first();
      
      // 현재 학기 enrollment가 없으면 아무 enrollment나 사용
      if (!enrollment) {
        enrollment = await db.prepare(`
          SELECT id FROM enrollments 
          WHERE student_id = ? 
          LIMIT 1
        `).bind(student_id).first();
      }
      
      // enrollment가 아예 없으면 임시로 더미 enrollment 생성
      if (!enrollment) {
        // 현재 학기 찾기
        const currentSemester = await db.prepare(`
          SELECT id FROM semesters WHERE is_current = TRUE LIMIT 1
        `).first();
        
        if (!currentSemester) {
          errorCount++;
          console.error('No current semester found for student:', student_id);
          continue;
        }
        
        // 기본 과목 찾기 (또는 생성)
        let defaultCourse = await db.prepare(`
          SELECT id FROM courses 
          WHERE semester_id = ? AND subject_id = 1 
          LIMIT 1
        `).bind(currentSemester.id).first();
        
        if (!defaultCourse) {
          // 기본 과목이 없으면 생성
          const courseResult = await db.prepare(`
            INSERT INTO courses (semester_id, subject_id, teacher_id)
            VALUES (?, 1, 1)
          `).bind(currentSemester.id).run();
          defaultCourse = { id: courseResult.meta.last_row_id };
        }
        
        // enrollment 생성
        const enrollmentResult = await db.prepare(`
          INSERT INTO enrollments (student_id, course_id)
          VALUES (?, ?)
        `).bind(student_id, defaultCourse.id).run();
        
        enrollment = { id: enrollmentResult.meta.last_row_id };
      }
      
      // 출석 기록 저장
      await db.prepare(`
        INSERT INTO attendance (enrollment_id, attendance_date, status, note, recorded_by)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(enrollment_id, attendance_date)
        DO UPDATE SET status = ?, note = ?
      `).bind(
        enrollment.id,
        attendance_date,
        status,
        notes || null,
        1, // TODO: 실제 로그인한 사용자 ID
        status,
        notes || null
      ).run();
      successCount++;
    } catch (err) {
      errorCount++;
      console.error('Error recording attendance for student:', record.student_id, err);
    }
  }
  
  return c.json({ 
    success: true, 
    message: `${successCount} records saved, ${errorCount} errors`,
    successCount,
    errorCount
  });
});

export default attendance;
