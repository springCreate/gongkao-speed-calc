import { Router } from 'express';
import db from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/sync/load
 * (需认证) → { data: { featureProficiency, calcHistory, ... } | null }
 */
router.get('/load', auth, (req, res) => {
  const row = db
    .prepare('SELECT data_json, updated_at FROM user_data WHERE user_id = ?')
    .get(req.user.id);

  if (!row || !row.data_json) {
    return res.json({ data: null });
  }

  try {
    const data = JSON.parse(row.data_json);
    res.json({ data });
  } catch (err) {
    // 数据损坏时返回 null，让客户端可重新保存
    res.json({ data: null });
  }
});

/**
 * POST /api/sync/save
 * (需认证) body: { data: {...} }
 * → { success: true, updatedAt }
 */
router.post('/save', auth, (req, res) => {
  const { data } = req.body;

  if (data === undefined || data === null) {
    return res.status(400).json({ error: '缺少 data 参数' });
  }

  const dataJson = JSON.stringify(data);
  const updatedAt = new Date().toISOString();

  // upsert：存在则更新，不存在则插入
  db.prepare(`
    INSERT INTO user_data (user_id, data_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      data_json = excluded.data_json,
      updated_at = excluded.updated_at
  `).run(req.user.id, dataJson, updatedAt);

  res.json({ success: true, updatedAt });
});

export default router;
