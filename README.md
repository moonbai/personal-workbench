# 个人工作台 · Personal Workbench

> 个人每日工作台 —— 每日计划、习惯打卡、记账本、长期目标、心情日记，全部集中在同一个页面里。前后端分离，数据持久化存储在 SQLite 数据库中。

## 功能模块

| 模块 | 说明 |
|---|---|
| 今日计划 | 任务清单与优先级追踪（P0/P1/P2） |
| 习惯打卡 | 每日习惯打卡，自动统计连续天数 |
| 阅读打卡 | 书籍阅读进度追踪 |
| 每日锻炼 | 运动目标进度（分钟/次数） |
| 记账本 | 收入/支出记录，分类统计与占比图 |
| 心情日记 | 文字记录与心情标签 |
| 今日热点 | 内容收藏与稍后阅读 |

## 特性

- **前后端分离** — 前端纯 HTML/CSS/JS，后端 Node.js + Express
- **数据持久化** — 所有数据存储在 SQLite 数据库中，不依赖浏览器缓存
- **头像上传** — 支持头像文件上传，存储在服务器端
- **一键换肤** — 通过 CSS 变量实现整站主题切换
- **番茄钟** — 内置专注计时器
- **Docker 部署** — 一条命令启动前后端服务

## 快速开始

### Docker 部署（推荐）

```bash
# 克隆仓库
git clone https://github.com/moonbai/personal-workbench.git
cd personal-workbench

# 构建并启动（前端 + 后端）
docker compose up -d --build

# 访问
# 浏览器打开 http://localhost:8080
```

#### 自定义端口

```bash
# 使用 3000 端口
PORT=3000 docker compose up -d
```

### 本地开发

```bash
# 1. 启动后端
cd server
npm install
npm start

# 2. 启动前端（另开终端）
python3 -m http.server 8080

# 3. 访问 http://localhost:8080
```

## 架构说明

```
浏览器 ──→ Nginx (:8080)
              ├── 静态文件 (HTML/CSS/JS/图片)
              └── /api/* 反向代理 ──→ Node.js Express (:3001)
                                        └── SQLite 数据库
```

| 组件 | 技术 | 说明 |
|---|---|---|
| 前端 | HTML / CSS / JS | 纯原生，无框架 |
| 后端 | Node.js + Express | REST API |
| 数据库 | SQLite (better-sqlite3) | 轻量级文件数据库 |
| 代理 | Nginx | 静态文件服务 + API 反向代理 |
| 容器 | Docker Compose | 前后端双服务编排 |

### API 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/data` | 获取完整工作台数据 |
| PUT | `/api/data` | 保存工作台数据 |
| POST | `/api/avatar` | 上传头像文件 |
| GET | `/api/health` | 健康检查 |
| GET | `/uploads/:file` | 访问上传的头像文件 |

## 数据说明

- 所有数据存储在 **SQLite 数据库**中，持久化保存在服务器端
- 数据通过 Docker Volume (`workbench-data`) 持久化，容器重启不丢失
- 头像文件上传后存储在服务器端 `/app/data/uploads/` 目录

## 项目结构

```
personal-workbench/
├── workbench-desktop.html   # 前端主应用
├── assets/
│   └── greet-banner.jpg     # 首页 Hero 背景图
├── server/                  # 后端服务
│   ├── index.js             # Express API 服务
│   ├── package.json         # 依赖配置
│   └── Dockerfile           # 后端 Docker 构建
├── Dockerfile               # 前端 Docker 构建
├── docker-compose.yml       # Docker Compose 编排
├── nginx.conf               # Nginx 配置（含 API 反向代理）
├── .dockerignore
├── .gitignore
├── LICENSE
└── README.md
```

## 自定义配置

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

## License

[MIT License](LICENSE)
