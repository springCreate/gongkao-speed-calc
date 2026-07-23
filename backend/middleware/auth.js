import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'gongkao_speed_calc_dev_secret';

/**
 * JWT 认证中间件
 * 从 Authorization: Bearer <token> 中提取并验证 token
 * 验证通过后将 { id, username } 挂载到 req.user
 */
export function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = header.slice(7); // 去掉 "Bearer "

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: '认证令牌无效或已过期' });
  }
}

export default auth;
