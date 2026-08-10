# ============================================================
# Personal Workbench - Docker Image
# 基于 nginx:alpine 提供静态文件服务
# ============================================================

FROM nginx:1.27-alpine

LABEL maintainer="Personal Workbench"
LABEL description="个人工作台 - 每日计划/习惯打卡/记账/长期目标/灵感记录"
LABEL version="1.0.0"

# 清除默认配置
RUN rm -rf /usr/share/nginx/html/*

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制工作台文件
COPY workbench-desktop.html /usr/share/nginx/html/index.html
COPY assets/ /usr/share/nginx/html/assets/

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
