# Donate Page

现代化的捐赠组件，支持 PayPal、支付宝、微信二维码。

核心目标：在不破坏旧接入方式的前提下，提升接入效率、视觉质量、移动端体验和可访问性。

- 在线演示：<https://miaohancheng.com/donate-page/>
- Legacy 页面：<https://miaohancheng.com/donate-page/sample1/index.html>

---

## V2 能力

- 双轨兼容：保留 `#donate-widget-container` + 原 `data-*` 属性。
- 多实例挂载：支持任意数量 `[data-donate-widget]`。
- 无 jQuery 依赖：纯原生 JS。
- 可访问性增强：语义化按钮、键盘可用（Tab/Enter/Space/Escape）、可见焦点。
- 移动端友好：二维码弹层可长按识别，支持 `prefers-reduced-motion`。
- 安全默认：所有 `_blank` 外链使用 `rel="noopener noreferrer"`。

---

## 快速接入（推荐）

### 1) 添加容器

```html
<div data-donate-widget
     data-paypal-url="https://paypal.me/your-name"
     data-alipay-qr="https://your-cdn.com/alipay.jpg"
     data-wechat-qr="https://your-cdn.com/wechat.jpg"
     data-asset-base-url="https://your-cdn.com/donate-icons/"
     data-title="Support This Project"
     data-lang="auto"
     data-show-github="false">
</div>
```

### 2) 引入脚本

```html
<script src="/sample1/donate-embed.js" defer></script>
```

---

## 旧接入方式（兼容保留）

旧页面无需改动，以下写法仍可继续使用：

```html
<div id="donate-widget-container"
     data-paypal-url="https://paypal.me/your-name"
     data-alipay-qr="https://your-cdn.com/alipay.jpg"
     data-wechat-qr="https://your-cdn.com/wechat.jpg"
     data-asset-base-url="https://your-cdn.com/donate-icons/"
     data-github-url="https://github.com/your-repo">
</div>
<script src="/sample1/donate-embed.js" defer></script>
```

> 说明：脚本会自动扫描 `#donate-widget-container` 与 `[data-donate-widget]`，并去重初始化。

---

## 全局 API

脚本会暴露 `window.DonateWidget`：

```js
window.DonateWidget.init(selectorOrElement, options)
window.DonateWidget.initAll(options)
```

### `init(selectorOrElement, options)`

- `selectorOrElement`: CSS 选择器、DOM 元素、NodeList 或元素数组。
- `options`: 运行时配置，会覆盖 `data-*`。

### 配置项

- `payPalUrl`：PayPal 链接。
- `aliPayQrUrl`：支付宝二维码图片地址。
- `weChatQrUrl`：微信二维码图片地址。
- `assetBaseUrl`：图标资源目录（末尾可省略 `/`）。
- `githubUrl`：GitHub 链接。
- `theme`：主题，默认 `light`。
- `lang`：`auto | zh | en`，默认 `auto`。
- `title`：组件标题，默认 `Donate`。
- `showGithub`：是否显示 GitHub 按钮，默认 `true`。

优先级：`options > data-* > defaults`

---

## Legacy iframe 集成（降级方案）

```html
<iframe src="/sample1/index.html"
        style="overflow:hidden;border:0;min-height:240px;width:100%;"
        frameborder="0"
        scrolling="no"></iframe>
```

---

## 常见问题排查

### 1) 组件没有渲染

- 检查容器是否存在（`#donate-widget-container` 或 `[data-donate-widget]`）。
- 检查 `donate-embed.js` 是否成功加载（Network 200）。

### 2) 图标或二维码不显示

- 确认 `data-asset-base-url`、`data-alipay-qr`、`data-wechat-qr` 路径可访问。
- 二维码图片建议使用 HTTPS 并允许跨域访问。

### 3) 动态插入 DOM 后不生效

- 在内容插入后手动调用：

```js
window.DonateWidget.init('.new-widget-container');
```

### 4) 点击 PayPal 没有跳转

- 组件默认会弹确认框；确认后才会新开页跳转。
- 若浏览器拦截弹窗，请允许当前站点打开新标签页。

---

## 文件说明

- `index.html`：V2 落地页（现代简洁展示 + 实时预览）。
- `sample1/donate-embed.js`：V2 核心嵌入脚本。
- `sample1/index.html`：Legacy 示例页（iframe 可直接引用）。
- `sample1/style.css` / `sample1/script.js`：Legacy 页面样式与脚本。

---

## License

MIT
