import { Hono } from 'hono'

const counseling = new Hono<{ Bindings: { DB: D1Database } }>()

// ============================================
// 상담기록 목록 조회
// ============================================
counseling.get('/', async (c) => {
  try {
    const { semester_id, student_id } = c.req.query()
    
    let query = `
      SELECT 
        cr.*,
        u.name as student_name,
        s.student_number,
        sem.name as semester_name
      FROM counseling_records cr
      LEFT JOIN students s ON cr.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN semesters sem ON cr.semester_id = sem.id
      WHERE 1=1
    `
    
    const params: any[] = []
    
    if (semester_id) {
      query += ' AND cr.semester_id = ?'
      params.push(parseInt(semester_id))
    }
    
    if (student_id) {
      query += ' AND cr.student_id = ?'
      params.push(parseInt(student_id))
    }
    
    query += ' ORDER BY cr.counseling_date DESC, cr.created_at DESC'
    
    const stmt = c.env.DB.prepare(query).bind(...params)
    const { results } = await stmt.all()
    
    return c.json({ records: results || [] })
  } catch (error: any) {
    console.error('상담기록 조회 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// 상담기록 단일 조회
// ============================================
counseling.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    const stmt = c.env.DB.prepare(`
      SELECT 
        cr.*,
        u.name as student_name,
        s.student_number,
        sem.name as semester_name
      FROM counseling_records cr
      LEFT JOIN students s ON cr.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN semesters sem ON cr.semester_id = sem.id
      WHERE cr.id = ?
    `).bind(id)
    
    const result = await stmt.first()
    
    if (!result) {
      return c.json({ error: '상담기록을 찾을 수 없습니다' }, 404)
    }
    
    return c.json(result)
  } catch (error: any) {
    console.error('상담기록 조회 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// 상담기록 추가
// ============================================
counseling.post('/', async (c) => {
  try {
    const data = await c.req.json()
    
    // 필수 필드 검증
    if (!data.student_id || !data.semester_id || !data.counseling_date || !data.topic || !data.content) {
      return c.json({ error: '필수 필드가 누락되었습니다' }, 400)
    }
    
    const stmt = c.env.DB.prepare(`
      INSERT INTO counseling_records (
        student_id, semester_id, counseling_date, counseling_type, counselor_name,
        topic, content, follow_up, is_confidential
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.student_id,
      data.semester_id,
      data.counseling_date,
      data.counseling_type || null,
      data.counselor_name || null,
      data.topic,
      data.content,
      data.follow_up || null,
      data.is_confidential ? 1 : 0
    )
    
    const result = await stmt.run()
    
    return c.json({
      message: '상담기록이 추가되었습니다',
      id: result.meta.last_row_id
    }, 201)
  } catch (error: any) {
    console.error('상담기록 추가 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// 상담기록 수정
// ============================================
counseling.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const data = await c.req.json()
    
    // 필수 필드 검증
    if (!data.student_id || !data.semester_id || !data.counseling_date || !data.topic || !data.content) {
      return c.json({ error: '필수 필드가 누락되었습니다' }, 400)
    }
    
    const stmt = c.env.DB.prepare(`
      UPDATE counseling_records
      SET student_id = ?, semester_id = ?, counseling_date = ?, counseling_type = ?,
          counselor_name = ?, topic = ?, content = ?, follow_up = ?, is_confidential = ?
      WHERE id = ?
    `).bind(
      data.student_id,
      data.semester_id,
      data.counseling_date,
      data.counseling_type || null,
      data.counselor_name || null,
      data.topic,
      data.content,
      data.follow_up || null,
      data.is_confidential ? 1 : 0,
      id
    )
    
    const result = await stmt.run()
    
    if (result.meta.changes === 0) {
      return c.json({ error: '상담기록을 찾을 수 없습니다' }, 404)
    }
    
    return c.json({ message: '상담기록이 수정되었습니다' })
  } catch (error: any) {
    console.error('상담기록 수정 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// 상담기록 삭제
// ============================================
counseling.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    const stmt = c.env.DB.prepare('DELETE FROM counseling_records WHERE id = ?').bind(id)
    const result = await stmt.run()
    
    if (result.meta.changes === 0) {
      return c.json({ error: '상담기록을 찾을 수 없습니다' }, 404)
    }
    
    return c.json({ message: '상담기록이 삭제되었습니다' })
  } catch (error: any) {
    console.error('상담기록 삭제 오류:', error)
    return c.json({ error: error.message }, 500)
  }
})

export default counseling
