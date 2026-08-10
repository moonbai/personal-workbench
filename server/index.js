/**
 * Personal Workbench - Backend Server
 * Node.js + Express + SQLite
 *
 * API:
 *   GET  /api/data        → 获取完整工作台数据
 *   PUT  /api/data        → 保存完整工作台数据
 *   POST /api/avatar      → 上传头像（返回 URL）
 *   GET  /uploads/:file   → 静态头像文件
 *   GET  /api/health      → 健康检查
 */

const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'workbench.db');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'data', 'uploads');

// 确保目录存在
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

// 初始化 SQLite
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS workbench_data (
    id    INTEGER PRIMARY KEY DEFAULT 1,
    data  TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT DEFAULT (datetime('now'))
  );
  INSERT OR IGNORE INTO workbench_data (id, data) VALUES (1, '{}');
`);

// 预编译语句
const stmtGet = db.prepare('SELECT data FROM workbench_data WHERE id = 1');
const stmtSet = db.prepare("UPDATE workbench_data SET data = ?, updated_at = datetime('now') WHERE id = 1");

// ============================================================
// Routes
// ============================================================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 获取完整数据
app.get('/api/data', (req, res) => {
  try {
    const row = stmtGet.get();
    const data = JSON.parse(row.data || '{}');
    res.json({ ok: true, data });
  } catch (err) {
    console.error('[GET /api/data] Error:', err.message);
    res.status(500).json({ ok: false, error: 'Failed to load data' });
  }
});

// 保存完整数据
app.put('/api/data', (req, res) => {
  try {
    const { data } = req.body;
    if (data === undefined) {
      return res.status(400).json({ ok: false, error: 'Missing "data" field' });
    }
    const jsonStr = JSON.stringify(data);
    stmtSet.run(jsonStr);
    res.json({ ok: true, updated_at: new Date().toISOString() });
  } catch (err) {
    console.error('[PUT /api/data] Error:', err.message);
    res.status(500).json({ ok: false, error: 'Failed to save data' });
  }
});

// 头像上传
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.png';
      cb(null, `avatar-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

app.post('/api/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: 'No file uploaded' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ ok: true, url });
});

// 启动
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Workbench Server] running on http://0.0.0.0:${PORT}`);
  console.log(`[Workbench Server] DB: ${DB_PATH}`);
  console.log(`[Workbench Server] Uploads: ${UPLOAD_DIR}`);
});
