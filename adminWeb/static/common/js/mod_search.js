$(function () {
    // bootbox设置区域
    bootbox.setDefaults({
        locale : "zh_CN"
    });

    //++ 搜索管理
    // 实现全选
    $.selectAllToggle("search-check", "search-check-item");

    // 删除
    $("#btn-search-del").click(function () {
        var result = $.checkboxVal("search-check-item");
        if (result.length > 0) {
            bootbox.confirm("请确定是否删除所选项?", function (value) {
                if (value) {
                    var params = {"ids" : result};
                    $.sendAjax({
                        "url" : "/admin/keyword/hot_rank/delete/",
                        "type" : "POST",
                        "data" : params
                    });
                }
            });
        } else {
            bootbox.alert("请先选择，然后才能进行删除操作!", function () {
            });
        }
    });
    //搜索管理导入表单验证

    //输入时验证
    var addKeywordFlag;
    var addBatchKeywordFlag;
    $('#k_name').blur(function () {
        var name = $.trim($('#k_name').val());
        var nameBatch = $.trim($('#k_batch').val());
        $('#k_name_tip1').addClass('hidden');
        $('#k_name_tip2').addClass('hidden');
        $('#k_name_tip3').addClass('hidden');
        //验证名字是否重复
        if (name != '') {
            var params = {
                'url' : '/admin/keyword/get/',
                'data' : {'name' : name},
                'type' : 'POST',
                'callback' : function (data) {
                    if (data.status == 'failed') {
                        $('#k_name_tip2').removeClass('hidden');
                    } else {
                        $('#k_name_tip2').addClass('hidden');
                    }
                }
            };
            $.sendAjax(params);
        }
        //输入检测
        if (name == '' && nameBatch == '') {
            $('#k_name_tip1').removeClass('hidden');
            $('#k_name_tip3').addClass('hidden');
        } else if (name.length > 4) {
            $('#k_name_tip1').addClass('hidden');
            $('#k_name_tip3').removeClass('hidden')
        } else {
            $('#k_name_tip1').addClass('hidden');
            $('#k_name_tip3').addClass('hidden')
        }
    })

    $('#k_batch').blur(function () {
        var name = $.trim($('#k_name').val());
        var nameBatch = $.trim($('#k_batch').val());
        var nameBatchList = nameBatch.split('\n');
        var repeatCheck = [];
        //验证名字是否重复
        if (nameBatch.length > 0) {
            var keywordList = nameBatch.split('\n');
            var i;
            for (i = 0; i < keywordList.length; i++) {
                keyword = keywordList[i];
                if (keyword.indexOf(',') == -1) {
                    addBatchKeywordFlag = false;
                }
                var keyword = keyword.split(',')[0];
                var priority = keyword.split(',')[1];
                if (keyword != null) {
                    var params = {
                        'url' : '/admin/keyword/get/',
                        'data' : {'name' : keyword},
                        'type' : 'POST',
                        'callback' : function (data) {
                            if (data.status == 'failed') {
                                $('#k_batch_tip1').removeClass('hidden');
                            } else {
                                $('#k_batch_tip1').addClass('hidden');
                            }
                        }
                    };
                    $.sendAjax(params);
                    if (!addBatchKeywordFlag) {
                        break;
                    }
                }
            }

            if (i == keywordList.length) {
                addBatchKeywordFlag = true;
                $('#k_batch_tip1').addClass('hidden');
            }
        }
        //输入检测
        $('#k_batch_tip5').addClass('hidden');
        for (var index in nameBatchList) {
            var nameSingle = nameBatchList[index].split(',');
            if (nameBatch != "" && nameSingle.length < 2) {
                $('#k_batch_tip2').removeClass('hidden');
                $('#k_batch_tip1').addClass('hidden');
                $('#k_batch_tip3').addClass('hidden');
                $('#k_batch_tip4').addClass('hidden');
            } else if (nameSingle[0].length > 4) {
                $('#k_batch_tip2').addClass('hidden');
                $('#k_batch_tip3').removeClass('hidden');
                break;
            } else {
                $('#k_batch_tip2').addClass('hidden');
                $('#k_batch_tip3').addClass('hidden');
                $('#k_batch_tip4').addClass('hidden');
            }
            if (nameSingle.length > 1 && !$.isNumber(nameSingle[1]) && nameSingle[1].length > 0) {
                $('#k_batch_tip4').removeClass('hidden');
                break;
            } else {
                $('#k_batch_tip4').addClass('hidden');
            }
            repeat:
            {
                if (nameSingle[0] == name && nameBatch != '') {
                    $('#k_batch_tip5').removeClass('hidden');
                    repeatCheck.push(nameSingle[0]);
                    break repeat;
                } else {
                    if (repeatCheck.length == 0) {
                        repeatCheck.push(nameSingle[0]);
                    } else {
                        for (var item in repeatCheck) {
                            if (nameSingle[0] == repeatCheck[item]) {
                                $('#k_batch_tip5').removeClass('hidden');
                                repeatCheck.push(nameSingle[0]);
                                break repeat;
                            } else {
                                repeatCheck.push(nameSingle[0]);
                                continue;
                            }
                        }
                    }
                }
            }
        }
    })

    $('#k_priority').blur(function () {
        var priority = $.trim($('#k_priority').val());
        if (priority != '') {
            if (!$.isNumber(priority)) {
                $('#k_priority_tip').removeClass('hidden');
            } else {
                $('#k_priority_tip').addClass('hidden');
            }
        }
    })
    //提交时验证
    $('#keyword_submit').click(function () {
        $('#keyword_submit_real').click();
    });

    $('#keyword_submit_real').click(function () {
        var name = $.trim($('#k_name').val());
        var nameBatch = $.trim($('#k_batch').val());
        var nameResult, nameBatchResult, priorityResult;
        nameResult = nameBatchResult = priorityResult = true;
        var nameTip , nameBatchTip , priorityTip;
        nameTip = nameBatchTip = priorityTip = '';
        var repeatCheck = [];
        var none_repeat = true;
        $('#k_batch_tip5').addClass('hidden');

        if (name != '') {
            $.sendAjax({
                'url' : '/admin/keyword/get/',
                'data' : {'name' : name},
                'type' : 'POST',
                'sync' : false,
                'callback' : function (data) {
                    if (data.status == 'failed') {
                        addKeywordFlag = false;
                        $('#k_name_tip2').removeClass('hidden');
                    } else {
                        addKeywordFlag = true;
                        $('#k_name_tip2').addClass('hidden');
                    }
                }
            });
        }

        if (nameBatch != '') {
            var keywordList = nameBatch.split('\n');
            var i;
            for (i = 0; i < keywordList.length; i++) {
                keyword = keywordList[i];
                if (keyword.indexOf(',') == -1) {
                    addBatchKeywordFlag = false;
                }
                var keyword = keyword.split(',')[0];
                if (keyword != null) {
                    $.sendAjax({
                        'url' : '/admin/keyword/get/',
                        'data' : {'name' : keyword},
                        'type' : 'POST',
                        'sync' : false,
                        'callback' : function (data) {
                            if (data.status == 'failed') {
                                addBatchKeywordFlag = false;
                                $('#k_batch_tip1').removeClass('hidden');
                            } else {
                                addBatchKeywordFlag = true;
                                $('#k_batch_tip1').addClass('hidden');
                            }
                        }
                    });
                    if (!addBatchKeywordFlag) {
                        break;
                    }
                }
            }

            if (i == keywordList.length) {
                addBatchKeywordFlag = true;
                $('#k_batch_tip1').addClass('hidden');
            }
        }

        if (name.length == 0 && nameBatch.length == 0) {
            nameTip = '#k_name_tip1';
            nameResult = false;
        } else if (name.length > 4) {
            nameTip = '#k_name_tip3';
            nameResult = false;
        }
        var nameBatchList = nameBatch.split('\n');
        for (var index in nameBatchList) {
            var nameSingle = nameBatchList[index].split(',');
            if (nameSingle[0].length > 4) {
                nameBatchResult = nameBatchResult && false;
                nameBatchTip = '#k_batch_tip3';
            }
            if (nameSingle.length > 1 && nameSingle[1] != '' && !$.isNumber(nameSingle[1])) {
                nameBatchResult = nameBatchResult && false;
                nameBatchTip = '#k_batch_tip4';
            }
            if (nameSingle.length < 2 && nameBatch != '') {
                nameBatchResult = nameBatchResult && false;
                nameBatchTip = '#k_batch_tip2';
            }
            repeatValid:
            {
                var nameSingle = nameBatchList[index].split(',');
                if (nameSingle[0] == name && nameBatch != '') {
                    $('#k_batch_tip5').removeClass('hidden');
                    repeatCheck.push(nameSingle[0]);
                    none_repeat = false;
                    break repeatValid;
                } else {
                    if (repeatCheck.length == 0) {
                        repeatCheck.push(nameSingle[0]);
                    } else {
                        for (var item in repeatCheck) {
                            if (nameSingle[0] == repeatCheck[item]) {
                                $('#k_batch_tip5').removeClass('hidden');
                                none_repeat = false;
                                repeatCheck.push(nameSingle[0]);
                                break repeatValid;
                            } else {
                                repeatCheck.push(nameSingle[0]);
                                continue;
                            }
                        }
                    }
                }
            }
        }

        var priority = $.trim($('#k_priority').val());
        if (priority.length > 0) {
            if (!$.isNumber(priority)) {
                priorityTip = '#k_priority_tip';
                priorityResult = false;
            } else {
                priorityTip = '#k_priority_tip';
            }
        }
        if (addKeywordFlag) {
            nameResult = nameResult && addKeywordFlag;
            if (nameResult) {
                nameTip = '#k_name_tip2';
            }
        }
        if (addBatchKeywordFlag) {
            nameBatchResult = nameBatchResult && addBatchKeywordFlag;
            if (nameBatchResult) {
                nameBatchTip = '#k_batch_tip1';
            }
        }

        if (!nameResult) {
            $(nameTip).removeClass('hidden');
        }
        if (!nameBatchResult) {
        }
        if (!priorityResult) {
            $(priorityTip).removeClass('hidden');
        }
        if ($.trim($('#k_name').val()) != '' && $.trim($('#k_batch').val()) == '') {
            addBatchKeywordFlag = true
        }
        if ($.trim($('#k_batch').val()) != '' && $.trim($('#k_name').val()) == '') {
            addKeywordFlag = true
        }
        var result = nameResult && nameBatchResult && priorityResult && addBatchKeywordFlag && addKeywordFlag && none_repeat;
        return result;
    });

    //排序 obj.update(url,name)
    $('.keyword_priority').update('/admin/keyword/hot_rank/update/');
    $('.searchranking_priority').update('/admin/keyword/search_rank/update/');


    $('#btn-off-app').click(function () {
        var ids = $.checkboxVal("search-check-item");
        if (ids.length > 0) {
            bootbox.confirm("选择下架后，你投放的资源将被移除，是否继续？", function (value) {
                if (value) {
                    var params = {"ids" : ids};
                    var url = "/admin/keyword/search_rank/delete/";
                    $.sendAjax({
                        "url" : url,
                        "data" : params
                    });
                }
            });
        } else {
            bootbox.alert("请先选择，然后才能进行下架操作!", function () {
            });
        }
    });
});
function reset_form(targetForm) {
    targetForm.reset();
    $(targetForm).find('.label-warning').addClass('hidden');
}

function is_iE() {
    return !!window.ActiveXObject;
}