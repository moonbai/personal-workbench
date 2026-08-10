# ============================================================
# Personal Workbench - Backend (Node.js + SQLite)
# 多架构支持：linux/amd64, linux/arm64, linux/arm/v7
# 多阶段构建：编译 better-sqlite3 原生模块 → 精简运行镜像
# ============================================================

# ---- 阶段 1：构建阶段（安装依赖 + 编译原生模块）----
FROM node:20-alpine AS builder

# 安装 better-sqlite3 编译所需的构建工具
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 仅复制依赖文件，利用 Docker 缓存层
COPY package.json package-lock.json* ./

# 使用 npm ci 确保可复现安装（优先），回退到 npm install
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# ---- 阶段 2：运行阶段（精简镜像）----
FROM node:20-alpine

# OCI 标准标签
LABEL org.opencontainers.image.title="Personal Workbench - Backend"
LABEL org.opencontainers.image.description="个人工作台后端 - Node.js + Express + SQLite"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/moonbai/personal-workbench"

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

WORKDIR /app

# 创建非 root 用户提升安全性
RUN addgroup -S workbench && adduser -S workbench -G workbench

# 从构建阶段复制已安装的 node_modules（含已编译的原生模块）
COPY --from=builder /app/node_modules ./node_modules

# 复制源码
COPY package.json ./
COPY . .

# 创建数据持久化目录并设置权限
RUN mkdir -p /app/data/uploads && \
    chown -R workbench:workbench /app

# 切换为非 root 用户
USER workbench

# 数据持久化目录
VOLUME ["/app/data"]

EXPOSE 3001

# 健康检查 — curl -f 在 HTTP 错误时返回非零退出码
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:3001/api/health || exit 1

CMD ["node", "index.js"]
