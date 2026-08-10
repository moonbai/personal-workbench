# 个人工作台 · Personal Workbench

> 个人每日工作台 —— 每日计划、习惯打卡、记账本、长期目标、心情日记，全部集中在一个页面里。前后端分离架构，数据持久化存储在 SQLite 数据库中，支持 Docker 一键部署。

## 功能模块

| 模块 | 说明 |
|---|---|
| 📋 今日计划 | 任务清单与优先级追踪（P0/P1/P2），支持置顶、备注 |
| 🌿 习惯打卡 | 每日习惯打卡，自动统计连续天数，每日自动重置 |
| 📖 阅读打卡 | 书籍阅读进度追踪，支持摘录与想法记录 |
| 🏃 每日锻炼 | 运动目标进度（分钟/次数），+1 快捷记录 |
| 💰 记账本 | 收入/支出记录，分类统计与支出占比图表 |
| ✏️ 心情日记 | 文字记录与心情标签 |
| 🔥 今日热点 | 内容收藏与稍后阅读 |

## 核心特性

- **前后端分离** — 前端纯 HTML/CSS/JS，后端 Node.js + Express
- **数据持久化** — 所有数据存储在 SQLite 数据库中，不依赖浏览器缓存
- **头像上传** — 支持头像文件上传，存储在服务器端
- **一键换肤** — 通过 CSS 变量实现整站主题切换
- **番茄钟** — 内置 25 分钟专注计时器
- **本周趋势** — 状态趋势折线图可视化
- **Docker 部署** — 一条命令启动前后端全部服务

---

## Docker 部署（推荐）

### 前提条件

确保已安装 [Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://docs.docker.com/compose/install/)。

### 一键启动

```bash
# 克隆仓库
git clone https://github.com/moonbai/personal-workbench.git
cd personal-workbench

# 构建并启动（前端 + 后端）
docker compose up -d --build
```

启动完成后，浏览器访问 **http://localhost:8080** 即可使用。

### 自定义端口

默认使用 8080 端口，可通过环境变量修改：

```bash
# 使用 3000 端口
PORT=3000 docker compose up -d --build

# 访问 http://localhost:3000
```

### 查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 只看后端日志
docker compose logs -f backend

# 只看前端日志
docker compose logs -f frontend
```

### 停止与清理

```bash
# 停止服务（数据保留）
docker compose down

# 停止并删除数据卷（⚠️ 清空所有数据）
docker compose down -v
```

### 数据备份

数据存储在 Docker 数据卷 `workbench-data` 中，备份方法：

```bash
# 备份数据库
docker run --rm -v workbench-data:/data -v $(pwd):/backup alpine \
  cp /data/workbench.db /backup/workbench-backup-$(date +%Y%m%d).db

# 恢复数据库
docker run --rm -v workbench-data:/data -v $(pwd):/backup alpine \
  cp /backup/workbench-backup-20260810.db /data/workbench.db
```

---

## 本地开发

### 启动后端

```bash
cd server
npm install
npm start
# 后端运行在 http://localhost:3001
```

### 启动前端

```bash
# 在项目根目录另开终端
python3 -m http.server 8080
# 前端运行在 http://localhost:8080
```

前端会自动检测后端地址：Docker 环境走 nginx 代理，本地开发自动连接 `localhost:3001`。

---

## 架构说明

```
浏览器 ──→ Nginx (:8080)
              ├── 静态文件 (HTML/CSS/JS/图片)
              └── /api/* 反向代理 ──→ Node.js Express (:3001)
                                        └── SQLite 数据库
```

| 组件 | 技术 | 说明 |
|---|---|---|
| 前端 | HTML / CSS / JS | 纯原生，无框架依赖 |
| 后端 | Node.js + Express | REST API 服务 |
| 数据库 | SQLite (better-sqlite3) | 轻量级文件数据库，无需额外安装 |
| 代理 | Nginx | 静态文件服务 + API 反向代理 |
| 容器 | Docker Compose | 前后端双服务编排 |

### API 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/data` | 获取完整工作台数据 |
| PUT | `/api/data` | 保存工作台数据（防抖 300ms） |
| POST | `/api/avatar` | 上传头像文件（最大 5MB） |
| GET | `/api/health` | 健康检查 |
| GET | `/uploads/:file` | 访问上传的头像文件 |

---

## 项目结构

```
personal-workbench/
├── workbench-desktop.html   # 前端主应用
├── assets/
│   └── greet-banner.jpg     # 首页 Hero 背景图
├── server/                  # 后端服务
│   ├── index.js             # Express API 服务
│   ├── package.json         # 依赖配置
│   ├── package-lock.json    # 依赖锁定
│   └── Dockerfile           # 后端 Docker 构建
├── Dockerfile               # 前端 Docker 构建
├── docker-compose.yml       # Docker Compose 编排
├── nginx.conf               # Nginx 配置（含 API 反向代理）
├── .dockerignore
├── .gitignore
├── deploy.sh                # GitHub 一键部署脚本
├── LICENSE
└── README.md
```

---

## 自定义配置

### 修改模块

编辑 `workbench-desktop.html` 中的 `CONFIG` 对象：

```javascript
const CONFIG = {
  owner: "我的工作台",
  slogan: "Personal Workbench",
  modules: [
    // 添加/删除/修改模块...
  ],
};
```

### 换肤

修改 `<style>` 中 `:root` 的 CSS 变量即可一键换肤：

```css
:root {
  --page-bg: #f4f3f0;
  --accent: #2f2e2b;
  --module-1: #6f8f6a;
  /* ... */
}
```

预设色板：墨色中性（默认）、莫兰迪暖粉、冷色科技。

---

## 技术栈

- **前端**：原生 HTML / CSS / JavaScript（无框架）
- **后端**：Node.js 20 + Express 4 + better-sqlite3
- **部署**：Nginx 1.27 Alpine + Docker Compose
- **数据库**：SQLite（WAL 模式，高性能读写）

## License

[MIT License](LICENSE)
