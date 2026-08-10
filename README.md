# 个人工作台 · Personal Workbench

> 个人每日工作台 + 导航站 —— 集每日计划、习惯打卡、记账本、长期目标、心情日记、搜索聚合、快捷导航、命令面板、天气、倒计时于一体。前后端分离架构，数据持久化存储在 SQLite 数据库中，支持 Docker 一键部署。

## 功能模块

| 模块 | 说明 |
|---|---|
| ⌨️ 命令面板 | `Ctrl+K` 全局快速搜索，支持模块跳转、导航搜索、网址直达 |
| 🔍 搜索聚合 | 多搜索引擎一键切换（Google / 百度 / Bing / GitHub / 知乎 / B站） |
| 📜 搜索历史 | 自动记录最近 8 条搜索，一键复用 |
| 🔗 快捷导航 | 分组导航站，支持动态增删书签 + 自动 Favicon |
| 🌤️ 天气小组件 | 自动获取当前位置天气信息（温度/湿度/风速） |
| ⏰ 倒计时 | 重要事件倒计时管理，支持添加/删除 |
| 📋 今日计划 | 任务清单与优先级追踪（P0/P1/P2），支持置顶、备注 |
| 🌿 习惯打卡 | 每日习惯打卡，自动统计连续天数，每日自动重置 |
| 📖 阅读打卡 | 书籍阅读进度追踪，支持摘录与想法记录 |
| 🏃 每日锻炼 | 运动目标进度（分钟/次数），+1 快捷记录 |
| 💰 记账本 | 收入/支出记录，分类统计与支出占比图表 |
| ✏️ 心情日记 | 文字记录与心情标签 |
| 🔥 今日热点 | 内容收藏与稍后阅读 |
| 💾 数据管理 | 一键导出/导入 JSON 数据备份 |

## 核心特性

- **命令面板 (Ctrl+K)** — 类似 VS Code / Raycast 体验，模糊搜索模块、导航、引擎，输入网址直接打开
- **前后端分离** — 前端纯 HTML/CSS/JS，后端 Node.js + Express
- **数据持久化** — 所有数据存储在 SQLite 数据库中，不依赖浏览器缓存
- **搜索聚合** — 首页搜索栏支持 6 种搜索引擎一键切换 + 搜索历史
- **导航站** — 分组管理常用网站，支持 UI 动态增删、自动获取 Favicon
- **天气小组件** — 自动获取实时天气，显示温度、湿度、风速
- **倒计时** — 重要事件 deadline 管理，支持添加/删除
- **深色模式** — 右下角浮动按钮一键切换深色/浅色主题，自动记忆
- **键盘快捷键** — 数字键 1-9 快速跳转模块，`/` 聚焦搜索，`Ctrl+K` 命令面板
- **数据导入导出** — JSON 格式一键备份/恢复全部数据
- **头像上传** — 支持头像文件上传，存储在服务器端
- **一键换肤** — 通过 CSS 变量实现整站主题切换
- **番茄钟** — 内置 25 分钟专注计时器
- **本周趋势** — 状态趋势折线图可视化
- **Bento Grid 布局** — 便当盒式仪表盘，高信息密度且不杂乱
- **Docker 部署** — 一条命令启动前后端全部服务

### 键盘快捷键

| 快捷键 | 功能 |
|---|---|
| `Ctrl+K` / `⌘+K` | 打开/关闭命令面板 |
| `1` | 回到首页 |
| `2` ~ `8` | 快速跳转对应功能模块 |
| `h` | 回到首页 |
| `i` | 跳转洞察复盘 |
| `/` | 聚焦搜索框 |
| `Esc` | 关闭命令面板/弹窗 |

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

### docker-compose.yml 完整配置

以下为项目根目录的 `docker-compose.yml` 完整内容，可直接复制使用：

```yaml
version: "3.8"

services:
  # 后端 API 服务
  backend:
    build: ./server
    container_name: workbench-backend
    restart: unless-stopped
    volumes:
      # 数据持久化：SQLite 数据库和上传的头像
      - workbench-data:/app/data
    environment:
      - PORT=3001
      - DB_PATH=/app/data/workbench.db
      - UPLOAD_DIR=/app/data/uploads
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    networks:
      - workbench-net

  # 前端 Nginx 服务
  frontend:
    build: .
    container_name: workbench-frontend
    restart: unless-stopped
    ports:
      - "${PORT:-8080}:80"
    volumes:
      # 挂载文件方便热更新
      - ./workbench-desktop.html:/usr/share/nginx/html/index.html:ro
      - ./assets:/usr/share/nginx/html/assets:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    networks:
      - workbench-net

volumes:
  workbench-data:
    driver: local

networks:
  workbench-net:
    driver: bridge
```

### Docker Compose 常用命令

```bash
# 构建并启动（后台运行）
docker compose up -d --build

# 查看所有服务日志
docker compose logs -f

# 只看后端日志
docker compose logs -f backend

# 只看前端日志
docker compose logs -f frontend

# 停止服务（数据保留）
docker compose down

# 停止并删除数据卷（⚠️ 清空所有数据）
docker compose down -v

# 重新构建镜像
docker compose build --no-cache

# 查看服务状态
docker compose ps
```

### 数据备份与恢复

数据存储在 Docker 数据卷 `workbench-data` 中，也可以通过工作台页面的「导出数据」按钮导出 JSON 备份：

```bash
# 方式一：通过 Docker 卷备份数据库
docker run --rm -v workbench-data:/data -v $(pwd):/backup alpine \
  cp /data/workbench.db /backup/workbench-backup-$(date +%Y%m%d).db

# 方式二：通过 Docker 卷恢复数据库
docker run --rm -v workbench-data:/data -v $(pwd):/backup alpine \
  cp /backup/workbench-backup-20260810.db /data/workbench.db
```

> 也可以在工作台页面底部点击「导出数据」按钮，下载 JSON 备份文件；需要恢复时点击「导入数据」上传即可。

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
              ├── /api/* 反向代理 ──→ Node.js Express (:3001)
              └── /uploads/* 代理 ──→ 头像文件
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
├── workbench-desktop.html   # 前端主应用（单文件，含全部 CSS/JS）
├── assets/
│   ├── greet-banner.jpg     # 首页 Hero 背景图
│   └── avatar.jpg           # 默认头像
├── server/                  # 后端服务
│   ├── index.js             # Express API 服务
│   ├── package.json         # 依赖配置
│   ├── package-lock.json    # 依赖锁定
│   └── Dockerfile           # 后端 Docker 构建
├── Dockerfile               # 前端 Docker 构建（Nginx）
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

  // 搜索引擎
  searchEngines: [
    { key:"google", name:"Google", url:"https://www.google.com/search?q=", icon:"🔍" },
    // 添加更多引擎...
  ],

  // 导航链接（也可在页面 UI 中动态添加）
  navLinks: [
    { group:"常用工具", items:[
      { name:"GitHub", url:"https://github.com", icon:"🐙", desc:"代码托管" },
      // 添加更多链接...
    ]},
  ],

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

预设色板：墨色中性（默认）、莫兰迪暖粉、冷色科技、深色模式。

---

## 技术栈

- **前端**：原生 HTML / CSS / JavaScript（无框架）
- **后端**：Node.js 20 + Express 4 + better-sqlite3
- **部署**：Nginx 1.27 Alpine + Docker Compose
- **数据库**：SQLite（WAL 模式，高性能读写）
- **天气**：wttr.in 免费 API（无需密钥）

## License

[MIT License](LICENSE)
