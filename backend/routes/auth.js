import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { auth, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// 生成 JWT 令牌
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

/**
 * POST /api/auth/register
 * body: { username, password }
 * → { token, user: { id, username } }
 */
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  if (typeof username !== 'string' || username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: '用户名长度需在 3-20 个字符之间' });
  }

  if (typeof password !== 'string' || password.length < 6 || password.length > 20) {
    return res.status(400).json({ error: '密码长度需在 6-20 个字符之间' });
  }

  // 检查用户名是否重复
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: '用户名已存在' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const createdAt = new Date().toISOString();

  const result = db
    .prepare('INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)')
    .run(username, passwordHash, createdAt);

  const user = { id: result.lastInsertRowid, username };
  const token = generateToken(user);

  res.status(201).json({ token, user });
});

/**
 * POST /api/auth/login
 * body: { username, password }
 * → { token, user: { id, username } }
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!row) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  if (!bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const user = { id: row.id, username: row.username };
  const token = generateToken(user);

  res.json({ token, user });
});

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * → { user: { id, username } }
 */
router.get('/me', auth, (req, res) => {
  res.json({ user: { id: req.user.id, username: req.user.username } });
});

export default router;
