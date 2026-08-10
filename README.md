# 个人工作台 · Personal Workbench

> 一个纯前端的个人每日工作台 —— 每日计划、习惯打卡、记账本、长期目标、心情日记，全部集中在同一个页面里。无需后端，数据存储在浏览器本地。

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

- **零依赖** — 纯 HTML/CSS/JS，无构建步骤，无后端
- **数据本地化** — 所有数据存储在浏览器 `localStorage` 中
- **一键换肤** — 通过 CSS 变量实现整站主题切换
- **响应式布局** — 桌面端侧栏导航 + 多列网格
- **番茄钟** — 内置专注计时器
- **Docker 部署** — 一条命令启动

## 快速开始

### 方式一：直接打开

用浏览器直接打开 `workbench-desktop.html` 即可使用。

### 方式二：Docker 部署（推荐）

```bash
# 克隆仓库
git clone https://github.com/你的用户名/personal-workbench.git
cd personal-workbench

# 构建并启动
docker compose up -d

# 访问
# 浏览器打开 http://localhost:8080
```

#### 自定义端口

```bash
# 使用 3000 端口
PORT=3000 docker compose up -d
```

### 方式三：Docker 构建

```bash
docker build -t personal-workbench .
docker run -d -p 8080:80 --name workbench personal-workbench
```

## 数据说明

- 所有数据存储在**当前设备的当前浏览器**中
- 换电脑、换浏览器或清除浏览记录后数据会丢失
- 建议定期导出重要数据

## 自定义配置

编辑 `workbench-desktop.html` 中的 `CONFIG` 对象：

```javascript
const CONFIG = {
  storageKey: "workbench-desktop-v1",  // 修改 key 可重置数据
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

## 项目结构

```
personal-workbench/
├── workbench-desktop.html   # 主应用（桌面版）
├── assets/
│   └── greet-banner.jpg     # 首页 Hero 背景图
├── Dockerfile               # Docker 构建文件
├── docker-compose.yml       # Docker Compose 编排
├── nginx.conf               # Nginx 配置
├── .dockerignore
├── .gitignore
├── LICENSE
└── README.md
```

## 技术栈

- **前端**：原生 HTML / CSS / JavaScript（无框架）
- **部署**：Nginx 1.27 Alpine
- **容器化**：Docker / Docker Compose

## License

[MIT License](LICENSE)
