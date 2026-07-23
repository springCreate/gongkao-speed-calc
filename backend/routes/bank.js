import { Router } from 'express';
import db from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/bank/list
 * → { banks: [{ id, title, author, count, downloads, createdAt }] }
 * 按创建时间倒序，最多 50 条
 */
router.get('/list', (req, res) => {
  const rows = db
    .prepare(`
      SELECT id, username, title, questions_json, downloads, created_at
      FROM shared_banks
      ORDER BY created_at DESC
      LIMIT 50
    `)
    .all();

  const banks = rows.map((row) => {
    let count = 0;
    try {
      count = JSON.parse(row.questions_json).length;
    } catch (err) {
      count = 0;
    }
    return {
      id: row.id,
      title: row.title,
      author: row.username,
      count,
      downloads: row.downloads,
      createdAt: row.created_at,
    };
  });

  res.json({ banks });
});

/**
 * POST /api/bank/upload
 * (需认证) body: { title, questions: [...] }
 * → { id }
 */
router.post('/upload', auth, (req, res) => {
  const { title, questions } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: '标题不能为空' });
  }

  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'questions 必须是数组' });
  }

  const questionsJson = JSON.stringify(questions);
  const createdAt = new Date().toISOString();

  const result = db
    .prepare(`
      INSERT INTO shared_banks (user_id, username, title, questions_json, downloads, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `)
    .run(req.user.id, req.user.username, title.trim(), questionsJson, createdAt);

  res.status(201).json({ id: result.lastInsertRowid });
});

/**
 * GET /api/bank/:id
 * → { id, title, author, questions, downloads }
 */
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM shared_banks WHERE id = ?').get(req.params.id);

  if (!row) {
    return res.status(404).json({ error: '题库不存在' });
  }

  let questions = [];
  try {
    questions = JSON.parse(row.questions_json);
  } catch (err) {
    questions = [];
  }

  res.json({
    id: row.id,
    title: row.title,
    author: row.username,
    questions,
    downloads: row.downloads,
  });
});

/**
 * POST /api/bank/:id/download
 * 增加下载次数 → { success: true }
 */
router.post('/:id/download', (req, res) => {
  const row = db.prepare('SELECT id FROM shared_banks WHERE id = ?').get(req.params.id);

  if (!row) {
    return res.status(404).json({ error: '题库不存在' });
  }

  db.prepare('UPDATE shared_banks SET downloads = downloads + 1 WHERE id = ?').run(req.params.id);

  res.json({ success: true });
});

export default router;
