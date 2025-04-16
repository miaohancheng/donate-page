    /**
     * Donate Widget Embed Script
     *
     * Usage:
     * 1. Include jQuery on your page.
     * 2. Add <div id="donate-widget-container" [data-attributes...]></div> where you want the widget.
     * 3. Include this script using <script src="path/to/this/donate-embed.js" defer></script.
     * 4. Host this script and all required image assets (icons, QR codes) on a server/CDN.
     * 5. Configure URLs via data-* attributes on the container div or modify the defaults below.
     *
     * MODIFIED: Uses position:absolute, with left/top values adjusted to visually match the original iframe fixed layout.
     * Also adjusted z-index to match original stacking order (donateBox above DonateText).
     * ADDED: Multi-language support for PayPal confirmation message based on browser language.
     */
    (function() {
        // Wait for the DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', function() {

            // --- Configuration ---
            const containerId = 'donate-widget-container'; // ID of the placeholder div
            const container = document.getElementById(containerId);

            // Check if the container element exists
            if (!container) {
                console.error(`Donate Widget Error: Container element with id "${containerId}" not found.`);
                return;
            }

            // Check for jQuery dependency
            if (typeof jQuery === 'undefined') {
                console.error("Donate Widget Error: jQuery is required but not found. Please include jQuery on your page before this script.");
                // return; // Stop execution if jQuery is missing
            }
             // Use jQuery safely
            const $ = jQuery;

            // --- Define Default URLs First ---
            const defaultUrls = {
                payPal: 'https://paypal.me/miaohancheng',
                aliPayQr: 'https://miaohancheng.com/donate-page/sample1/images/al.jpg',
                weChatQr: 'https://miaohancheng.com/donate-page/sample1/images/wx.jpg',
                github: 'https://github.com/miaohancheng/donate-page',
                assetBase: 'https://miaohancheng.com/donate-page/sample1/images/'
            };

            // --- Read Configuration ---
            const config = {
                payPalUrl: container.dataset.paypalUrl || defaultUrls.payPal,
                aliPayQrUrl: container.dataset.alipayQr || defaultUrls.aliPayQr,
                weChatQrUrl: container.dataset.wechatQr || defaultUrls.weChatQr,
                githubUrl: container.dataset.githubUrl,
                assetBaseUrl: (container.dataset.assetBaseUrl || defaultUrls.assetBase).replace(/\/?$/, '/')
            };
            if (config.githubUrl === undefined && defaultUrls.github) {
                 config.githubUrl = defaultUrls.github;
            }

            // --- 1. Inject CSS into <head> ---
            injectCSS(config.assetBaseUrl, containerId);

            // --- 2. Create HTML Structure inside the container ---
            createHTML(container, config);

            // --- 3. Initialize JavaScript Logic (Event Handlers etc.) ---
            initializeLogic(config, containerId);

        });

        /**
         * Injects necessary CSS rules into the document's <head>.
         * MODIFIED: Uses position:absolute consistently. Adjusted left/top and z-index to match original fixed layout visually.
         * @param {string} assetBaseUrl - The base URL for loading image assets (icons).
         * @param {string} containerId - The ID of the widget container element.
         */
        function injectCSS(assetBaseUrl, containerId) {
            // CSS rules using absolute positioning relative to the container
            const css = `
                #${containerId} {
                    position: relative; /* Crucial for absolute positioning of children */
                    min-height: 100px;   /* Ensure minimum space for the widget */
                    min-width: 300px;   /* Ensure minimum space for the widget */
                    font-family: "Helvetica Neue", Ubuntu, "WenQuanYi Micro Hei", Helvetica, "Hiragino Sans GB", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Micro Hei Mono", "WenQuanYi Zen Hei", "WenQuanYi Zen Hei", "Apple LiGothic Medium", "SimHei", "ST Heiti", "WenQuanYi Zen Hei Sharp", Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    line-height: 1.8em;
                    text-shadow: 0 0 1px rgba(255,255,255,0.1);
                }
                #${containerId} img { border-width: 0px; max-width: 100%; }
                #${containerId} a { color: #000; text-decoration: none; outline:none; border:none; }
                #${containerId} .list, #${containerId} .list li { list-style: none; list-style-type: none; margin: 0px; padding: 0px; }
                #${containerId} .tr3 { transition: all .3s; }
                #${containerId} .blur { filter: blur(3px); -webkit-filter: blur(3px); }

                /* --- Absolute Positioning for Key Elements --- */
                #${containerId} #DonateText, #${containerId} #donateBox, #${containerId} #github, #${containerId} #QRBox {
                    position: absolute; /* Use absolute positioning */
                }

                #${containerId} #DonateText {
                    font-size: 12px;
                    width: 70px;
                    height: 70px;
                    line-height: 70px;
                    color: #fff;
                    background: #ffd886 url(${assetBaseUrl}like.svg) no-repeat center 10px;
                    background-size: 20px;
                    border-radius: 35px;
                    text-align: center;
                    /* Original fixed positioning values */
                    left: calc(50% - 120px);
                    top: calc(50% - 60px);
                    z-index: 9; /* Adjusted z-index (below donateBox) */
                    transform: rotatez(-15deg);
                }

                #${containerId} #donateBox {
                    /* Original fixed positioning values */
                    left: calc(50% - 115.5px); /* Adjusted to match original fixed */
                    top: calc(50% - 15px);    /* Adjusted to match original fixed */
                    background-color: #fff;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    width: 225px;
                    height: 28px;
                    z-index: 10; /* Adjusted z-index (above DonateText) */
                    display: flex;
                }

                #${containerId} #donateBox li {
                    width: 74px;
                    flex: 1 1 74px;
                    text-align: center;
                    border-left: 1px solid #ddd;
                    background: no-repeat center center;
                    background-color: rgba(204, 217, 220, 0.1);
                    background-size: 45px;
                    transition: all .3s;
                    cursor: pointer;
                    overflow: hidden;
                    line-height: 600px;
                    height: 28px;
                    filter: grayscale(1);
                    -webkit-filter: grayscale(1);
                    opacity: 0.5;
                    position: relative; /* Needed for tooltip */
                }
                #${containerId} #donateBox li:hover {
                    background-color: rgba(204, 217, 220, 0.3);
                    filter: grayscale(0);
                    -webkit-filter: grayscale(0);
                    opacity: 1;
                }
                #${containerId} #donateBox>li:first-child { border-left-width: 0; }
                #${containerId} #donateBox a { display: block; height: 100%; width: 100%; }

                #${containerId} #donateBox #PayPal { background-image: url(${assetBaseUrl}paypal.svg); }
                #${containerId} #donateBox #AliPay { background-image: url(${assetBaseUrl}alipay.svg); }
                #${containerId} #donateBox #WeChat { background-image: url(${assetBaseUrl}wechat.svg); }

                 /* QR Box Styling */
                #${containerId} #QRBox {
                    /* Original fixed positioning values (relative to container) */
                    top: 0;
                    left: 0;
                    width: 100%; /* Cover the container */
                    height: 100%;/* Cover the container */
                    z-index: 100; /* Keep highest */
                    background-color: transparent;
                    display: none;
                    perspective: 400px;
                }
                #${containerId} #MainBox {
                    cursor: pointer;
                    position: absolute; /* Keep absolute for centering within QRBox */
                    text-align: center;
                    width: 200px;
                    height: 200px;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    background: #fff;
                    border-radius: 6px;
                    opacity: 0;
                    transition: opacity 0.5s ease-in-out; /* Simplified transition */
                    transform-style: preserve-3d;
                    transform-origin: center center;
                    overflow: hidden;
                    padding: 5px;
                    box-sizing: border-box;
                    border: none;
                    outline: none;
                     box-shadow: 0px 2px 7px rgba(0,0,0,0.3);
                }
                 #${containerId} #qrCodeImage {
                     max-width: 100%;
                     max-height: 100%;
                     display: block;
                     margin: auto;
                 }

                /* Github Link Styling */
                #${containerId} #github {
                    width: 24px;
                    height: 24px;
                    /* Original fixed positioning values */
                    left: calc(50% + 98.5px); /* Adjusted to match original fixed */
                    top: calc(50% - 30px);   /* Adjusted to match original fixed */
                    background: no-repeat center center url(${assetBaseUrl}github.svg);
                    background-size: contain;
                    opacity: 0.3;
                    transform: rotatez(15deg);
                    z-index: 9; /* Keep same level as DonateText */
                     transition: all .3s;
                }
                 #${containerId} #github:hover {
                     opacity: 0.8;
                 }

                /* Tooltip Styles (data-footnote) */
                #${containerId} [data-footnote] {
                    position: relative;
                    overflow: hidden;
                }
                #${containerId} [data-footnote]:hover { overflow: visible; }
                #${containerId} [data-footnote]::before, #${containerId} [data-footnote]::after {
                    position: absolute;
                    transition: all .3s;
                    transform: translate3d(-50%,0,0);
                    opacity: 0;
                    left: 50%;
                    z-index: 110; /* Keep above QRBox */
                    pointer-events: none;
                }
                #${containerId} [data-footnote]::before {
                    content: attr(data-footnote);
                    border-radius: 4px;
                    background-color: rgba(50,50,50,0.9);
                    color: #fff;
                    height: auto;
                    line-height: 1.4;
                    padding: 4px 8px;
                    font-size: 12px;
                    white-space: nowrap;
                    top: -30px;
                }
                #${containerId} [data-footnote]::after {
                    content: '';
                    border: 5px solid transparent;
                    border-top-color: rgba(50,50,50,0.9);
                    top: -10px;
                }
                #${containerId} [data-footnote]:hover::before, #${containerId} [data-footnote]:hover::after {
                    opacity: 1;
                    transform: translate3d(-50%, -5px, 0);
                }

                /* Animation Keyframes */
                @keyframes donateWidgetShowQR {
                     from { transform: translate(-50%, -50%) rotateX(90deg); opacity: 0; }
                     to { transform: translate(-50%, -50%) rotateX(0deg); opacity: 1; }
                }
                @keyframes donateWidgetHideQR {
                    from { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    to { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                }

                #${containerId} #MainBox.showQR {
                    opacity: 1;
                    animation: donateWidgetShowQR 0.5s ease-out forwards;
                }
                #${containerId} #MainBox.hideQR {
                    opacity: 0;
                    animation: donateWidgetHideQR 0.4s ease-in forwards;
                }
            `;
            const styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            styleElement.appendChild(document.createTextNode(css));
            document.head.appendChild(styleElement);
        }

        /**
         * Creates the necessary HTML elements within the container.
         * @param {HTMLElement} container - The container element to populate.
         * @param {object} config - The configuration object with URLs.
         */
        function createHTML(container, config) {
            // Clear container first
            container.innerHTML = '';
            let githubLinkHTML = '';
            if (config.githubUrl) {
                githubLinkHTML = `<a id="github" href="${config.githubUrl}" target="_blank" title="Github" class="tr3"></a>`; // Added class back
            }

            container.innerHTML = `
                ${githubLinkHTML}
                <div id="DonateText" class="tr3">Donate</div>
                <ul id="donateBox" class="list tr3">
                    <li id="PayPal" data-footnote="通过 PayPal 付款"><a href="${config.payPalUrl}" target="_blank" title="PayPal付款页">PayPal</a></li>
                    <li id="AliPay" data-footnote="点击查看支付宝二维码"><a title="支付宝付款码">AliPay</a></li>
                    <li id="WeChat" data-footnote="点击查看微信二维码"><a title="微信付款码">WeChat</a></li>
                </ul>
                <div id="QRBox"> <div id="MainBox">
                        </div>
                </div>
            `;
        }

        /**
         * Initializes the JavaScript event listeners and logic.
         * @param {object} config - The configuration object with URLs.
         * @param {string} containerId - The ID of the widget container element.
         */
        function initializeLogic(config, containerId) {
            const $ = jQuery;

            // --- Translations for PayPal Confirmation ---
            // Add more languages as needed
            const translations = {
                'en': 'You are about to leave this page to make a payment via PayPal. Are you sure you want to continue?',
                'en-US': 'You are about to leave this page to make a payment via PayPal. Are you sure you want to continue?',
                'en-GB': 'You are about to leave this page to make a payment via PayPal. Are you sure you want to continue?',
                'zh': '您即将离开当前页面跳转到 PayPal 进行付款，确定要继续吗？',
                'zh-CN': '您即将离开当前页面跳转到 PayPal 进行付款，确定要继续吗？',
                'zh-TW': '您即將離開目前頁面跳轉到 PayPal 進行付款，確定要繼續嗎？',
                'ja': 'このページを離れてPayPalで支払います。続行してもよろしいですか？', // Japanese example
                'ko': 'PayPal을 통해 결제하기 위해 이 페이지를 떠나려고 합니다. 계속하시겠습니까?', // Korean example
                'es': 'Está a punto de salir de esta página para realizar un pago a través de PayPal. ¿Está seguro de que desea continuar?', // Spanish example
                'fr': 'Vous êtes sur le point de quitter cette page pour effectuer un paiement via PayPal. Êtes-vous sûr de vouloir continuer ?', // French example
                'de': 'Sie sind dabei, diese Seite zu verlassen, um eine Zahlung über PayPal vorzunehmen. Möchten Sie wirklich fortfahren?', // German example
            };

            const containerSel = `#${containerId}`;
            const QRBox    = $(`${containerSel} #QRBox`);
            const MainBox  = $(`${containerSel} #MainBox`);
            const donateBoxItems = $(`${containerSel} #donateBox>li`);
            const otherElements = $(`${containerSel} #DonateText, ${containerSel} #donateBox, ${containerSel} #github`);

            // --- PayPal Click Confirmation (Multi-language) ---
            $(`${containerSel} #PayPal a`).off('click.donate').on('click.donate', function(event) {
                event.preventDefault();

                // Get browser language
                const userLang = navigator.language || 'en'; // Default to 'en'
                const baseLang = userLang.split('-')[0]; // Get base language (e.g., 'en' from 'en-US')

                // Find the appropriate message
                // Check full language code first (e.g., 'zh-CN'), then base language (e.g., 'zh'), then fallback to English ('en')
                const message = translations[userLang] || translations[baseLang] || translations['en'];

                // Show confirmation dialog with the selected message
                const confirmLeave = confirm(message);
                if (confirmLeave) {
                    window.open(this.href, '_blank');
                }
            });

            // --- Hide QR Function ---
            function hideQR() {
                MainBox.removeClass('showQR').addClass('hideQR');
                setTimeout(function() {
                    QRBox.fadeOut(300, function() {
                        MainBox.removeClass('hideQR').empty();
                    });
                    otherElements.removeClass('blur');
                    $(document).off('keydown.dismissQR click.dismissQR');
                }, 400);
            }

            // --- Show QR Function ---
            function showQR(qrImageUrl) {
                MainBox.empty();

                if (qrImageUrl) {
                    const qrImg = $('<img>', {
                       id: 'qrCodeImage',
                       src: qrImageUrl,
                       alt: '付款二维码' // Alt text might also need translation in a more complex setup
                    });
                    qrImg.on('click.donate', function(event) {
                        event.stopPropagation();
                    });
                    MainBox.append(qrImg);
                }

                otherElements.addClass('blur');
                QRBox.fadeIn(300, function() {
                    MainBox.removeClass('hideQR').addClass('showQR');
                });

                // --- Bind Document Listeners for Closing QR ---
                $(document).on('keydown.dismissQR', function(event) {
                    if (event.key === "Escape" || event.which === 27) {
                        hideQR();
                    }
                });
                setTimeout(function() {
                    $(document).on('click.dismissQR', function(event) {
                        // Close if click is outside MainBox or directly on QRBox background
                        if (!$(event.target).closest(MainBox).length || $(event.target).is(QRBox)) {
                             hideQR();
                        }
                    });
                }, 0);
            }

            // --- Attach Click Handlers to Donate Buttons (AliPay, WeChat) ---
            donateBoxItems.off('click.donate').on('click.donate', function(event) {
                event.stopPropagation();
                const thisID = $(this).attr('id');

                if (thisID === 'AliPay') {
                    if(config.aliPayQrUrl) {
                        showQR(config.aliPayQrUrl);
                    } else {
                        console.warn("Donate Widget: AliPay QR URL not configured.");
                    }
                } else if (thisID === 'WeChat') {
                     if(config.weChatQrUrl) {
                        showQR(config.weChatQrUrl);
                    } else {
                        console.warn("Donate Widget: WeChat QR URL not configured.");
                    }
                }
            });

             QRBox.off('click.donate').on('click.donate', function(event) {
                 if ($(event.target).is(QRBox)) {
                     hideQR();
                 }
             });

        } // end initializeLogic

    })(); // End of self-executing wrapper function
