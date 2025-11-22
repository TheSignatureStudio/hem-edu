import { Context, Next } from 'hono';
import type { CloudflareBindings } from '../types/bindings';

// JWT 토큰 검증 및 사용자 정보 추출
export async function authMiddleware(c: Context<{ Bindings: CloudflareBindings }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    // 간단한 JWT 디코딩 (실제 프로덕션에서는 서명 검증 필요)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // 토큰 만료 확인
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return c.json({ error: 'Unauthorized: Token expired' }, 401);
    }
    
    // 사용자 정보를 컨텍스트에 저장
    c.set('userId', payload.userId);
    c.set('userRole', payload.role);
    c.set('userDepartmentId', payload.departmentId);
    c.set('isSuperAdmin', payload.isSuperAdmin || false);
    
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
}

// 역할 기반 접근 제어
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context<{ Bindings: CloudflareBindings }>, next: Next) => {
    const userRole = c.get('userRole');
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return c.json({ 
        error: 'Forbidden: Insufficient permissions',
        required_roles: allowedRoles,
        your_role: userRole
      }, 403);
    }
    
    await next();
  };
}

// 담임 교사 권한 확인
export async function requireHomeroomTeacher(c: Context<{ Bindings: CloudflareBindings }>, next: Next) {
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const classId = c.req.param('class_id') || c.req.query('class_id');
  
  // super_admin과 admin은 모든 반 접근 가능
  if (userRole === 'super_admin' || userRole === 'admin') {
    await next();
    return;
  }
  
  // 교사인 경우 담임 반 확인
  if (userRole === 'teacher' && classId) {
    const { DB } = c.env;
    
    // 교사 ID 조회
    const teacher = await DB.prepare(`
      SELECT id FROM teachers WHERE user_id = ?
    `).bind(userId).first();
    
    if (!teacher) {
      return c.json({ error: 'Teacher not found' }, 404);
    }
    
    // 현재 학기에 이 반의 담임인지 확인
    const homeroom = await DB.prepare(`
      SELECT th.id
      FROM teacher_homeroom th
      JOIN semesters s ON th.semester_id = s.id
      WHERE th.teacher_id = ? 
        AND th.class_id = ? 
        AND s.is_active = 1
    `).bind(teacher.id, classId).first();
    
    if (!homeroom) {
      return c.json({ 
        error: 'Forbidden: You are not the homeroom teacher of this class' 
      }, 403);
    }
    
    await next();
    return;
  }
  
  return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
}

// 과목 교사 권한 확인
export async function requireCourseTeacher(c: Context<{ Bindings: CloudflareBindings }>, next: Next) {
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const courseId = c.req.param('course_id') || c.req.query('course_id');
  
  // super_admin과 admin은 모든 과목 접근 가능
  if (userRole === 'super_admin' || userRole === 'admin') {
    await next();
    return;
  }
  
  // 교사인 경우 과목 담당 확인
  if (userRole === 'teacher' && courseId) {
    const { DB } = c.env;
    
    // 교사 ID 조회
    const teacher = await DB.prepare(`
      SELECT id FROM teachers WHERE user_id = ?
    `).bind(userId).first();
    
    if (!teacher) {
      return c.json({ error: 'Teacher not found' }, 404);
    }
    
    // 이 과목의 담당 교사인지 확인
    const course = await DB.prepare(`
      SELECT id FROM courses 
      WHERE id = ? AND teacher_id = ?
    `).bind(courseId, teacher.id).first();
    
    if (!course) {
      return c.json({ 
        error: 'Forbidden: You are not the teacher of this course' 
      }, 403);
    }
    
    await next();
    return;
  }
  
  return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
}

// 학생 본인 또는 권한 있는 사용자만 접근
export async function requireStudentOrAuthorized(c: Context<{ Bindings: CloudflareBindings }>, next: Next) {
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const studentId = c.req.param('student_id') || c.req.query('student_id');
  
  // super_admin과 admin은 모든 학생 접근 가능
  if (userRole === 'super_admin' || userRole === 'admin') {
    await next();
    return;
  }
  
  const { DB } = c.env;
  
  // 학생 본인인지 확인
  if (userRole === 'student') {
    const student = await DB.prepare(`
      SELECT id FROM students WHERE user_id = ?
    `).bind(userId).first();
    
    if (student && student.id === Number(studentId)) {
      await next();
      return;
    }
  }
  
  // 교사인 경우 담임 학생 또는 수업 학생인지 확인
  if (userRole === 'teacher' && studentId) {
    const teacher = await DB.prepare(`
      SELECT id FROM teachers WHERE user_id = ?
    `).bind(userId).first();
    
    if (!teacher) {
      return c.json({ error: 'Teacher not found' }, 404);
    }
    
    // 담임 반 학생인지 확인
    const homeroomStudent = await DB.prepare(`
      SELECT sch.id
      FROM student_class_history sch
      JOIN teacher_homeroom th ON sch.class_id = th.class_id 
        AND sch.semester_id = th.semester_id
      JOIN semesters s ON sch.semester_id = s.id
      WHERE th.teacher_id = ? 
        AND sch.student_id = ? 
        AND sch.is_active = 1
        AND s.is_active = 1
    `).bind(teacher.id, studentId).first();
    
    if (homeroomStudent) {
      await next();
      return;
    }
    
    // 수업 학생인지 확인
    const courseStudent = await DB.prepare(`
      SELECT e.id
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN semesters s ON c.semester_id = s.id
      WHERE c.teacher_id = ? 
        AND e.student_id = ? 
        AND e.status = 'active'
        AND s.is_active = 1
    `).bind(teacher.id, studentId).first();
    
    if (courseStudent) {
      await next();
      return;
    }
  }
  
  // 학부모인 경우 자녀인지 확인
  if (userRole === 'parent' && studentId) {
    const relation = await DB.prepare(`
      SELECT id FROM parent_student 
      WHERE parent_user_id = ? AND student_id = ?
    `).bind(userId, studentId).first();
    
    if (relation) {
      await next();
      return;
    }
  }
  
  return c.json({ 
    error: 'Forbidden: You do not have access to this student\'s information' 
  }, 403);
}

// 교사의 접근 가능한 학생 목록 필터링
export async function getTeacherAccessibleStudents(
  db: any, 
  teacherId: number, 
  semesterId?: number
): Promise<number[]> {
  const studentIds: Set<number> = new Set();
  
  // 담임 반 학생들
  const homeroomStudents = await db.prepare(`
    SELECT DISTINCT sch.student_id
    FROM student_class_history sch
    JOIN teacher_homeroom th ON sch.class_id = th.class_id 
      AND sch.semester_id = th.semester_id
    WHERE th.teacher_id = ? 
      AND sch.is_active = 1
      ${semesterId ? 'AND sch.semester_id = ?' : ''}
  `).bind(semesterId ? [teacherId, semesterId] : [teacherId]).all();
  
  homeroomStudents.results.forEach((s: any) => studentIds.add(s.student_id));
  
  // 수업 학생들
  const courseStudents = await db.prepare(`
    SELECT DISTINCT e.student_id
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE c.teacher_id = ? 
      AND e.status = 'active'
      ${semesterId ? 'AND c.semester_id = ?' : ''}
  `).bind(semesterId ? [teacherId, semesterId] : [teacherId]).all();
  
  courseStudents.results.forEach((s: any) => studentIds.add(s.student_id));
  
  return Array.from(studentIds);
}

// 부서별 접근 제어 미들웨어
export async function requireDepartmentAccess(c: Context<{ Bindings: CloudflareBindings }>, next: Next) {
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const userDepartmentId = c.get('userDepartmentId');
  const isSuperAdmin = c.get('isSuperAdmin');
  const targetDepartmentId = c.req.param('department_id') || c.req.query('department_id');
  
  // 최고관리자는 모든 부서 접근 가능
  if (isSuperAdmin) {
    await next();
    return;
  }
  
  // 부서 ID가 없으면 통과 (전체 조회는 부서 필터링으로 처리)
  if (!targetDepartmentId) {
    await next();
    return;
  }
  
  // 사용자의 부서와 요청한 부서가 일치하는지 확인
  if (userDepartmentId && Number(userDepartmentId) === Number(targetDepartmentId)) {
    await next();
    return;
  }
  
  return c.json({ 
    error: 'Forbidden: You do not have access to this department',
    your_department: userDepartmentId,
    requested_department: targetDepartmentId
  }, 403);
}

// 최고관리자만 접근 가능
export async function requireSuperAdmin(c: Context<{ Bindings: CloudflareBindings }>, next: Next) {
  const isSuperAdmin = c.get('isSuperAdmin');
  
  if (!isSuperAdmin) {
    return c.json({ 
      error: 'Forbidden: Super admin access required' 
    }, 403);
  }
  
  await next();
}
