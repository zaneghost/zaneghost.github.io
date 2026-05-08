# NeonSoda - 城市夜市：摸金纪元

一个移动端优先的 H5 小游戏原型，核心循环为 **搜 -> 争 -> 撤**。  
玩家在城市夜市中捡漏、对抗、撤离并积累收藏品价值。

## 产品文档

- 详细策划文档：[docs/design.md](docs/design.md)

## 技术栈

- React + TypeScript
- Vite
- Tailwind CSS (v4)
- lucide-react
- wouter

## 本地开发

### 环境要求

- Node.js >= 20
- npm >= 9

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

## 局域网访问（手机调试）

项目内置了脚本：

```bash
./start-lan.sh 9000
```

然后在同一局域网设备访问：

```text
http://<你的本机IP>:9000
```

## 构建与预览

### 构建生产包

```bash
npm run build
```

构建产物位于 `dist/`。

### 本地预览生产包

```bash
npm run preview -- --host 0.0.0.0 --port 4173
```

## 部署说明

这是前端静态站项目，推荐流程：

1. CI 或本地执行 `npm run build`
2. 将 `dist/` 部署到静态托管平台（GitHub Pages / Netlify / Vercel / Nginx）

注意：`dist/` 通常不提交到主分支（已在 `.gitignore` 中忽略）。

## 常见问题

### 1) Node 版本过低导致 Vite 启动失败

请升级到 Node 20+ 后重新安装依赖：

```bash
rm -rf node_modules package-lock.json
npm install
```

也可以使用项目提供的脚本：

```bash
./reinstall-deps.sh
```

### 2) `Cannot find native binding`（Tailwind oxide）

通常是依赖在错误的 Node 版本下安装导致。执行上面的重装依赖步骤即可。

## 目录结构（简化）

```text
.
├── src/main.tsx
├── App.tsx
├── Home.tsx
├── pages/
├── components/
├── contexts/
├── index.html
├── index.css
├── start-lan.sh
└── package.json
```

## License

仅用于学习与原型演示。
