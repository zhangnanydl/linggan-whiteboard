# 灵感白板官网

这是灵感白板的独立静态官网目录，可以直接部署到 GitHub Pages、Cloudflare Pages、Netlify 或任意静态服务器。

## 本地预览

在项目根目录运行：

```powershell
python -m http.server 4173 --directory website
```

然后访问 `http://localhost:4173`。

## 目录

- `index.html`：官网结构与内容
- `styles.css`：响应式视觉样式
- `script.js`：移动导航与滚动出现效果
- `assets/`：灯泡 Logo、产品截图与作者微信支持图片

官网不依赖构建工具，复制整个 `website` 文件夹即可部署。
