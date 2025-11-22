export type UserRole = 'student' | 'parent' | 'teacher' | 'admin' | 'super_admin';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  is_active: number;
  created_at: string;
}

export interface Student {
  id: number;
  user_id: number;
  student_number: string;
  grade?: number;
  class_id?: number;
  admission_date?: string;
  graduation_date?: string;
  status: 'enrolled' | 'graduated' | 'transferred' | 'dropped';
  address?: string;
  emergency_contact?: string;
}

export interface Teacher {
  id: number;
  user_id: number;
  teacher_number: string;
  subject?: string;
  hire_date?: string;
  position?: string;
  department?: string;
}

export interface Semester {
  id: number;
  name: string;
  year: number;
  semester: 1 | 2;
  start_date: string;
  end_date: string;
  is_current: number;
}

export interface Class {
  id: number;
  name: string;
  grade: number;
  semester_id: number;
  homeroom_teacher_id?: number;
  room_number?: string;
  max_students: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  credits: number;
  subject_type: 'required' | 'elective';
}

export interface Course {
  id: number;
  subject_id: number;
  semester_id: number;
  teacher_id: number;
  class_id?: number;
  course_name: string;
  schedule?: string;
  max_students: number;
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  enrollment_date: string;
  status: 'active' | 'dropped' | 'completed';
}

export interface Attendance {
  id: number;
  enrollment_id: number;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
  recorded_by?: number;
}

export interface Grade {
  id: number;
  enrollment_id: number;
  exam_type: 'midterm' | 'final' | 'assignment' | 'quiz' | 'project';
  score: number;
  max_score: number;
  weight: number;
  exam_date?: string;
  note?: string;
  recorded_by?: number;
}

export interface VolunteerActivity {
  id: number;
  student_id: number;
  activity_name: string;
  organization?: string;
  activity_date: string;
  hours: number;
  category: 'community' | 'environment' | 'welfare' | 'education' | 'other';
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
}

export interface Club {
  id: number;
  name: string;
  description?: string;
  advisor_teacher_id?: number;
  semester_id: number;
  max_members: number;
}

export interface CloudflareBindings {
  DB: D1Database;
}
