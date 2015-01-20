$(function () {
    // bootbox 区域设
    bootbox.setDefaults({
        locale : "zh_CN"
    });

    //删除Fn
    function deleteChoice(opts) {
        opts.eBtn.click(function () {
            var result = $.checkboxVal(opts.eCheckBoxClass);
            if (result.length > 0) {
                bootbox.confirm("确实要删除所选" + opts.txt + "吗？", function (is_delete) {
                    if (is_delete) {
                        $.sendAjax({
                            'url' : opts.url,
                            'type' : 'POST',
                            'data' : result
                        });
                    }
                });
            } else {
                bootbox.alert("请先选择要删除的" + opts.txt, function () {
                });
            }
        });
    }

    //处理Fn
    function handle(opts) {
        opts.eBtn.click(function () {
            var result = $.checkboxVal(opts.eCheckBoxClass);

            function ajaxFn(status) {
                $.sendAjax({
                    'url' : opts.url,
                    'type' : 'POST',
                    'data' : {"ids" : result, "result" : status}
                });
            }

            if (result.length > 0) {
                bootbox.dialog({
                    message : "您选中的" + opts.txt + "是否通过？",
                    title : opts.txt + "确认",
                    buttons : {
                        approve : {
                            label : opts.txt + "通过",
                            className : "btn-success",
                            callback : function () {
                                ajaxFn(1);
                            }
                        },
                        reject : {
                            label : opts.txt + "不通过",
                            className : "btn-warning",
                            callback : function () {
                                ajaxFn(2);
                            }
                        }
                    }
                });
            } else {
                bootbox.alert("请先选择要处理的" + opts.txt, function () {
                });
            }
        });
    }

    //comment
    $.selectAllToggle("user-comt-check", "user-comt-check-item");
    var opts_c_d = {
        "eBtn" : $("#btn-usrc-del"),
        "eCheckBoxClass" : 'user-comt-check-item',
        "txt" : '评论',
        "url" : '/admin/comment/delete/'
    };
    deleteChoice(opts_c_d); // 删除comment
    var opts_c_h = {
        "eBtn" : $("#btn-usrc-verify"),
        "eCheckBoxClass" : 'user-comt-check-item',
        "txt" : '评论',
        "url" : '/admin/comment/verify/'
    };
    handle(opts_c_h); //处理comment

    //report
    $.selectAllToggle("user-comp-check", "user-comp-check-item");
    var opts_c_d = {
        "eBtn" : $("#btn-usrcp-del"),
        "eCheckBoxClass" : 'user-comp-check-item',
        "txt" : '评论',
        "url" : '/admin/report/delete/'
    };
    deleteChoice(opts_c_d);//删除report
    var opts_r_h = {
        "eBtn" : $("#btn-usrcp-deal"),
        "eCheckBoxClass" : 'user-comp-check-item',
        "txt" : '举报',
        "url" : '/admin/report/verify/'
    };
    handle(opts_r_h); //处理report

    //public
    $(".verify-status").changeStatus("verify_status");
    $(".btn-sf-detail").click(function () {
        var apk_id = $(this).attr("name");
        var params = {
            url : '/admin/app/show_detail/' + apk_id + "/",
            type : 'GET',
            callback : function (data) {
                var apk_info = data.data;
                $('#sf-name').html(apk_info.name);
                $('#sf-cate').html(apk_info.category);
                $('#sf-provider').html(apk_info.provider);
                $('#res-type').html(apk_info.pay_type);
                $('#sf-desc').html(apk_info.description);
                $('#sf-version').html(apk_info.version_name);
                //var update_time = new Date(apk_info.update_time);
                //$('#sf-update-date').html(update_time.getFullYear() + '-' + (update_time.getMonth() + 1) + '-' + update_time.getDate());
                $('#sf-update-date').html(apk_info.update_time);
                $('#sf-screenshot').html('');
                var screenshot = apk_info.screenshot;
                var screenshot_list = screenshot.split(',');
                for (var i = 0, len = screenshot_list.length; i < len; i++) {
                    var sc = document.createElement('img');
                    sc.src = screenshot_list[i];
                    sc.alt = apk_info.name + '-截图' + (i + 1);
                    sc.width = 100;
                    document.getElementById('sf-screenshot').appendChild(sc);
                }
                $("#sf-detail-modal").modal("show");

                $(".modal-footer").hide();
                //$("#throw-tree").moduleTree(data.data);
            }
        };
        $.sendAjax(params);
    });

    //日期选择
    var datetimeParam = {
        language : 'zh-CN',
        format : 'yyyy-mm-dd',
        weekStart : 1,
        todayBtn : 1,
        autoclose : 1,
        todayHighlight : 1,
        startView : 2,
        minView : 2,
        forceParse : 0
    };
    $("#from-time").datetimepicker(datetimeParam);
    $("#to-time").datetimepicker(datetimeParam);

    //set date limit
    $('#from-time').change(function () {
        $('#to-time').datetimepicker('setStartDate', $('#from-time').val());
    });
    $('#to-time').change(function () {
        $('#from-time').datetimepicker('setEndDate', $('#to-time').val());
    });
    $('.form_datetime').focus(function () {
        this.blur();
    });

    //upgrade
    //select choice
    var $upgradeType = $('#upgradeType');
    var $confirmType = $('#confirmType');
    $('#add').on('click', function () {
        $('option:selected', $upgradeType).appendTo($confirmType);
        return false;
    });
    $('#remove').on('click', function () {
        $('option:selected', $confirmType).appendTo($upgradeType);
        return false;
    });

    $upgradeType.on('dblclick', function () {
        $('option:selected', this).appendTo($confirmType);
    });
    $confirmType.on('dblclick', function () {
        $('option:selected', this).appendTo($upgradeType);
    });
    //form submit
    $('.form-upgrade').on('submit', function () {
        var $this = $(this), $upgradeExplain = $("#upgradeExplain");
        var explainVal = $.trim($upgradeExplain.val());
        if (explainVal == '') {
            bootbox.alert("升级说明不能为空!");
            return false;
        } else if (explainVal.length > 200) {
            bootbox.alert("升级说明不能超过200个字符!");
            return false;
        } else {
            var typeArray = [];
            $('option', $confirmType).each(function () {
                var val = $(this).val();
                typeArray.push(val);
            });
            if(!typeArray.length){
                bootbox.alert("升级机型不能为空!");
                return false;
            }
            var typeObj = {upgrade_pms : typeArray, upgrade_explain : explainVal};
            var options = {
                url : $this.attr('action'),
                type : 'post',
                dataType : 'json',
                contentType : 'application/json',
                data : JSON.stringify(typeObj),
                success : function (data) {
                    if ("success" == data.status) {
                        $.reload();
                    } else {
                        bootbox.alert(data.msg);
                    }
                },
                error : function (data) {
                    bootbox.alert("服务器错误");
                }
            };
            bootbox.dialog({
                message : "确认发布吗？",
                title : "机型升级确认",
                buttons : {
                    approve : {
                        label : "确认",
                        className : "btn-success",
                        callback : function () {
                            $.ajax(options);
                        }
                    },
                    reject : {
                        label : "取消",
                        className : "btn-warning"
                    }
                }
            });
        }
        return false;
    });

});
