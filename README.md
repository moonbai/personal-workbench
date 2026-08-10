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
- **自适应界面** — 单页面自动适配桌面/平板/手机，小屏切换为底部导航+抽屉模式
- **Docker 部署** — 一条命令启动前后端全部服务

### 键盘快捷键

| 快捷键 | 功能 |
|---|---|
| `Ctrl+K` / `⌘+K` | 打开/关闭命令面板 |
| `1` | 回到首页 |
| `2` ~ `8` | 快速跳转对应功能模块 |
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

默认使用 8080 端口。推荐通过 `.env` 文件管理端口配置：

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env，修改 PORT=3000
# 然后启动
docker compose up -d --build

# 访问 http://localhost:3000
```

也可以直接通过环境变量指定：

```bash
PORT=3000 docker compose up -d --build
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
    # 资源限制：防止突发占用挤占宿主机
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
    volumes:
      - workbench-data:/app/data
    environment:
      - PORT=3001
      - DB_PATH=/app/data/workbench.db
      - UPLOAD_DIR=/app/data/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://127.0.0.1:3001/api/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
    # 日志滚动：防止爆盘
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
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
      # 只读挂载，防止容器内篡改
      # 自适应版（默认首页）+ 桌面版 + 手机版 均保留
      - ./workbench.html:/usr/share/nginx/html/index.html:ro
      - ./workbench-desktop.html:/usr/share/nginx/html/desktop.html:ro
      - ./workbench-mobile.html:/usr/share/nginx/html/mobile.html:ro
      - ./assets:/usr/share/nginx/html/assets:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://127.0.0.1/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    deploy:
      resources:
        limits:
          cpus: "0.3"
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
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

# 查看服务状态（含健康检测）
docker compose ps
```

### 部署提示

- **前端热更新**：直接修改宿主机的 `workbench.html` / `assets/` / `nginx.conf`，无需重建容器，Nginx 自动生效
- **后端代码修改**：必须执行 `docker compose up -d --build` 重新构建镜像
- **外网部署**：服务器放行 8080 端口（或自定义端口），通过 `IP:8080` 访问
- **资源限制**：后端限制 0.5 CPU / 512M，前端限制 0.3 CPU / 256M，可根据宿主机配置调整
- **日志限制**：每个容器最多保留 3 个日志文件，每个 10MB，防止长期运行爆盘

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

### 使用预构建镜像（无需编译）

项目通过 GitHub Actions 自动构建多架构 Docker 镜像并发布到 GHCR，可直接拉取使用，无需本地构建：

```bash
# 使用预构建镜像一键启动
docker compose -f docker-compose.prod.yml up -d
```

也可以单独拉取镜像：

```bash
# 拉取前端镜像
docker pull ghcr.io/moonbai/personal-workbench-frontend:latest

# 拉取后端镜像
docker pull ghcr.io/moonbai/personal-workbench-backend:latest
```

> 镜像会自动适配当前硬件架构（amd64 / arm64 / arm/v7）。

---

## CI/CD 自动构建

项目配置了 GitHub Actions 工作流（`.github/workflows/docker-publish.yml`），在以下情况自动触发构建：

| 触发条件 | 说明 |
|---|---|
| push 到 `main` 分支 | 构建并推送 `latest` 标签 |
| 发布 `v*` Tag（如 `v1.0.0`） | 构建并推送语义化版本标签 |
| Pull Request | 仅构建验证，不推送 |
| 手动触发 | 在 Actions 页面手动运行 |

### 支持的硬件架构

| 架构 | 典型设备 |
|---|---|
| `linux/amd64` | x86 服务器 / PC / 大多数云主机 |
| `linux/arm64` | Apple Silicon (M1/M2/M3) / 树莓派 4/5 / ARM 服务器 |
| `linux/arm/v7` | 树莓派 3 / 旧款 ARM 设备 |

### 镜像标签策略

| 标签 | 说明 |
|---|---|
| `latest` | main 分支最新版本 |
| `1.2.3` | 语义化版本（发布 v1.2.3 Tag 时生成） |
| `1.2` | 主版本.次版本 |
| `1` | 主版本 |
| `sha-xxxxxx` | Git commit 短哈希 |

### Docker Hub 同步（可选）

如需同步推送到 Docker Hub，在仓库 Settings → Secrets and variables → Actions 中配置：

- **Variables**: `DOCKERHUB_USERNAME` — Docker Hub 用户名
- **Secrets**: `DOCKERHUB_TOKEN` — Docker Hub Access Token

配置后工作流会自动同步镜像到 Docker Hub。

### GitHub Release 自动发布

推送 `v*` 标签时，工作流会在构建镜像后自动创建 GitHub Release，包含以下附件：

| 附件 | 说明 |
|---|---|
| `docker-compose.yml` | 预配置版本号的部署文件，下载即用 |
| `.env.example` | 环境变量模板 |
| `QUICKSTART.md` | 快速部署指南 |

Release 说明会自动生成变更日志（基于 PR/Commit），并附带镜像地址和部署指引。

**发布新版本的流程：**

```bash
# 1. 确保所有改动已合并到 main 分支
git checkout main && git pull

# 2. 创建版本标签（语义化版本）
git tag v1.0.0
git push origin v1.0.0

# 3. GitHub Actions 自动执行：
#    → 构建多架构镜像 → 推送到 GHCR → 创建 GitHub Release
```

> 含 `-` 的标签（如 `v1.0.0-beta.1`）会自动标记为预发布（pre-release）。
> 访问 [Releases 页面](https://github.com/moonbai/personal-workbench/releases) 查看已发布版本。

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
# 访问 / → 自适应版（推荐）
# 访问 /desktop.html → 桌面版
# 访问 /mobile.html → 手机版
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
├── workbench.html             # 自适应版（默认首页，桌面/手机自动切换）
├── workbench-desktop.html     # 桌面版（独立保留）
├── workbench-mobile.html      # 手机版（独立保留）
├── assets/
│   ├── greet-banner.jpg       # 首页 Hero 背景图
│   └── avatar.jpg             # 默认头像
├── server/                    # 后端服务
│   ├── index.js               # Express API 服务
│   ├── package.json           # 依赖配置
│   ├── package-lock.json      # 依赖锁定
│   └── Dockerfile             # 后端 Docker 构建（多阶段）
├── .github/
│   ├── workflows/
│   │   └── docker-publish.yml # CI/CD 多架构自动构建
│   ├── ISSUE_TEMPLATE/        # Issue 模板
│   └── PULL_REQUEST_TEMPLATE.md
├── Dockerfile                 # 前端 Docker 构建（Nginx）
├── docker-compose.yml         # 本地开发编排（从源码构建）
├── docker-compose.prod.yml    # 生产部署编排（拉取预构建镜像）
├── nginx.conf                 # Nginx 配置（含 API 反向代理）
├── .dockerignore
├── .gitignore
├── .env.example               # 环境变量模板（端口配置）
├── CONTRIBUTING.md            # 贡献指南
├── deploy.sh                  # GitHub 一键部署脚本
├── LICENSE
└── README.md
```

---

## 自定义配置

### 修改模块

编辑 `workbench.html`（自适应版）或 `workbench-desktop.html`（桌面版）中的 `CONFIG` 对象：

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
- **CI/CD**：GitHub Actions 多架构构建（amd64 / arm64 / arm/v7）

## License

[MIT License](LICENSE)
