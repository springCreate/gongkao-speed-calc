import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 数据库目录：./data（自动创建）
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.db');
const db = new Database(dbPath);

// 开启 WAL 模式提升并发读写性能
db.pragma('journal_mode = WAL');
// 开启外键约束
db.pragma('foreign_keys = ON');

// 初始化数据表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_data (
    user_id INTEGER PRIMARY KEY,
    data_json TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS shared_banks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    title TEXT NOT NULL,
    questions_json TEXT NOT NULL,
    downloads INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_shared_banks_created_at ON shared_banks(created_at DESC);
`);

console.log('[db] 数据库初始化完成:', dbPath);

export default db;
