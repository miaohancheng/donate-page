jQuery(document).ready(function() {
    var QRBox    = $('#QRBox');
    var MainBox  = $('#MainBox');
    var AliPayQR = 'images/al.jpg';
    var WeChanQR = 'images/wx.jpg';

    // 定义关闭二维码显示的函数
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

    // 定义显示二维码的函数
    function showQR(QR) {
        if (QR) {
            MainBox.css('background-image', 'url(' + QR + ')');
        }
        $('#DonateText, #donateBox, #github').addClass('blur');
        QRBox.fadeIn(300, function() {
            MainBox.addClass('showQR');
        });

        // 绑定 ESC 键事件，按下 ESC 时调用 hideQR 函数
        $(document).on('keydown.dismissQR', function(event) {
            if (event.which === 27) { // 27 为 ESC 键的 keyCode
                hideQR();
            }
        });

        // 绑定 document 点击事件，如果点击目标不在 QRBox 内（也不在控制二维码展示的部分内），则关闭二维码
        $(document).on('click.dismissQR', function(e) {
            // 检查点击目标是否在 QRBox、donateBox 或 github 内
            if ($(e.target).closest('#QRBox, #donateBox, #github').length === 0) {
                hideQR();
            }
        });
    }

    // 点击 donateBox 内的 li 触发二维码显示
    $('#donateBox>li').click(function(event) {
        event.stopPropagation(); // 阻止事件冒泡，避免触发 document 绑定的 click.dismissQR
        var thisID = $(this).attr('id');
        if (thisID === 'AliPay') {
            showQR(AliPayQR);
        } else if (thisID === 'WeChat') {
            showQR(WeChanQR);
        }
    });

    // 原有 MainBox 点击事件也可以保留
    MainBox.click(function(event) {
        hideQR();
    });
});