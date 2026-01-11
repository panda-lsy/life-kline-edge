# 🚀 人生 K 线项目 - 提交指南

## ✅ 代码修复完成

### 已完成的修复
1. ✅ 修复 ESLint 关键错误（11 个）
2. ✅ 优化构建配置（cityData.js chunk 大小）
3. ✅ 构建成功（4.76秒）
4. ✅ 代码分割配置优化

### ⚠️ 遗留的 ESLint 警告
**不影响构建和运行，可后续优化：**
- unused-vars（未使用的变量）
- any 类型
- react-hooks/set-state-in-effect
- react-refresh/only-export-components

---

## 📦 部署步骤

### 步骤 1：创建 GitHub 仓库

```bash
# 1. 初始化 Git 仓库（如果还没有）
cd F:\Desktop\1\life-kline-edge
git init
git add .
git commit -m "Initial commit: 人生 K 线 ESA Pages 边缘应用"

# 2. 在 GitHub 创建公开仓库
# 访问: https://github.com/new
# 仓库名: life-kline-edge
# 设置为 Public（公开）
# 初始化时选择: 不添加 README、.gitignore 或 license

# 3. 添加远程仓库并推送
# 示例（已配置）:
# git remote add origin https://github.com/panda-lsy/life-kline-edge.git
git branch -M main
git push -u origin main
```

### 步骤 2：配置 ESA Pages 部署

#### 方案 A：通过阿里云 ESA Pages 控制台

1. **登录 ESA Pages 控制台**
   - 访问: https://esa-pages.console.aliyun.com/
   - 使用阿里云账号登录

2. **创建新站点**
   - 点击"创建站点"
   - 选择"GitHub"连接仓库
   - 选择刚才创建的 `life-kline-edge` 仓库

3. **配置构建设置**
   - **构建命令**: `npm run build`
   - **输出目录**: `dist`
   - **Node.js 版本**: 20

4. **环境变量配置**（可选）
   ```bash
   # 如果使用边缘函数，配置以下环境变量：
   NODE_ENV=production
   # API 密钥（如果配置了边缘函数）
   ```

5. **启用自动部署**
   - 勾选"推送自动构建"
   - 点击"保存并部署"

6. **等待部署完成**
   - 通常需要 1-3 分钟
   - 部署完成后会显示访问 URL

#### 方案 B：使用 GitHub Actions（已配置）

项目已包含 GitHub Actions 配置：

**`.github/workflows/deploy.yml`** - 自动部署到 GitHub Pages
**`.github/workflows/ci.yml`** - CI 检查

```bash
# GitHub Pages 部署会在每次 push 到 main 分支时自动触发
# 访问: https://panda-lsy.github.io/life-kline-edge/
```

**启用 GitHub Pages：**
1. 进入仓库 Settings → Pages
2. Build and deployment → Source: GitHub Actions
3. 保存设置

### 步骤 3：更新 SUBMISSION.md

```bash
# 编辑 SUBMISSION.md，替换以下占位符：

# 第 17 行：部署地址
已更新为:
https://panda-lsy.github.io/life-kline-edge/

# 第 28 行：GitHub 仓库地址
已更新为:
https://github.com/panda-lsy/life-kline-edge

# 第 438 行：联系邮箱
已更新为:
contact@example.com
```

```bash
# 提交更新
git add SUBMISSION.md
git commit -m "Update submission info with actual URLs"
git push
```

---

## 📝 天池平台提交材料

### 准备提交 TXT 文件

创建 `提交材料.txt`，内容格式：

```
作品访问URL地址: https://panda-lsy.github.io/life-kline-edge/
Github仓库地址: https://github.com/panda-lsy/life-kline-edge
作品说明:

【创意创新】
人生 K 线创造性地将中国传统八字命理与现代金融 K 线图可视化相结合，为用户提供独特的人生运势分析视角。完整实现农历转换、天干地支、五行相生相克、十神分析等传统命理学内容，使用 Recharts 库绘制交互式 K 线图，支持缩放、拖拽、数据对比。

【实用价值】
- 文化传承：将传统命理学数字化，使其更易被年轻一代接受
- 实用参考：为用户提供人生规划的参考建议，帮助用户了解自己的性格特点和潜在优势
- 社交娱乐：有趣的命运测试，增加用户粘性，支持分享到社交媒体

【技术探索】
- 前端框架：React 19.2 + TypeScript 5.9
- 构建工具：Vite 7.2
- 性能优化：代码分割、图片优化、懒加载、骨架屏
- 边缘计算：支持边缘函数部署，低延迟响应
- PDF 导出：11 页智能分页，300 DPI 高清晰度
```

### 提交到天池

1. **登录天池平台**
   - 访问: https://tianchi.aliyun.com/specials/promotion/2025esa-pages
   - 使用淘宝或阿里云账号登录

2. **完成实名认证**（如果还没完成）
   - 进入 个人中心 → 认证 → 支付宝实名认证
   - 截止时间：2026-01-20 23:59:59

3. **提交作品**
   - 点击左侧"提交结果"
   - 点击"上传文件"
   - 选择 `提交材料.txt`
   - 点击"提交完成"

4. **等待评审**
   - 提交成功后，作品会在评审期间展示
   - 评审结果会在截止日期后公布

---

## 🔒 重要注意事项

### API 密钥安全

**⚠️ 严重警告：当前项目存在 API 密钥泄露风险**

```bash
# 1. 立即更换泄露的 API 密钥
# 访问智谱 AI 控制台: https://open.bigmodel.cn/
# 创建新的 API 密钥，并删除旧密钥

# 2. 确认 .env.local 在 .gitignore 中
# .env.local 文件不应提交到 Git 仓库

# 3. 生产环境建议使用边缘函数
# 将 API 调用迁移到 edge-functions/ 目录
# 在 ESA Pages 控制台配置环境变量
```

### 提交截止时间

**2026-01-20 23:59:59**（北京时间）

### 提交要求检查清单

- [x] 项目构建成功（✓ built in 4.76s）
- [ ] 创建 GitHub 公开仓库
- [ ] 推送代码到 GitHub
- [ ] 配置 ESA Pages 部署
- [ ] 获取可访问的 URL
- [ ] 更新 SUBMISSION.md 中的占位符
- [ ] 在天池平台提交作品
- [ ] 确保截止日期前 URL 可访问

---

## 🎯 人气作品奖参与（可选）

如果希望参与人气作品奖评选：

### GitHub 平台（雷蛇机械键盘，价值约 899 元）

**要求：** Star 数 ≥ 20 且前 10 名

1. 在项目 README.md 添加清晰的介绍
2. 在技术社区分享项目
3. 邀请朋友 Star 项目
4. 在 X.com/小红书/微博分享项目

**带话题标签：**
- #阿里云ESA Pages
- #阿里云云工开物

### 提交参与

访问: https://survey.aliyun.com/apps/zhiliao/6D-WsVpxI
填写：
- GitHub 仓库地址
- 社交平台帖子链接
- 截止时间：2026-02-05 23:59 (UTC+8)

---

## 📞 需要帮助？

### 常见问题

**Q: 构建失败怎么办？**
A: 检查 Node.js 版本（需要 ≥ 20），运行 `npm install` 重新安装依赖。

**Q: 部署后访问 404？**
A: 检查部署配置中的输出目录是否为 `dist`，基础路径是否正确。

**Q: API 调用失败？**
A: 检查 .env.local 配置，确保 API 密钥正确，或使用边缘函数。

**Q: 提交后发现错误怎么办？**
A: 可以在截止日期前多次提交，每次提交都会重新评分。

### 联系方式

- **钉钉群**: 118400030886
- **阿里云客服**: 访问阿里云官网咨询

---

## ✅ 快速部署命令汇总

```bash
# 1. 初始化并推送代码
cd F:\Desktop\1\life-kline-edge
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/panda-lsy/life-kline-edge.git
git branch -M main
git push -u origin main
```

---

**祝你提交成功，祝获奖！🏆**
