# ============================================================
# Personal Workbench - Backend (Node.js + SQLite)
# ============================================================

FROM node:20-alpine

WORKDIR /app

# 复制依赖文件并安装
COPY package.json package-lock.json* ./
RUN npm install --production

# 复制源码
COPY . .

# 数据持久化目录
RUN mkdir -p /app/data/uploads
VOLUME ["/app/data"]

EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["node", "index.js"]
