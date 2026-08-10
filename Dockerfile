# ============================================================
# Personal Workbench - Frontend (Nginx)
# 多架构支持：linux/amd64, linux/arm64, linux/arm/v7
# ============================================================

FROM nginx:1.27-alpine

# OCI 标准标签
LABEL org.opencontainers.image.title="Personal Workbench - Frontend"
LABEL org.opencontainers.image.description="个人工作台前端 - Nginx 静态文件服务"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/moonbai/personal-workbench"

# 清除默认配置和默认页面
RUN rm -rf /usr/share/nginx/html/*

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制工作台文件（确保 assets 目录存在）
COPY workbench-desktop.html /usr/share/nginx/html/index.html
COPY assets/ /usr/share/nginx/html/assets/

# 暴露端口
EXPOSE 80

# 健康检查 — busybox wget 在所有架构的 alpine 上均可用
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
