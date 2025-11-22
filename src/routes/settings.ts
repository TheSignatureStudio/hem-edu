import { Hono } from 'hono'
import type { CloudflareBindings } from '../types/bindings'
import { verifyToken } from '../utils/auth'

const settings = new Hono<{ Bindings: CloudflareBindings }>()

// 토큰에서 사용자 정보 추출 헬퍼
async function getUserFromToken(token: string): Promise<{ userId: number; role: string } | null> {
  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return null;
    }
    return {
      userId: payload.userId,
      role: payload.role || ''
    };
  } catch {
    return null;
  }
}

// 관리자 권한 체크 헬퍼
async function checkAdminPermission(c: any): Promise<boolean> {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return false;
  }
  
  const user = await getUserFromToken(token);
  if (!user) {
    return false;
  }
  
  // 관리자 또는 최고관리자만 허용
  return user.role === 'admin' || user.role === 'super_admin';
}

// Get all system settings
settings.get('/', async (c) => {
  const { DB } = c.env

  const result = await DB.prepare(`
    SELECT 
      ss.*,
      u.name as updated_by_name
    FROM system_settings ss
    LEFT JOIN users u ON ss.updated_by = u.id
    ORDER BY ss.setting_key
  `).all()

  return c.json({ success: true, settings: result.results })
})

// Get single setting by key
settings.get('/:key', async (c) => {
  const { DB } = c.env
  const key = c.req.param('key')

  const result = await DB.prepare(`
    SELECT 
      ss.*,
      u.name as updated_by_name
    FROM system_settings ss
    LEFT JOIN users u ON ss.updated_by = u.id
    WHERE ss.setting_key = ?
  `).bind(key).first()

  if (!result) {
    return c.json({ success: false, message: '설정을 찾을 수 없습니다.' }, 404)
  }

  return c.json({ success: true, setting: result })
})

// Update or create setting
settings.put('/:key', async (c) => {
  // 관리자 권한 체크
  const hasPermission = await checkAdminPermission(c);
  if (!hasPermission) {
    return c.json({ success: false, message: '시스템 설정은 관리자만 수정할 수 있습니다.' }, 403);
  }
  
  const { DB } = c.env
  const key = c.req.param('key')
  const { setting_value, setting_type, description, updated_by } = await c.req.json()

  // Validation
  if (setting_value === undefined || setting_value === null) {
    return c.json({
      success: false,
      message: '설정 값을 입력해주세요.'
    }, 400)
  }

  try {
    // Check if setting exists
    const existing = await DB.prepare(`
      SELECT id FROM system_settings WHERE setting_key = ?
    `).bind(key).first()

    if (existing) {
      // Update existing setting
      const result = await DB.prepare(`
        UPDATE system_settings 
        SET 
          setting_value = ?,
          setting_type = ?,
          description = ?,
          updated_by = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE setting_key = ?
      `).bind(
        setting_value,
        setting_type || 'string',
        description || null,
        updated_by || null,
        key
      ).run()

      if (result.success) {
        return c.json({ success: true, message: '설정이 수정되었습니다.' })
      } else {
        return c.json({ success: false, message: '설정 수정에 실패했습니다.' }, 500)
      }
    } else {
      // Create new setting
      const result = await DB.prepare(`
        INSERT INTO system_settings (
          setting_key,
          setting_value,
          setting_type,
          description,
          updated_by
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(
        key,
        setting_value,
        setting_type || 'string',
        description || null,
        updated_by || null
      ).run()

      if (result.success) {
        return c.json({
          success: true,
          message: '설정이 생성되었습니다.',
          id: result.meta.last_row_id
        })
      } else {
        return c.json({ success: false, message: '설정 생성에 실패했습니다.' }, 500)
      }
    }
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Batch update multiple settings
settings.post('/batch', async (c) => {
  // 관리자 권한 체크
  const hasPermission = await checkAdminPermission(c);
  if (!hasPermission) {
    return c.json({ success: false, message: '시스템 설정은 관리자만 수정할 수 있습니다.' }, 403);
  }
  
  const { DB } = c.env
  const { settings: settingsToUpdate, updated_by } = await c.req.json()

  if (!Array.isArray(settingsToUpdate) || settingsToUpdate.length === 0) {
    return c.json({
      success: false,
      message: '수정할 설정을 입력해주세요.'
    }, 400)
  }

  try {
    const results = []

    for (const setting of settingsToUpdate) {
      const { setting_key, setting_value, setting_type, description } = setting

      // Check if setting exists
      const existing = await DB.prepare(`
        SELECT id FROM system_settings WHERE setting_key = ?
      `).bind(setting_key).first()

      if (existing) {
        // Update existing
        const result = await DB.prepare(`
          UPDATE system_settings 
          SET 
            setting_value = ?,
            setting_type = ?,
            description = ?,
            updated_by = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE setting_key = ?
        `).bind(
          setting_value,
          setting_type || 'string',
          description || null,
          updated_by || null,
          setting_key
        ).run()

        results.push({
          setting_key,
          success: result.success,
          action: 'updated'
        })
      } else {
        // Create new
        const result = await DB.prepare(`
          INSERT INTO system_settings (
            setting_key,
            setting_value,
            setting_type,
            description,
            updated_by
          ) VALUES (?, ?, ?, ?, ?)
        `).bind(
          setting_key,
          setting_value,
          setting_type || 'string',
          description || null,
          updated_by || null
        ).run()

        results.push({
          setting_key,
          success: result.success,
          action: 'created',
          id: result.meta.last_row_id
        })
      }
    }

    return c.json({
      success: true,
      message: '설정이 저장되었습니다.',
      results
    })
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Delete setting
settings.delete('/:key', async (c) => {
  // 관리자 권한 체크
  const hasPermission = await checkAdminPermission(c);
  if (!hasPermission) {
    return c.json({ success: false, message: '시스템 설정은 관리자만 삭제할 수 있습니다.' }, 403);
  }
  
  const { DB } = c.env
  const key = c.req.param('key')

  try {
    const result = await DB.prepare(`
      DELETE FROM system_settings WHERE setting_key = ?
    `).bind(key).run()

    if (result.success) {
      return c.json({ success: true, message: '설정이 삭제되었습니다.' })
    } else {
      return c.json({ success: false, message: '설정 삭제에 실패했습니다.' }, 500)
    }
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Get settings by category (using key prefix)
settings.get('/category/:prefix', async (c) => {
  const { DB } = c.env
  const prefix = c.req.param('prefix')

  const result = await DB.prepare(`
    SELECT 
      ss.*,
      u.name as updated_by_name
    FROM system_settings ss
    LEFT JOIN users u ON ss.updated_by = u.id
    WHERE ss.setting_key LIKE ?
    ORDER BY ss.setting_key
  `).bind(`${prefix}%`).all()

  return c.json({ success: true, settings: result.results })
})

export default settings
