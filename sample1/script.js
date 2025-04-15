jQuery(document).ready(function() {
    var QRBox    = $('#QRBox');
    var MainBox  = $('#MainBox');
    // 确保这些图片路径相对于 sample1/index.html 是正确的
    var AliPayQR = 'images/al.jpg';
    var WeChanQR = 'images/wx.jpg';

    // --- PayPal 点击确认 ---
    $('#PayPal a').on('click', function(event) {
        event.preventDefault(); // 阻止默认的链接跳转行为
        // 弹出确认对话框
        var confirmLeave = confirm("您即将离开当前页面跳转到 PayPal 进行付款，确定要继续吗？");
        if (confirmLeave) {
            // 如果用户确认，则在新标签页中打开链接
            window.open(this.href, '_blank');
        }
    });
    // --- PayPal 点击确认结束 ---


    // 定义关闭二维码显示的函数 (保持不变)
    function hideQR() {
        MainBox.removeClass('showQR').addClass('hideQR');
        setTimeout(function() {
            QRBox.fadeOut(300, function() {
                MainBox.removeClass('hideQR');
            });
            $('#DonateText, #donateBox, #github').removeClass('blur');
            // 关闭后解绑 ESC 和点击事件的命名空间
            $(document).off('keydown.dismissQR click.dismissQR');
        }, 600);
    }

    // 定义显示二维码的函数 (修改了 document 点击事件的绑定逻辑)
    function showQR(QR) {
        if (QR) {
            MainBox.css('background-image', 'url(' + QR + ')');
        }
        $('#DonateText, #donateBox, #github').addClass('blur');
        QRBox.fadeIn(300, function() {
            MainBox.addClass('showQR');
        });

        // 绑定 ESC 键事件 (保持不变)
        $(document).on('keydown.dismissQR', function(event) {
            if (event.which === 27) { // 27 是 ESC 键码
                hideQR();
            }
        });

        // --- 修改后的 Document 点击监听器 ---
        // 绑定 document 点击事件：点击任何地方都会关闭二维码
        // 使用 setTimeout 防止打开二维码的点击事件冒泡导致立即关闭
        setTimeout(function() {
            $(document).on('click.dismissQR', function(e) {
                // 无需检查点击位置，直接隐藏
                hideQR();
            });
        }, 0); // 0ms延迟确保在当前事件处理完成后再绑定
        // --- 修改后的 Document 点击监听器结束 ---
    }

    // 为支付宝和微信按钮绑定点击事件以显示二维码
    $('#donateBox>li').click(function(event) {
        var thisID = $(this).attr('id');
        if (thisID === 'AliPay') {
            event.stopPropagation(); // 阻止事件冒泡，避免触发 document 的 click.dismissQR
            showQR(AliPayQR);
        } else if (thisID === 'WeChat') {
            event.stopPropagation(); // 阻止事件冒泡
            showQR(WeChanQR);
        }
        // PayPal 的点击由其独立的事件处理器处理，这里不做操作
    });

    // 不再需要单独为 MainBox 绑定点击事件来关闭，因为 document 的点击事件已覆盖
    // MainBox.click(function(event) {
    //     hideQR();
    // });
});