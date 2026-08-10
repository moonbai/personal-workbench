# 贡献指南

感谢你对 Personal Workbench 项目的关注！欢迎提交 Issue 和 Pull Request。

## 开发环境准备

```bash
# 克隆仓库
git clone https://github.com/moonbai/personal-workbench.git
cd personal-workbench

# 启动后端
cd server
npm install
npm start

# 另开终端，启动前端
cd ..
python3 -m http.server 8080
```

访问 http://localhost:8080 即可开发调试。

## 提交规范

请使用 Conventional Commits 格式：

```
<type>: <description>

类型说明：
  feat     新功能
  fix      修复 Bug
  docs     文档更新
  style    代码格式调整（不影响功能）
  refactor 重构（不新增功能/不修复 Bug）
  perf     性能优化
  chore    构建/工具变更
```

示例：`feat: 添加天气预报小组件`、`fix: 修复深色模式下搜索框边框不可见`

## 代码风格

### 前端 (workbench-desktop.html)

- 纯原生 HTML/CSS/JS，不引入框架
- CSS 变量统一在 `:root` 中定义，深色模式覆盖在 `body.dark`
- JS 函数使用 `function` 声明，保持一致的命名风格
- 用户输入必须经过 `esc()` 或 `attr()` 转义后再插入 DOM

### 后端 (server/)

- Node.js + Express，不使用 TypeScript
- SQL 使用预编译语句（`db.prepare`），禁止字符串拼接
- 文件上传使用白名单验证

## Pull Request 流程

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feat/your-feature`
3. 提交更改：`git commit -m 'feat: 描述你的改动'`
4. 推送分支：`git push origin feat/your-feature`
5. 提交 Pull Request，描述改动内容和动机

## Issue 提交

- Bug 报告请附上复现步骤、浏览器版本、是否使用 Docker 部署
- 功能建议请描述使用场景和期望效果

## License

提交的代码将遵循 [MIT License](LICENSE)。
