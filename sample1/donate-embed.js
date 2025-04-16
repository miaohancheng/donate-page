/**
 * Donate Widget Embed Script
 *
 * Usage:
 * 1. Include jQuery on your page.
 * 2. Add <div id="donate-widget-container" [data-attributes...]></div> where you want the widget.
 * 3. Include this script using <script src="path/to/this/donate-embed.js" defer></script>.
 * 4. Host this script and all required image assets (icons, QR codes) on a server/CDN.
 * 5. Configure URLs via data-* attributes on the container div or modify the defaults below.
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
            // Optionally, you could dynamically load jQuery here if needed
            // return; // Stop execution if jQuery is missing
        }
         // Use jQuery safely
        const $ = jQuery;

        // --- Define Default URLs First ---
        // IMPORTANT: Replace default URLs with your actual hosted asset URLs!
        const defaultUrls = {
            payPal: 'https://paypal.me/miaohancheng',
            aliPayQr: 'https://miaohancheng.com/donate-page/sample1/images/al.jpg', // Example: Needs hosting!
            weChatQr: 'https://miaohancheng.com/donate-page/sample1/images/wx.jpg', // Example: Needs hosting!
            github: 'https://github.com/miaohancheng/donate-page',
            assetBase: 'https://miaohancheng.com/donate-page/sample1/images/' // Example: Base URL for icons
        };

        // --- Read Configuration ---
        // Get settings from data-* attributes on the container, or use defaults.
        const config = {
            payPalUrl: container.dataset.paypalUrl || defaultUrls.payPal,
            aliPayQrUrl: container.dataset.alipayQr || defaultUrls.aliPayQr,
            weChatQrUrl: container.dataset.wechatQr || defaultUrls.weChatQr,
            // Read githubUrl directly, handle default below if needed
            githubUrl: container.dataset.githubUrl,
            // Read assetBaseUrl, ensure trailing slash
            assetBaseUrl: (container.dataset.assetBaseUrl || defaultUrls.assetBase).replace(/\/?$/, '/')
        };

        // Apply default githubUrl only if it wasn't provided via data attribute
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
     * @param {string} assetBaseUrl - The base URL for loading image assets (icons).
     * @param {string} containerId - The ID of the widget container element.
     */
    function injectCSS(assetBaseUrl, containerId) {
        // CSS rules adapted from sample1/style.css
        // URLs are now absolute based on assetBaseUrl
        // Selectors are prefixed with #${containerId} to scope styles and reduce conflicts
        const css = `
            #${containerId} {
                position: relative; /* Crucial for absolute positioning of children */
                min-height: 70px;   /* Ensure minimum space for the widget */
                min-width: 310px;   /* Ensure minimum space for the widget */
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

            /* Positioning relative to the container */
            #${containerId} #DonateText, #${containerId} #donateBox, #${containerId} #github, #${containerId} #QRBox {
                position: absolute;
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
                left: calc(50% - 120px); /* Adjust as needed relative to container */
                top: calc(50% - 60px);  /* Adjust as needed relative to container */
                z-index: 10; /* Ensure it's above buttons */
                transform: rotatez(-15deg);
            }

            #${containerId} #donateBox {
                left: calc(50% - 112.5px); /* Center 225px box */
                top: calc(50% + 15px);   /* Position below text, adjust as needed */
                background-color: #fff;
                border: 1px solid #ddd;
                border-radius: 6px;
                width: 225px;
                height: 28px;
                z-index: 9; /* Below text, above QR box background */
                display: flex; /* Use flexbox for items */
            }

            #${containerId} #donateBox li {
                width: 74px;
                flex: 1 1 74px; /* Allow flex distribution */
                text-align: center;
                border-left: 1px solid #ddd;
                background: no-repeat center center;
                background-color: rgba(204, 217, 220, 0.1);
                background-size: 45px;
                transition: all .3s;
                cursor: pointer;
                overflow: hidden;
                line-height: 600px; /* Image replacement technique */
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
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 100; /* Highest */
                background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
                display: none; /* Initially hidden */
                perspective: 400px;
            }
            #${containerId} #MainBox {
                cursor: pointer;
                position: absolute;
                text-align: center;
                width: 200px; /* QR Code display area */
                height: 200px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%); /* Center in QRBox */
                background: #fff; /* White background for QR */
                border-radius: 6px;
                /* box-shadow: 0px 2px 7px rgba(0,0,0,0.3); */ /* Removed box-shadow */
                opacity: 0;
                transition: opacity 0.5s ease-in-out; /* Fade transition */
                transform-style: preserve-3d;
                transform-origin: center center;
                overflow: hidden;
                padding: 5px; /* Padding around the image */
                box-sizing: border-box;
                border: none; /* Explicitly remove border */
            }
             #${containerId} #qrCodeImage { /* Style for the QR img */
                 max-width: 100%;
                 max-height: 100%;
                 display: block;
                 margin: auto;
             }


            /* Github Link Styling */
            #${containerId} #github {
                width: 24px;
                height: 24px;
                left: calc(50% + 120px); /* Position relative to center, adjust */
                top: calc(50% + 18px);  /* Position relative to center, adjust */
                background: no-repeat center center url(${assetBaseUrl}github.svg);
                background-size: contain;
                opacity: 0.3;
                transform: rotatez(15deg);
                z-index: 9;
                 transition: all .3s;
            }
             #${containerId} #github:hover {
                 opacity: 0.8;
             }

            /* Tooltip Styles (data-footnote) */
            #${containerId} [data-footnote] {
                position: relative; /* Already set on li */
                overflow: hidden;
            }
            #${containerId} [data-footnote]:hover { overflow: visible; }
            #${containerId} [data-footnote]::before, #${containerId} [data-footnote]::after {
                position: absolute;
                transition: all .3s;
                transform: translate3d(-50%,0,0);
                opacity: 0;
                left: 50%; /* Center relative to the li */
                z-index: 110; /* Above QR box */
                pointer-events: none; /* Prevent tooltip from blocking clicks */
            }
            #${containerId} [data-footnote]::before {
                content: attr(data-footnote);
                border-radius: 4px;
                background-color: rgba(50,50,50,0.9);
                color: #fff;
                height: auto; /* Adjust height based on content */
                line-height: 1.4;
                padding: 4px 8px;
                font-size: 12px;
                white-space: nowrap;
                top: -30px; /* Position above the button */
            }
            #${containerId} [data-footnote]::after {
                content: '';
                border: 5px solid transparent;
                border-top-color: rgba(50,50,50,0.9);
                top: -10px; /* Position below the text, pointing down */
            }
            #${containerId} [data-footnote]:hover::before, #${containerId} [data-footnote]:hover::after {
                opacity: 1;
                transform: translate3d(-50%, -5px, 0); /* Move up slightly */
            }

            /* Animation Keyframes (Scoped if possible, or ensure names are unique) */
            @keyframes donateWidgetShowQR { /* Renamed keyframe */
                from { transform: translate(-50%, -50%) rotateX(90deg); opacity: 0; }
                /* Simplified animation for fade/scale */
                 to { transform: translate(-50%, -50%) rotateX(0deg); opacity: 1; }
            }
            @keyframes donateWidgetHideQR { /* Renamed keyframe */
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
        // Clear container first in case of re-initialization
        container.innerHTML = '';

        // Build HTML string (Alternatively use document.createElement for more complex structures)
        let githubLinkHTML = '';
        // Only add github link if config.githubUrl has a value
        if (config.githubUrl) {
            githubLinkHTML = `<a id="github" href="${config.githubUrl}" target="_blank" title="Github"></a>`;
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
        const $ = jQuery; // Use jQuery

        // Select elements within the specific container to avoid conflicts
        const containerSel = `#${containerId}`;
        const QRBox    = $(`${containerSel} #QRBox`);
        const MainBox  = $(`${containerSel} #MainBox`);
        const donateBoxItems = $(`${containerSel} #donateBox>li`);
        const otherElements = $(`${containerSel} #DonateText, ${containerSel} #donateBox, ${containerSel} #github`); // Elements to blur

        // --- PayPal Click Confirmation ---
        $(`${containerSel} #PayPal a`).off('click.donate').on('click.donate', function(event) {
            event.preventDefault();
            const confirmLeave = confirm("您即将离开当前页面跳转到 PayPal 进行付款，确定要继续吗？"); // Confirmation message in Chinese
            if (confirmLeave) {
                window.open(this.href, '_blank');
            }
        });

        // --- Hide QR Function ---
        function hideQR() {
            MainBox.removeClass('showQR').addClass('hideQR');
            // Use timeout matching hide animation duration before hiding the overlay
            setTimeout(function() {
                QRBox.fadeOut(300, function() {
                    MainBox.removeClass('hideQR').empty(); // Clear the QR image
                });
                otherElements.removeClass('blur'); // Remove blur effect
                // Unbind document listeners specific to QR dismissal
                $(document).off('keydown.dismissQR click.dismissQR');
            }, 400); // Should match hideQR animation duration (0.4s)
        }

        // --- Show QR Function ---
        function showQR(qrImageUrl) {
            MainBox.empty(); // Clear previous QR code if any

            if (qrImageUrl) {
                const qrImg = $('<img>', {
                   id: 'qrCodeImage', // ID for the image element
                   src: qrImageUrl,
                   alt: '付款二维码' // Alt text in Chinese
                });

                // VERY IMPORTANT: Stop propagation when clicking the image itself
                // This prevents the document click listener from immediately closing the QR code.
                qrImg.on('click.donate', function(event) {
                    event.stopPropagation();
                });

                MainBox.append(qrImg);
            }

            otherElements.addClass('blur'); // Apply blur effect
            QRBox.fadeIn(300, function() {
                MainBox.removeClass('hideQR').addClass('showQR'); // Show with animation
            });

            // --- Bind Document Listeners for Closing QR ---
            // Bind ESC keydown listener
            $(document).on('keydown.dismissQR', function(event) {
                if (event.key === "Escape" || event.which === 27) { // Check for Escape key
                    hideQR();
                }
            });

            // Bind document click listener (use setTimeout to avoid immediate trigger)
            setTimeout(function() {
                $(document).on('click.dismissQR', function(event) {
                    // If the click is outside the MainBox (QR code display area)
                    // Note: Clicks on the image itself are stopped by qrImg.on('click')
                    if (!$(event.target).closest(MainBox).length) {
                         hideQR();
                    }
                    // Also hide if clicking the dark background of QRBox directly
                    if ($(event.target).is(QRBox)) {
                        hideQR();
                    }
                });
            }, 0);
        }

        // --- Attach Click Handlers to Donate Buttons (AliPay, WeChat) ---
        donateBoxItems.off('click.donate').on('click.donate', function(event) {
            event.stopPropagation(); // Prevent triggering document click listener
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
            // PayPal is handled by its own 'a' tag click handler
        });

         // Allow clicking the QR Box background (but not the QR image) to close it
         QRBox.off('click.donate').on('click.donate', function(event) {
             // If the click is directly on the QRBox background (event.target is QRBox itself)
             if ($(event.target).is(QRBox)) {
                 hideQR();
             }
         });

    } // end initializeLogic

})(); // End of self-executing wrapper function
