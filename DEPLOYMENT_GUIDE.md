# 沉浸式番茄钟部署与分享指南 (PWA 篇)

按照本教程操作，你可以将应用发布到互联网上，让你的朋友们像安装 App 一样在手机和电脑上使用。

## 第一阶段：上传代码到 GitHub

GitHub 是存放代码的仓库，也是连接自动部署工具的桥梁。

1. **创建 GitHub 账号**：访问 [github.com](https://github.com/) 并注册。
2. **创建新仓库 (Repository)**：
   - 点击右上角的 `+` -> `New repository`。
   - 名字起为 `immersive-pomodoro`。
   - 设为 `Public`。
   - 点击 `Create repository`。
3. **在本地上传代码**：
   - 在本项目的终端中依次输入（请先确保电脑安装了 Git）：
     ```bash
     git init
     git add .
     git commit -m "Initial commit - v2.0 PWA"
     git branch -M main
     git remote add origin https://github.com/你的用户名/immersive-pomodoro.git
     git push -u origin main
     ```

---

## 第二阶段：使用 Vercel 自动部署 (推荐)

Vercel 可以将你的 GitHub 代码变成一个可以访问的 HTTPS 网址。

1. **登录 Vercel**：访问 [vercel.com](https://vercel.com/)，选择 `Continue with GitHub`。
2. **导入项目**：
   - 登录后，点击 `Add New` -> `Project`。
   - 在列表中找到 `immersive-pomodoro` 仓库，点击 `Import`。
3. **配置并部署**：
   - 无需修改任何配置，直接点击 `Deploy`。
   - 等待约 1-2 分钟，你会看到烟花效果，表示部署成功！
   - 你会得到一个域名（如 `immersive-pomodoro.vercel.app`），这就是你的 App 网址。

---

## 第三阶段：完善 App 图标 (可选但建议)

为了让“安装”后的 App 看起来更正式，你需要准备两张图片放在项目的 `public` 文件夹下：

1. **pwa-192x192.png**：192x192 像素的图标。
2. **pwa-512x512.png**：512x512 像素的图标。

*提示：你可以找一张好看的番茄图标，使用在线工具裁剪成这两个尺寸放进去，再次 `git push`，网站会自动更新图标。*

---

## 第四阶段：发送给朋友并安装

将 Vercel 生成的网址发给朋友，并附带以下安装说明：

### **iOS (iPhone) 朋友安装：**
1. 用 **Safari** 浏览器打开链接。
2. 点击底部的“分享”图标（方框加向上箭头）。
3. 向上滑动，找到并点击 **“添加到主屏幕”**。
4. 点击右上角的“添加”。

### **Android (安卓) 朋友安装：**
1. 用 **Chrome** 浏览器打开链接。
2. 点击右上角的三个点。
3. 选择 **“安装应用”** 或 **“添加到主屏幕”**。

### **Windows/Mac 朋友安装：**
1. 用 **Chrome/Edge** 浏览器打开链接。
2. 点击地址栏右侧出现的“安装”小图标。
3. 点击“安装”。

---

## 为什么要这样做？
- **自动更新**：你以后只要修改代码并推送，朋友们的 App 会自动提示更新。
- **离线使用**：安装后，即便朋友在地铁上没信号，计时器依然能正常工作。
- **完全免费**：上述所有工具（GitHub, Vercel）对于个人开发者都是免费的。
