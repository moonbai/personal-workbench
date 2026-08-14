#!/bin/sh
# ============================================================
# Personal Workbench - Backend Entrypoint
# 修复 Docker 命名卷权限问题：确保 workbench 用户可读写 /app/data
# ============================================================
set -e

DATA_DIR="/app/data"

# 如果以 root 运行（如 docker run --user root），修复权限后切换用户
if [ "$(id -u)" = "0" ]; then
  echo "[Entrypoint] Running as root, fixing permissions..."
  mkdir -p "$DATA_DIR/uploads"
  chown -R workbench:workbench /app
  echo "[Entrypoint] Permissions fixed, switching to workbench user..."
  exec su-exec workbench node index.js
else
  # 非 root 运行：尝试创建目录，如果失败说明权限有问题
  mkdir -p "$DATA_DIR/uploads" 2>/dev/null || {
    echo "[Entrypoint] WARNING: Cannot create $DATA_DIR/uploads"
    echo "[Entrypoint] Volume may be owned by root. Try rebuilding: docker compose down -v && docker compose up -d --build"
  }
  exec node index.js
fi
