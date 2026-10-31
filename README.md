# 今天吃点啥（today-eat-what）

一个为情侣打造的轻量「点餐决策 + 卡路里记录」网页应用。给一个链接，手机、电脑浏览器都能打开；支持「添加到主屏幕」，像小程序一样使用，离线可用。

## 功能特性

- **菜品库管理**：手机端直接新增 / 编辑 / 删除菜品，数量不限；支持搜索、分类筛选、批量粘贴导入；每样菜品可设置名称、分类、贴图、每 100 克热量、默认份量。
- **命运转盘**：自由勾选候选菜品范围，转动转盘随机决策。采用密码学随机数（`crypto.getRandomValues`）保证等概率公平，先定结果再做缓动动画，配音效与撒花；支持「再转一次」「抽中后移除」，结果可一键加入今日菜单。
- **卡路里记录**：按份或按克记录，自动计算热量；每日热量目标与进度环，超额提醒；历史月历、近 7 天趋势图、日均 / 达标 / 超标天数汇总。
- **贴图系统**：内置 emoji 贴图，也可上传本地图片（自动压缩后存本地）。
- **情侣云端同步**：接入 Supabase，一方创建房间得到 6 位邀请码，另一方输入即可加入；菜品与每日记录实时同步，离线操作联网后自动补传，数据按房间隔离并由 RLS 保护。
- **数据安全**：本地数据保存在 IndexedDB，支持一键导出 / 导入 JSON 备份；PWA 持久化存储，离线可用。

## 技术栈

Vue 3 + Vite + Pinia + Vue Router + Dexie.js（IndexedDB）+ Vite PWA + ECharts + canvas-confetti + Supabase（云端同步），静态站点托管于 GitHub Pages。

## 云端同步配置（Supabase）

1. 在 [supabase.com](https://supabase.com) 新建项目，Authentication → Providers 开启 **Anonymous** 匿名登录。
2. SQL Editor 执行仓库 `supabase/schema.sql`，创建数据表、RLS 策略与实时发布。
3. 在应用「设置 → 配置 Supabase 服务器」填入 Project URL 与 anon public key（anon key 可公开，安全由 RLS 保证）。
4. 点击「创建房间」，把 6 位邀请码发给对方加入即可。

## 本地运行

```bash
npm install
npm run dev        # 启动开发服务器，终端输出本地访问地址
```

## 构建与预览

```bash
npm run build      # 产物输出到 dist/
npm run preview    # 本地预览构建产物
```

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库并推送本项目代码。
2. 仓库 **Settings → Pages** 选择构建分支与目录（建议配合 CI，或直接把 `dist/` 内容推送到发布分支）。
3. 访问 `https://<用户名>.github.io/<仓库名>/`，手机电脑同链接打开；也可换用 Vercel、Cloudflare Pages 等静态托管。

> `vite.config.js` 已使用相对 `base: './'`，可部署在任意子路径。

## 数据与隐私

- 所有菜品与记录仅保存在当前浏览器的 IndexedDB 中，不会主动上传；清理浏览器数据可能导致丢失，建议定期使用「导出备份」。
- 内置热量数据参考《中国食品成分表》第 6 版及中国疾病预防控制中心营养与健康所「食物营养成分查询平台」，复合菜品为常见做法估算值，均可在应用内自行修正。
- 数据仅用于日常生活记录，不构成医疗或营养建议。

## 目录结构

```
├── index.html
├── vite.config.js
├── public/             # favicon 与 PWA 图标
└── src/
    ├── main.js         # 入口、种子数据初始化、SW 注册
    ├── App.vue
    ├── style.css       # 主题变量与通用样式
    ├── router/
    ├── db/             # Dexie 数据库与内置菜品种子数据
    ├── stores/         # Pinia：菜品 / 进食记录 / 应用设置
    ├── utils/          # 热量计算、图片压缩等
    ├── components/     # 转盘、底部导航、菜品表单等
    └── views/          # 今日 / 转盘 / 菜品 / 统计 / 设置 五个页面
```
