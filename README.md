# Donate-Page

提供几款不同的捐赠按钮样式，包含 PayPal、支付宝、微信支付方式，方便集成到你的项目中。

**Demo 示例：** [在线演示](https://miaohancheng.com/donate-page/) 

---

## ✨ 新功能：JS 嵌入式集成 (推荐)

为了解决 `iframe` 集成方式带来的交互限制（如点击外部无法关闭二维码、移动端二维码交互不便等问题），我们现在提供了一种更现代、更灵活的 JS 嵌入方式。

**优点：**

* **集成简单**：只需在你的 HTML 中添加一个 `div` 容器和一行 `<script>` 标签。
* **交互友好**：二维码使用 `<img>` 标签展示，方便用户在微信等环境中长按识别或保存；点击组件外部区域可关闭二维码。
* **配置灵活**：可以通过 `data-*` 属性轻松配置支付链接、二维码图片地址等。
* **无需复制资源**：脚本会自动加载所需的 CSS 和图标资源（你需要将脚本和资源托管在服务器上）。

**使用方法：**

1.  **确保页面已加载 jQuery**：此脚本依赖 jQuery。
2.  **添加 HTML 占位符**：在你想要显示捐赠按钮的位置添加一个 `div`：
    ```html
    <div id="donate-widget-container"
         data-paypal-url="[https://paypal.me/your-paypal](https://paypal.me/your-paypal)" data-alipay-qr="[https://your-domain.com/images/your-alipay.jpg](https://your-domain.com/images/your-alipay.jpg)" data-wechat-qr="[https://your-domain.com/images/your-wechat.jpg](https://your-domain.com/images/your-wechat.jpg)" data-asset-base-url="[https://your-domain.com/donate-assets/images/](https://your-domain.com/donate-assets/images/)" data-github-url="[https://github.com/your-repo](https://github.com/your-repo)" >
        </div>
    ```
    * `id` 必须是 `donate-widget-container`。
    * `data-*` 属性是可选的，如果不提供，脚本会使用内置的默认值（但建议你提供自己的 URL）。
3.  **引入 JS 脚本**：在 `</body>` 标签前引入托管的 `donate-embed.js` 文件：
    ```html
    <script src="[https://your-domain.com/path/to/donate-embed.js](https://your-domain.com/path/to/donate-embed.js)" defer></script>
    ```
    * 将 `https://your-domain.com/path/to/donate-embed.js` 替换为你实际托管脚本的 URL。
4.  **托管资源**：你需要将 `donate-embed.js` 文件、`sample1/images/` 目录下的所有图标文件 (`like.svg`, `paypal.svg`, `alipay.svg`, `wechat.svg`, `github.svg`) 以及你的二维码图片托管到你的服务器或 CDN 上，并确保上述配置中的 URL 正确无误。

---

## 样式预览

### 样式一：翻转卡片 (JS 嵌入脚本基于此样式)

* **在线演示**：[./sample1/index.html](https://miaohancheng.com/donate-page/sample1/index.html) (原始 iframe 版本)
* **JS 嵌入**：查看上面的 **JS 嵌入式集成** 说明。
* ![翻转卡片动图](https://upload-images.jianshu.io/upload_images/1819713-518ef42c3301b2fa.gif?imageMogr2/auto-orient/strip%7CimageView2/2/w/420/format/webp "翻转卡片动图")

## 原始 iframe 集成方式 (旧版)

如果你仍希望使用 iframe 方式（不推荐），可以参考 `sample1`  目录下的说明。

例如，嵌入样式一：
```html
<iframe src="[https://miaohancheng.com/donate-page/sample1/index.html](https://miaohancheng.com/donate-page/sample1/index.html)" style="overflow-x:hidden;overflow-y:hidden; border:0 none #fff; min-height:240px; width:100%;" frameborder="0" scrolling="no"></iframe>