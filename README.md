# 公考资料分析速算训练

一个公务员考试资料分析速算训练工具，支持纯前端本地模式和云端同步模式。

**在线体验：[https://springcreate.github.io/gongkao-speed-calc/](https://springcreate.github.io/gongkao-speed-calc/)**

## 功能模块

### 1. 敏感数积累（特征数字速记）

内置 80+ 个公考常用特征数字对应关系（百化分表）：

- **浏览模式** — 查看完整的分数-百分数-小数对照表，带熟练度颜色标记
- **闪卡模式** — 随机显示百分数，输入对应分数，翻转查看答案
- **限时挑战** — 60 秒内答对尽可能多的百化分转换题
- **熟练度追踪** — 绿色=熟练、黄色=一般、红色=薄弱

### 2. 估算练习（速算训练）

覆盖资料分析 6 种核心题型，每种支持 3 个难度等级：

| 题型 | 说明 |
|------|------|
| 截位直除 | 截取分子分母前 N 位直除，看首位商 |
| 特征数字法 | 百分数转分数简化计算 |
| 基期量估算 | 现期量 ÷ (1+r%) 估算基期 |
| 增长量估算 | 现期量 × r% ÷ (1+r%) 估算增长量 |
| 比重差估算 | A/B - C/D 差值估算 |
| 分数比较 | 比较两个分数大小 |

每次 10 道题，记录每题用时，提交后显示正确率、平均用时、每题详解和速算技巧提示，错题自动收录。

### 3. 题目导入练习

- **手动添加** — 表单输入题目（材料 + 题干 + 选项 + 答案 + 解析）
- **批量导入** — 粘贴 JSON 格式题目数据
- **导出** — 导出题目为 JSON 文件
- **练习** — 导入的题目支持计时练习和错题收录

### 4. 分享功能

- **分享海报** — 将练习成绩（正确率、用时、等级、雷达图）生成图片
- **复制成绩** — 一键复制文字版成绩摘要到剪贴板
- **分享码** — 将题目集生成 Base64 编码分享码，他人粘贴即可导入

### 5. 首页仪表盘

- 今日练习统计（次数、正确率、平均用时）
- 速算等级徽章（菜鸟 → 入门 → 熟练 → 精通 → 大师）
- 最近 7 天正确率折线图
- 各题型能力雷达图
- 错题数量提示

### 6. 云端同步（需后端支持）

- 用户注册/登录
- 练习数据云端同步（多设备共享）
- 公共题库分享广场
- 上传/下载他人分享的题库

## 技术架构

### 双模式设计

本项目采用**前后端分离 + 渐进增强**架构：

```
┌─────────────────────────────────────────┐
│           前端 (单 HTML 文件)             │
│  ┌───────────┐     ┌───────────────┐    │
│  │ 本地模式   │────▶│  云同步模式    │    │
│  │ (默认)    │     │ (检测到后端时) │    │
│  └───────────┘     └───────────────┘    │
└──────────────┬──────────────────────────┘
               │ 检测后端健康检查
               ▼
        ┌─────────────┐
        │  后端服务    │
        │ Express API │
        │ SQLite DB   │
        └─────────────┘
```

- **本地模式**：打开即用，数据存 localStorage，无需后端
- **云同步模式**：检测到后端服务时自动启用，支持账号登录和数据同步

### 技术栈

**前端：**
- 纯前端单 HTML 文件，零构建步骤
- [Tailwind CSS](https://tailwindcss.com) — 响应式布局与样式
- [Chart.js](https://www.chartjs.org/) — 统计图表
- [html2canvas](https://html2canvas.hertzen.com/) — 分享海报生成
- 数据持久化：localStorage

**后端：**
- Node.js + Express
- SQLite (better-sqlite3)
- JWT 认证
- bcryptjs 密码加密

## 项目结构

```
.
├── index.html                  # 前端主文件（GitHub Pages 入口）
├── gongkao-speed-calc.html     # 前端源文件（同 index.html）
├── README.md
├── .gitignore
└── backend/                    # 后端服务
    ├── server.js               # 入口文件
    ├── db.js                   # 数据库初始化
    ├── package.json
    ├── .env.example            # 环境变量示例
    ├── .gitignore
    ├── middleware/
    │   └── auth.js             # JWT 认证中间件
    ├── routes/
    │   ├── auth.js             # 认证接口
    │   ├── sync.js             # 数据同步接口
    │   └── bank.js             # 题库分享接口
    └── data/                   # 数据库文件目录（git 忽略）
```

## 使用方式

### 最简单的方式（本地模式）

直接打开 `index.html` 文件即可使用，所有数据存在浏览器 localStorage 中。

### 在线访问

[https://springcreate.github.io/gongkao-speed-calc/](https://springcreate.github.io/gongkao-speed-calc/)

## 本地开发

### 前端

```bash
# 方式一：直接双击打开 index.html

# 方式二：本地服务器
python -m http.server 8080
# 然后访问 http://localhost:8080
```

### 后端

```bash
cd backend

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env
# 编辑 .env 设置 JWT_SECRET 等

# 启动开发服务（带热重载）
npm run dev

# 启动生产服务
npm start
```

后端默认运行在 `http://localhost:3000`

**环境变量：**

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务端口 | 3000 |
| JWT_SECRET | JWT 签名密钥（生产环境必须设置） | 开发默认值 |

### API 接口

**认证：**
- `POST /api/auth/register` — 注册
- `POST /api/auth/login` — 登录
- `GET /api/auth/me` — 获取当前用户

**数据同步：**
- `GET /api/sync/load` — 拉取云端数据
- `POST /api/sync/save` — 保存数据到云端

**题库分享：**
- `GET /api/bank/list` — 获取分享题库列表
- `POST /api/bank/upload` — 上传题库（需登录）
- `GET /api/bank/:id` — 获取题库详情
- `POST /api/bank/:id/download` — 记录下载次数

**健康检查：**
- `GET /api/health` — 服务健康状态

## 部署

### 前端部署（GitHub Pages）

1. 将本仓库推送到 GitHub
2. 在仓库 Settings → Pages 中选择 `main` 分支，根目录
3. 访问 `https://<username>.github.io/<repo-name>/`

### 后端部署（Render / Railway / Vercel 等）

推荐使用 [Render](https://render.com/) 免费部署：

1. Fork 本仓库
2. 在 Render 上创建新的 Web Service
3. 连接你的 GitHub 仓库
4. 配置：
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **环境变量**: 设置 `JWT_SECRET` 为随机字符串
5. 部署完成后，将前端 `API_BASE` 中的生产地址改为你的后端地址

### 修改前端默认后端地址

编辑 `index.html` 中的 `API_BASE` 配置（约第 162 行）：

```javascript
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : 'https://your-backend-url.com/api';  // 改为你的后端地址
```

## 题目导入格式

```json
[
  {
    "material": "2023年某市GDP为3567.8亿元...",
    "question": "2022年该市GDP约为多少亿元？",
    "options": ["A. 3120", "B. 3256", "C. 3312", "D. 3398"],
    "answer": 2,
    "explanation": "基期量 = 3567.8 / (1+8.5%) ≈ 3287"
  }
]
```

## License

MIT
