#!/bin/bash
# ============================================================
# Personal Workbench - GitHub 部署脚本
# 用法: bash deploy.sh
# 前提: 已安装 gh CLI 并登录 (gh auth login)
# 或已配置 git 凭证
# ============================================================

set -e

REPO_NAME="personal-workbench"
REPO_DESC="个人工作台 - 每日计划/习惯打卡/记账/长期目标/灵感记录 | Docker 部署"

echo "========================================"
echo "  Personal Workbench - GitHub 部署"
echo "========================================"
echo ""

# 检查是否在项目目录
if [ ! -f "workbench-desktop.html" ]; then
  echo "错误: 请在项目根目录运行此脚本"
  exit 1
fi

# 检查 gh CLI 是否可用
if command -v gh &> /dev/null; then
  echo "检测到 gh CLI，正在创建 GitHub 仓库..."
  
  # 检查是否已登录
  if ! gh auth status &> /dev/null; then
    echo "请先登录 GitHub: gh auth login"
    exit 1
  fi
  
  # 创建公开仓库
  gh repo create "$REPO_NAME" --public --description="$REPO_DESC" --source=. --remote=origin --push
  echo ""
  echo "仓库创建并推送成功!"
  echo "访问: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
  
else
  # 使用 git 方式
  echo "未检测到 gh CLI，使用 git 方式..."
  echo "请先在 GitHub 上手动创建仓库: https://github.com/new"
  echo "仓库名: $REPO_NAME"
  echo "设置为: Public"
  echo "不要勾选 Initialize with README"
  echo ""
  read -p "创建完成后按回车继续..." user_input
  
  # 获取 GitHub 用户名
  GIT_USER=$(git config user.name)
  echo "使用 GitHub 用户名: $GIT_USER"
  
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://github.com/$GIT_USER/$REPO_NAME.git"
  git branch -M main
  git push -u origin main
  
  echo ""
  echo "推送成功!"
  echo "访问: https://github.com/$GIT_USER/$REPO_NAME"
fi

echo ""
echo "========================================"
echo "  部署完成!"
echo "========================================"
echo ""
echo "Docker 启动命令:"
echo "  docker compose up -d --build"
echo "  访问 http://localhost:8080"
echo ""
