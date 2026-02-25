(function () {
  'use strict';

  var SHOW_CLASS = 'showQR';
  var HIDE_CLASS = 'hideQR';
  var ACTIVE_CLASS = 'is-active';

  document.addEventListener('DOMContentLoaded', function () {
    var donateText = document.getElementById('DonateText');
    var donateBox = document.getElementById('donateBox');
    var github = document.getElementById('github');
    var qrBox = document.getElementById('QRBox');
    var mainBox = document.getElementById('MainBox');
    var qrImage = document.getElementById('LegacyQRImage');
    var qrTitle = document.getElementById('LegacyQRTitle');
    var closeButton = document.getElementById('CloseQR');

    if (!donateBox || !qrBox || !mainBox || !qrImage || !qrTitle || !closeButton) {
      return;
    }

    var blurTargets = [donateText, donateBox, github].filter(Boolean);
    var lastTrigger = null;

    var qrConfig = {
      alipay: {
        title: '支付宝',
        url: 'images/al.jpg',
        alt: '支付宝收款二维码'
      },
      wechat: {
        title: '微信',
        url: 'images/wx.jpg',
        alt: '微信收款二维码'
      }
    };

    var payPalLink = document.querySelector('#PayPal a');
    if (payPalLink) {
      payPalLink.addEventListener('click', function (event) {
        event.preventDefault();
        var confirmed = window.confirm('您即将离开当前页面跳转到 PayPal 进行付款，确定要继续吗？');
        if (confirmed) {
          window.open(this.href, '_blank', 'noopener');
        }
      });
    }

    donateBox.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-method]');
      if (!trigger) {
        return;
      }

      var method = trigger.getAttribute('data-method');
      if (!qrConfig[method]) {
        return;
      }

      event.preventDefault();
      showQR(method, trigger);
    });

    qrBox.addEventListener('click', function (event) {
      if (event.target === qrBox) {
        hideQR();
      }
    });

    closeButton.addEventListener('click', function () {
      hideQR();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && qrBox.classList.contains(ACTIVE_CLASS)) {
        hideQR();
      }
    });

    function showQR(method, trigger) {
      var entry = qrConfig[method];
      if (!entry) {
        return;
      }

      lastTrigger = trigger || null;
      qrTitle.textContent = entry.title;
      qrImage.src = entry.url;
      qrImage.alt = entry.alt;

      blurTargets.forEach(function (node) {
        node.classList.add('blur');
      });

      qrBox.hidden = false;
      qrBox.classList.add(ACTIVE_CLASS);
      mainBox.classList.remove(HIDE_CLASS);
      mainBox.classList.add(SHOW_CLASS);

      closeButton.focus();
    }

    function hideQR() {
      mainBox.classList.remove(SHOW_CLASS);
      mainBox.classList.add(HIDE_CLASS);

      window.setTimeout(function () {
        qrBox.hidden = true;
        qrBox.classList.remove(ACTIVE_CLASS);
        mainBox.classList.remove(HIDE_CLASS);
        qrImage.removeAttribute('src');

        blurTargets.forEach(function (node) {
          node.classList.remove('blur');
        });

        if (lastTrigger && typeof lastTrigger.focus === 'function') {
          lastTrigger.focus();
        }
      }, 220);
    }
  });
})();
