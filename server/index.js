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
const MAX_DATA_SIZE = 50 * 1024 * 1024; // 50MB

// 确保目录存在（recursive: true 在目录已存在时不报错）
try {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (e) {
  console.error('[Workbench Server] Failed to create directories:', e.message);
  console.error('[Workbench Server] Check volume permissions for /app/data');
  process.exit(1);
}

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 静态头像文件 — 防止路径遍历攻击
app.use('/uploads', (req, res, next) => {
  const requested = path.normalize(req.path);
  const resolved = path.resolve(UPLOAD_DIR, requested);
  if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }
  next();
}, express.static(UPLOAD_DIR, {
  maxAge: '7d',
  fallthrough: true,
}));

// 初始化 SQLite
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

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
    if (data === undefined || data === null) {
      return res.status(400).json({ ok: false, error: 'Missing "data" field' });
    }
    // 限制数据大小，防止过大请求
    const jsonStr = JSON.stringify(data);
    if (jsonStr.length > MAX_DATA_SIZE) {
      return res.status(413).json({ ok: false, error: 'Data too large (max 50MB)' });
    }
    // 验证 JSON 可解析（双重保险）
    JSON.parse(jsonStr);
    stmtSet.run(jsonStr);
    res.json({ ok: true, updated_at: new Date().toISOString() });
  } catch (err) {
    console.error('[PUT /api/data] Error:', err.message);
    res.status(500).json({ ok: false, error: 'Failed to save data' });
  }
});

// 头像上传 — 文件类型白名单 + 安全文件名
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeExt = /^\\.(jpe?g|png|gif|webp|svg)$/.test(ext) ? ext : '.png';
      cb(null, `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Only JPEG/PNG/GIF/WebP/SVG.'));
    }
  },
});

app.post('/api/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: 'No file uploaded' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ ok: true, url });
});

// multer 错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ ok: false, error: 'File too large (max 5MB)' });
    }
    return res.status(400).json({ ok: false, error: err.message });
  }
  if (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
  next();
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

// 启动
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Workbench Server] running on http://0.0.0.0:${PORT}`);
  console.log(`[Workbench Server] DB: ${DB_PATH}`);
  console.log(`[Workbench Server] Uploads: ${UPLOAD_DIR}`);
});

// 优雅退出：捕获信号时关闭数据库连接
function shutdown(signal) {
  console.log(`\n[Workbench Server] Received ${signal}, shutting down...`);
  server.close(() => {
    try { db.close(); } catch(e) {}
    console.log('[Workbench Server] Closed. Bye!');
    process.exit(0);
  });
  // 强制退出超时
  setTimeout(() => process.exit(1), 5000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('[Workbench Server] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Workbench Server] Unhandled Rejection:', reason);
});
