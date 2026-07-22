import express from 'express';
import cors from 'cors';

// 导入 db.js 以确保数据库在服务启动时初始化
import './db.js';
import authRoutes from './routes/auth.js';
import syncRoutes from './routes/sync.js';
import bankRoutes from './routes/bank.js';

const app = express();
const PORT = 3000;

// 中间件
app.use(cors()); // 允许所有来源跨域
app.use(express.json()); // 解析 JSON 请求体

// 挂载路由
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/bank', bankRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'gongkao-server' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('[error]', err);
  // JSON 解析错误
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: '请求体 JSON 格式错误' });
  }
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`[server] 公考速算训练后端服务已启动`);
  console.log(`[server] 监听地址: http://localhost:${PORT}`);
  console.log(`[server] 健康检查: http://localhost:${PORT}/api/health`);
});
