# VibeShot

> AI 形象摄影师 - 让每一个"不会拍照"的男生，都能拥有让人眼前一亮的人物照片

## 产品简介

VibeShot 是一款专注于男性个人形象照片的 AI 生成平台，定位为"AI 摄影师 + AI 形象顾问"。它不是简单的 AI 换脸工具，而是通过姿势智能（Pose Intelligence）、场景模板和风格化处理，帮助男性用户生成高质量社交照片。

## 核心功能

- **姿势智能推荐**：AI 分析用户特征，推荐最适合的姿势风格
- **人物一致性**：上传几张照片，AI 学习特征，生成保持一致性的照片
- **多样化场景**：咖啡馆、街头、写字楼等多种场景模板
- **6 种男生专属风格**：冷淡感、松弛感、精英感、痞帅、阳光、韩系

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **动画**: Framer Motion
- **图标**: Lucide React

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### Google Analytics 统计

项目已预留 `GA4` 埋点。配置环境变量后即可启用：

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

推荐放到 `.env.local` 或生产环境变量中。

### Google Search Console

项目已包含：

- `/robots.txt`
- `/sitemap.xml`

正式站点默认按 `https://music.aihelper360.com` 生成。

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── layout.tsx          # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── Navbar.tsx         # 导航栏
│   ├── Hero.tsx           # 首屏区域
│   ├── Features.tsx       # 功能介绍
│   ├── Pricing.tsx        # 定价页面
│   ├── Footer.tsx         # 页脚
│   ├── PhotoUploader.tsx  # 照片上传
│   ├── StyleSelector.tsx  # 风格选择
│   ├── PhotoGenerator.tsx # 照片生成
│   └── ResultGallery.tsx  # 结果展示
├── lib/                   # 工具库
│   ├── types.ts           # TypeScript 类型
│   ├── utils.ts           # 工具函数
│   └── data.ts            # 静态数据
├── store/                 # 状态管理
│   └── useAppStore.ts     # Zustand Store
└── public/                # 静态资源
```

## AI 集成说明

当前 MVP 版本使用模拟数据生成照片。后续版本将集成：

- [ ] OpenAI Images API (GPT-4o / DALL-E 3)
- [ ] Flux + LoRA (自部署方案)
- [ ] IPAdapter + InstantID (人物一致性)

## MVP 功能范围

| 功能 | 状态 |
|-----|------|
| 用户上传照片 | ✅ 已完成 |
| 姿势风格选择 | ✅ 已完成 |
| 场景模板选择 | ✅ 已完成 |
| 照片生成 | 🔄 模拟中 |
| 历史记录管理 | ✅ 已完成 |
| 下载和分享 | ✅ 已完成 |
| 支付订阅系统 | 📋 待开发 |

## 商业模式

- **免费用户**：3 张免费生成
- **月度订阅**：¥39/月，50 张生成
- **年度订阅**：¥299/年，600 张生成
- **按次付费**：¥3/张

## 设计原则

1. **简洁高效**：用户 3 步完成照片生成
2. **隐私优先**：本地处理，仅存储特征向量
3. **专业品质**：每种风格都经过摄影师调研

## License

MIT
# vibeshot
