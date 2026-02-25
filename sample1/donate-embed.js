/**
 * Donate Widget Embed Script (V2)
 *
 * Backward compatible:
 * - Supports legacy container id: #donate-widget-container
 * - Supports legacy data attributes: data-paypal-url, data-alipay-qr, data-wechat-qr,
 *   data-asset-base-url, data-github-url
 *
 * New features:
 * - Multi-instance mounts via [data-donate-widget]
 * - No jQuery dependency
 * - Accessible dialog / keyboard support
 * - Global API: window.DonateWidget.init(selectorOrElement, options)
 */
(function () {
  'use strict';

  var STYLE_ID = 'donate-widget-style';
  var LEGACY_CONTAINER_ID = 'donate-widget-container';

  var instances = new WeakMap();

  var DEFAULTS = {
    payPalUrl: 'https://paypal.me/miaohancheng',
    aliPayQrUrl: 'https://miaohancheng.com/donate-page/sample1/images/al.jpg',
    weChatQrUrl: 'https://miaohancheng.com/donate-page/sample1/images/wx.jpg',
    githubUrl: 'https://github.com/miaohancheng/donate-page',
    assetBaseUrl: 'https://miaohancheng.com/donate-page/sample1/images/',
    theme: 'light',
    lang: 'auto',
    title: 'Donate',
    showGithub: true
  };

  var I18N = {
    zh: {
      donate: '赞助',
      payPal: 'PayPal',
      aliPay: '支付宝',
      weChat: '微信',
      openAliPayQr: '打开支付宝二维码',
      openWeChatQr: '打开微信二维码',
      qrDialogLabel: '收款二维码',
      qrImageAlt: '支付二维码',
      closeDialog: '关闭二维码弹窗',
      qrHint: '请使用对应 App 扫码或长按识别。',
      qrLoadError: '二维码加载失败，请稍后重试。',
      payPalConfirm: '您即将离开当前页面跳转到 PayPal 付款，是否继续？'
    },
    en: {
      donate: 'Donate',
      payPal: 'PayPal',
      aliPay: 'AliPay',
      weChat: 'WeChat',
      openAliPayQr: 'Open AliPay QR code',
      openWeChatQr: 'Open WeChat QR code',
      qrDialogLabel: 'Payment QR code',
      qrImageAlt: 'Payment QR code',
      closeDialog: 'Close QR dialog',
      qrHint: 'Use the matching app to scan this code.',
      qrLoadError: 'Failed to load QR code. Please try again.',
      payPalConfirm: 'You are leaving this page to continue payment on PayPal. Continue?'
    }
  };

  function toArray(input) {
    if (!input) {
      return [];
    }

    if (typeof input === 'string') {
      return Array.prototype.slice.call(document.querySelectorAll(input));
    }

    if (input instanceof Element) {
      return [input];
    }

    if (input instanceof NodeList || Array.isArray(input)) {
      return Array.prototype.slice.call(input).filter(function (item) {
        return item instanceof Element;
      });
    }

    return [];
  }

  function normalizeBoolean(value, fallback) {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value !== 'string') {
      return fallback;
    }

    var normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }

    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }

    return fallback;
  }

  function trimOrEmpty(value) {
    if (typeof value !== 'string') {
      return '';
    }

    return value.trim();
  }

  function normalizeAssetBase(value) {
    var url = trimOrEmpty(value);
    if (!url) {
      return '';
    }

    return url.replace(/\/?$/, '/');
  }

  function resolveTextLang(langPref) {
    var value = (langPref || 'auto').toLowerCase();
    if (value !== 'auto') {
      return value.indexOf('zh') === 0 ? 'zh' : 'en';
    }

    var navLang = (navigator.language || 'en').toLowerCase();
    return navLang.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  function localize(lang) {
    return I18N[lang] || I18N.en;
  }

  function parseDataset(element) {
    var d = element.dataset || {};

    return {
      payPalUrl: trimOrEmpty(d.paypalUrl),
      aliPayQrUrl: trimOrEmpty(d.alipayQr),
      weChatQrUrl: trimOrEmpty(d.wechatQr),
      githubUrl: trimOrEmpty(d.githubUrl),
      assetBaseUrl: normalizeAssetBase(d.assetBaseUrl),
      theme: trimOrEmpty(d.theme),
      lang: trimOrEmpty(d.lang),
      title: trimOrEmpty(d.title),
      showGithub: d.showGithub
    };
  }

  function mergeConfig(element, options) {
    var datasetConfig = parseDataset(element);
    var runtimeOptions = options || {};

    var config = {
      payPalUrl: trimOrEmpty(runtimeOptions.payPalUrl || datasetConfig.payPalUrl || DEFAULTS.payPalUrl),
      aliPayQrUrl: trimOrEmpty(runtimeOptions.aliPayQrUrl || datasetConfig.aliPayQrUrl || DEFAULTS.aliPayQrUrl),
      weChatQrUrl: trimOrEmpty(runtimeOptions.weChatQrUrl || datasetConfig.weChatQrUrl || DEFAULTS.weChatQrUrl),
      githubUrl: trimOrEmpty(runtimeOptions.githubUrl || datasetConfig.githubUrl || DEFAULTS.githubUrl),
      assetBaseUrl: normalizeAssetBase(runtimeOptions.assetBaseUrl || datasetConfig.assetBaseUrl || DEFAULTS.assetBaseUrl),
      theme: trimOrEmpty(runtimeOptions.theme || datasetConfig.theme || DEFAULTS.theme) || DEFAULTS.theme,
      lang: trimOrEmpty(runtimeOptions.lang || datasetConfig.lang || DEFAULTS.lang) || DEFAULTS.lang,
      title: trimOrEmpty(runtimeOptions.title || datasetConfig.title || DEFAULTS.title) || DEFAULTS.title,
      showGithub: normalizeBoolean(
        runtimeOptions.showGithub !== undefined ? runtimeOptions.showGithub : datasetConfig.showGithub,
        DEFAULTS.showGithub
      )
    };

    config.textLang = resolveTextLang(config.lang);
    config.t = localize(config.textLang);

    return config;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.dw-root{',
      '  --dw-bg:#f6f8fb;',
      '  --dw-card:#ffffff;',
      '  --dw-card-soft:#f2f5f9;',
      '  --dw-text:#102132;',
      '  --dw-muted:#5b6d80;',
      '  --dw-primary:#0f8f82;',
      '  --dw-primary-strong:#0b6e64;',
      '  --dw-border:rgba(16,33,50,.14);',
      '  --dw-shadow:0 16px 40px rgba(16,33,50,.12);',
      '  --dw-radius:18px;',
      '  --dw-action-height:52px;',
      '  --dw-focus:#f1a63b;',
      '  position:relative;',
      '  min-height:170px;',
      '  width:100%;',
      '  font-family:"Manrope","Avenir Next","PingFang SC","Noto Sans SC","Helvetica Neue",sans-serif;',
      '  color:var(--dw-text);',
      '}',
      '.dw-root,.dw-root *{box-sizing:border-box;}',
      '.dw-root[data-theme="light"]{}',
      '.dw-shell{',
      '  position:relative;',
      '  display:grid;',
      '  gap:14px;',
      '  align-items:center;',
      '  padding:16px;',
      '  border:1px solid var(--dw-border);',
      '  border-radius:var(--dw-radius);',
      '  background:linear-gradient(135deg,#ffffff 0%,var(--dw-card-soft) 100%);',
      '  box-shadow:var(--dw-shadow);',
      '}',
      '.dw-heading{',
      '  display:flex;',
      '  align-items:center;',
      '  gap:10px;',
      '  margin:0;',
      '  font-size:14px;',
      '  font-weight:700;',
      '  letter-spacing:.08em;',
      '  text-transform:uppercase;',
      '  color:var(--dw-muted);',
      '}',
      '.dw-like{',
      '  width:34px;',
      '  height:34px;',
      '  border-radius:999px;',
      '  background:#ffd98b center/18px no-repeat;',
      '  flex:0 0 auto;',
      '}',
      '.dw-actions{',
      '  display:grid;',
      '  grid-template-columns:repeat(3,minmax(0,1fr));',
      '  gap:8px;',
      '}',
      '.dw-action{',
      '  position:relative;',
      '  display:flex;',
      '  align-items:center;',
      '  justify-content:center;',
      '  height:var(--dw-action-height);',
      '  border-radius:14px;',
      '  border:1px solid var(--dw-border);',
      '  background:var(--dw-card);',
      '  color:transparent;',
      '  text-decoration:none;',
      '  cursor:pointer;',
      '  transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease,opacity .2s ease;',
      '  outline:none;',
      '}',
      '.dw-action::before{',
      '  content:"";',
      '  width:40px;',
      '  height:28px;',
      '  background:var(--dw-icon) center/contain no-repeat;',
      '}',
      '.dw-action:hover{',
      '  transform:translateY(-1px);',
      '  box-shadow:0 10px 18px rgba(16,33,50,.12);',
      '  border-color:rgba(15,143,130,.45);',
      '}',
      '.dw-action:focus-visible,.dw-github:focus-visible,.dw-close:focus-visible{',
      '  outline:2px solid var(--dw-focus);',
      '  outline-offset:2px;',
      '}',
      '.dw-action[disabled]{',
      '  cursor:not-allowed;',
      '  opacity:.45;',
      '  filter:grayscale(1);',
      '}',
      '.dw-meta{',
      '  display:flex;',
      '  justify-content:flex-end;',
      '  align-items:center;',
      '}',
      '.dw-github{',
      '  width:26px;',
      '  height:26px;',
      '  border-radius:50%;',
      '  border:1px solid var(--dw-border);',
      '  background:var(--dw-card) var(--dw-icon-github) center/15px no-repeat;',
      '  opacity:.8;',
      '  transition:opacity .2s ease, transform .2s ease;',
      '}',
      '.dw-github:hover{opacity:1;transform:translateY(-1px);}',
      '.dw-overlay{',
      '  position:fixed;',
      '  inset:0;',
      '  background:rgba(8,22,34,.45);',
      '  display:none;',
      '  align-items:center;',
      '  justify-content:center;',
      '  padding:18px;',
      '  z-index:9999;',
      '}',
      '.dw-overlay.is-open{display:flex;}',
      '.dw-dialog{',
      '  width:min(92vw,320px);',
      '  border-radius:16px;',
      '  background:var(--dw-card);',
      '  border:1px solid rgba(16,33,50,.1);',
      '  box-shadow:0 18px 48px rgba(16,33,50,.28);',
      '  padding:14px;',
      '  display:grid;',
      '  gap:10px;',
      '  transform:translateY(8px) scale(.98);',
      '  opacity:0;',
      '  transition:transform .22s ease, opacity .22s ease;',
      '}',
      '.dw-overlay.is-open .dw-dialog{',
      '  transform:translateY(0) scale(1);',
      '  opacity:1;',
      '}',
      '.dw-dialog-head{',
      '  display:flex;',
      '  align-items:center;',
      '  justify-content:space-between;',
      '  gap:10px;',
      '}',
      '.dw-dialog-title{',
      '  margin:0;',
      '  font-size:14px;',
      '  font-weight:700;',
      '  color:var(--dw-text);',
      '}',
      '.dw-close{',
      '  width:30px;',
      '  height:30px;',
      '  border-radius:10px;',
      '  border:1px solid var(--dw-border);',
      '  background:var(--dw-card-soft);',
      '  color:var(--dw-text);',
      '  cursor:pointer;',
      '  font-size:18px;',
      '  line-height:1;',
      '}',
      '.dw-qr-wrap{',
      '  margin:0;',
      '  border-radius:12px;',
      '  background:var(--dw-card-soft);',
      '  border:1px solid var(--dw-border);',
      '  overflow:hidden;',
      '  min-height:210px;',
      '  display:grid;',
      '  place-items:center;',
      '}',
      '.dw-qr{',
      '  display:block;',
      '  width:100%;',
      '  height:auto;',
      '  max-width:260px;',
      '  background:#fff;',
      '}',
      '.dw-qr-hint,.dw-qr-error{',
      '  margin:0;',
      '  font-size:13px;',
      '  color:var(--dw-muted);',
      '}',
      '.dw-qr-error{color:#b4442a;display:none;}',
      '.dw-overlay.has-error .dw-qr-error{display:block;}',
      '.dw-overlay.has-error .dw-qr-hint{display:none;}',
      '@media (max-width:520px){',
      '  .dw-shell{padding:14px;gap:12px;}',
      '  .dw-actions{gap:6px;}',
      '  .dw-action{height:48px;border-radius:12px;}',
      '  .dw-like{width:30px;height:30px;background-size:16px;}',
      '}',
      '@media (prefers-reduced-motion:reduce){',
      '  .dw-action,.dw-github,.dw-dialog{transition:none !important;}',
      '  .dw-action:hover,.dw-github:hover{transform:none;}',
      '}'
    ].join('');

    document.head.appendChild(style);
  }

  function isElement(value) {
    return value instanceof Element;
  }

  function buildActionButton(type, text, iconUrl, disabled) {
    var button = document.createElement(type === 'paypal' ? 'a' : 'button');
    button.className = 'dw-action';
    button.setAttribute('aria-label', text);
    button.style.setProperty('--dw-icon', 'url("' + iconUrl + '")');

    if (type === 'paypal') {
      button.href = '#';
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
    } else {
      button.type = 'button';
      button.dataset.method = type;
    }

    button.textContent = text;

    if (disabled) {
      button.setAttribute('disabled', 'disabled');
      button.setAttribute('aria-disabled', 'true');
    }

    return button;
  }

  function DonateWidgetInstance(container, config) {
    this.container = container;
    this.config = config;
    this.lastTrigger = null;
    this.cleanupFns = [];
    this.render();
    this.bindEvents();
  }

  DonateWidgetInstance.prototype.render = function () {
    var config = this.config;
    var t = config.t;

    this.container.classList.add('dw-root');
    this.container.dataset.theme = config.theme;

    var shell = document.createElement('section');
    shell.className = 'dw-shell';
    shell.setAttribute('aria-label', t.donate);

    var heading = document.createElement('p');
    heading.className = 'dw-heading';
    heading.innerHTML = '<span class="dw-like" aria-hidden="true"></span><span>' + escapeHTML(config.title || t.donate) + '</span>';
    heading.querySelector('.dw-like').style.backgroundImage = 'url("' + config.assetBaseUrl + 'like.svg")';

    var actions = document.createElement('div');
    actions.className = 'dw-actions';

    this.payPalAction = buildActionButton('paypal', t.payPal, config.assetBaseUrl + 'paypal.svg', !config.payPalUrl);
    this.aliPayAction = buildActionButton('alipay', t.aliPay, config.assetBaseUrl + 'alipay.svg', !config.aliPayQrUrl);
    this.weChatAction = buildActionButton('wechat', t.weChat, config.assetBaseUrl + 'wechat.svg', !config.weChatQrUrl);

    if (config.payPalUrl) {
      this.payPalAction.href = config.payPalUrl;
    }

    this.aliPayAction.setAttribute('title', t.openAliPayQr);
    this.weChatAction.setAttribute('title', t.openWeChatQr);

    actions.appendChild(this.payPalAction);
    actions.appendChild(this.aliPayAction);
    actions.appendChild(this.weChatAction);

    var meta = document.createElement('div');
    meta.className = 'dw-meta';

    if (config.showGithub && config.githubUrl) {
      this.githubAction = document.createElement('a');
      this.githubAction.className = 'dw-github';
      this.githubAction.href = config.githubUrl;
      this.githubAction.target = '_blank';
      this.githubAction.rel = 'noopener noreferrer';
      this.githubAction.title = 'GitHub';
      this.githubAction.setAttribute('aria-label', 'GitHub');
      this.githubAction.style.setProperty('--dw-icon-github', 'url("' + config.assetBaseUrl + 'github.svg")');
      meta.appendChild(this.githubAction);
    }

    this.overlay = document.createElement('div');
    this.overlay.className = 'dw-overlay';
    this.overlay.setAttribute('aria-hidden', 'true');

    this.overlay.innerHTML = [
      '<div class="dw-dialog" role="dialog" aria-modal="true" aria-label="' + escapeHTML(t.qrDialogLabel) + '">',
      '  <div class="dw-dialog-head">',
      '    <p class="dw-dialog-title"></p>',
      '    <button type="button" class="dw-close" aria-label="' + escapeHTML(t.closeDialog) + '">&times;</button>',
      '  </div>',
      '  <figure class="dw-qr-wrap">',
      '    <img class="dw-qr" alt="' + escapeHTML(t.qrImageAlt) + '" loading="lazy">',
      '  </figure>',
      '  <p class="dw-qr-hint">' + escapeHTML(t.qrHint) + '</p>',
      '  <p class="dw-qr-error" role="status" aria-live="polite">' + escapeHTML(t.qrLoadError) + '</p>',
      '</div>'
    ].join('');

    shell.appendChild(heading);
    shell.appendChild(actions);
    if (meta.childNodes.length) {
      shell.appendChild(meta);
    }

    this.container.innerHTML = '';
    this.container.appendChild(shell);
    this.container.appendChild(this.overlay);

    this.dialogTitle = this.overlay.querySelector('.dw-dialog-title');
    this.dialogClose = this.overlay.querySelector('.dw-close');
    this.qrImage = this.overlay.querySelector('.dw-qr');
  };

  DonateWidgetInstance.prototype.bindEvents = function () {
    var _this = this;
    var t = this.config.t;

    this.payPalAction.addEventListener('click', function (event) {
      if (!(_this.config.payPalUrl && _this.config.payPalUrl.length)) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      var confirmed = window.confirm(t.payPalConfirm);
      if (confirmed) {
        window.open(_this.config.payPalUrl, '_blank', 'noopener');
      }
    });

    this.aliPayAction.addEventListener('click', function (event) {
      event.preventDefault();
      _this.openQR('alipay', _this.aliPayAction);
    });

    this.weChatAction.addEventListener('click', function (event) {
      event.preventDefault();
      _this.openQR('wechat', _this.weChatAction);
    });

    this.dialogClose.addEventListener('click', function () {
      _this.closeQR();
    });

    this.overlay.addEventListener('click', function (event) {
      if (event.target === _this.overlay) {
        _this.closeQR();
      }
    });

    var onKeydown = function (event) {
      if (event.key === 'Escape' && _this.overlay.classList.contains('is-open')) {
        _this.closeQR();
      }
    };

    document.addEventListener('keydown', onKeydown);
    this.cleanupFns.push(function () {
      document.removeEventListener('keydown', onKeydown);
    });

    var onImageError = function () {
      _this.overlay.classList.add('has-error');
    };

    var onImageLoad = function () {
      _this.overlay.classList.remove('has-error');
    };

    this.qrImage.addEventListener('error', onImageError);
    this.qrImage.addEventListener('load', onImageLoad);

    this.cleanupFns.push(function () {
      _this.qrImage.removeEventListener('error', onImageError);
      _this.qrImage.removeEventListener('load', onImageLoad);
    });
  };

  DonateWidgetInstance.prototype.openQR = function (method, trigger) {
    var t = this.config.t;
    var qrUrl = method === 'alipay' ? this.config.aliPayQrUrl : this.config.weChatQrUrl;

    if (!qrUrl) {
      return;
    }

    this.lastTrigger = trigger || null;
    this.dialogTitle.textContent = method === 'alipay' ? t.aliPay : t.weChat;
    this.overlay.classList.remove('has-error');
    this.qrImage.src = qrUrl;

    this.overlay.classList.add('is-open');
    this.overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    this.dialogClose.focus();
  };

  DonateWidgetInstance.prototype.closeQR = function () {
    this.overlay.classList.remove('is-open', 'has-error');
    this.overlay.setAttribute('aria-hidden', 'true');
    this.qrImage.removeAttribute('src');
    document.body.style.overflow = '';

    if (isElement(this.lastTrigger)) {
      this.lastTrigger.focus();
    }
  };

  DonateWidgetInstance.prototype.update = function (options) {
    this.destroy();
    this.config = mergeConfig(this.container, options);
    this.render();
    this.bindEvents();
    instances.set(this.container, this);
  };

  DonateWidgetInstance.prototype.destroy = function () {
    this.cleanupFns.forEach(function (fn) {
      fn();
    });
    this.cleanupFns = [];

    this.closeQR();

    this.container.innerHTML = '';
    this.container.classList.remove('dw-root');
    delete this.container.dataset.theme;

    // Keep object reusable for update in case this method is called directly.
    this.payPalAction = null;
    this.aliPayAction = null;
    this.weChatAction = null;
    this.githubAction = null;
    this.overlay = null;
    this.dialogTitle = null;
    this.dialogClose = null;
    this.qrImage = null;
    this.lastTrigger = null;

    if (instances.get(this.container) === this) {
      instances.delete(this.container);
    }
  };

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initElement(element, options) {
    if (!(element instanceof Element)) {
      return null;
    }

    ensureStyle();

    var existing = instances.get(element);
    if (existing) {
      if (options && Object.keys(options).length) {
        existing.update(options);
      }
      return existing;
    }

    var config = mergeConfig(element, options);
    var instance = new DonateWidgetInstance(element, config);
    instances.set(element, instance);
    return instance;
  }

  function findAutoTargets() {
    var targets = [];
    var seen = new Set();

    var legacy = document.getElementById(LEGACY_CONTAINER_ID);
    if (legacy && !seen.has(legacy)) {
      seen.add(legacy);
      targets.push(legacy);
    }

    var modern = document.querySelectorAll('[data-donate-widget]');
    modern.forEach(function (node) {
      if (!seen.has(node)) {
        seen.add(node);
        targets.push(node);
      }
    });

    return targets;
  }

  function init(selectorOrElement, options) {
    var targets;

    if (!selectorOrElement) {
      targets = findAutoTargets();
    } else {
      targets = toArray(selectorOrElement);
    }

    return targets.map(function (element) {
      return initElement(element, options || {});
    }).filter(Boolean);
  }

  function initAll(options) {
    return init(null, options || {});
  }

  window.DonateWidget = {
    init: init,
    initAll: initAll,
    version: '2.0.0'
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initAll();
    });
  } else {
    initAll();
  }
})();
