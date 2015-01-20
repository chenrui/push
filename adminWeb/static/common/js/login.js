/**
 * Created by qqli on 5/28/14.
 */

$(function () {
    $.setPos();
    var marginTop;
    var regEmail = /^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
    var $footer = $('#footer'), $errorInfo = $('#error-info'), $email = $('#email'), $password = $('#password');

    center();
    $(window).resize(function () {
        center();
        if ($footer[0].offsetTop < 610) {
            $footer.css('position', 'relative');
        } else {
            $footer.css('position', 'absolute');
        }
    });
    if ($('#error').length > 0) {
        showError($('#error').html());
        if ($('#error').html() == '用户名不存在') {
            iptErrorFocus($email);
        } else {
            iptErrorFocus($password);
        }
    }
    $('.clear').click(function () {
        $(this).parent().find('input').val('');
    });
    $('#login-button').click(function () {
        $email.parent().removeClass('has-error');
        $password.parent().removeClass('has-error');
        if ($.trim($email.val()) == '') {
            showError('请填写您的帐号');
            iptErrorFocus($email);
            return false;
        } else if (!regEmail.test($('#email').val())) {
            showError('请填写正确的邮箱格式');
            iptErrorFocus($email);
            return false;
        } else if ($.trim($('#password').val()) == '') {
            showError('请填写您的密码');
            iptErrorFocus($password);
            return false;
        }
    });

    function iptErrorFocus(elem) {
        elem.parent().addClass('has-error');
        elem.focus();
    }

    function showError(message) {
        if ($('#error-info').css('display') == 'none') {
            $errorInfo.html(message);
            marginTop = '48px';
            $('#login-form').animate({'margin-top': marginTop}, {duration: 250, easing: 'swing', complete: function () {
                $(this).css('margin-top', '0px');
                $errorInfo.fadeIn();
            }});
        } else {
            marginTop = '0px';
            $errorInfo.html(message);
        }
    }

    function center() {
        var totalHeight = $(window).height();
        var mainHeight = totalHeight - $('#header').height() - $footer.height();
        $('#main').css('height', mainHeight);
        marginTop = (mainHeight - 500) / 2;
        if (marginTop >= (-5)) {
            $('#login-frame').css('margin-top', marginTop);
        }
    }
});


