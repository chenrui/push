$(function () {
    // bootbox设置区域
    bootbox.setDefaults({
        locale : "zh_CN"
    });

    //++活动管理
    // 增加
    var options = {
        width : '100%',
        height : '270',
        items : ['fontname', 'fontsize', '|'
            , 'forecolor', 'bold', 'italic', 'underline', '|'
            , 'justifyleft', 'justifycenter', 'justifyright', 'justifyfull', '|'
            , 'insertorderedlist', 'insertunorderedlist', '|'
            , 'indent', 'outdent'
        ],
        resizeType : 0
    };

    var editor;

    $('#btn-add-act').click(function () {
        $('#btn-add-act-real').click();
    });
    $('#act-add-btn').click(function () {
        if (!editor) {
            editor = KindEditor.create('#add-act-detail', options);
        } else {
            editor.html('');
        }
        reset_add_activity_form();
        $('#act-info').modal('show');
    });

    //活动名称唯一性检查
    $("#add-act-name").blur(function () {
        if (!$.isNull($.trim($(this).val()))) {
            if ($.strLength($.trim($(this).val()), 1)) {
                $.sendAjax({
                    "url" : "/admin/activity/name/check/",
                    "type" : "POST",
                    "data" : {'name' : $.trim($(this).val()), 'activity_id' : $('#input-act-id').val()},
                    "callback" : function (data) {
                        if (data.status == 'success') {
                            $("#activity-name-check").html("<img src='/static/common/images/right.png' />");
                        } else {
                            $("#activity-name-check").html("<img src='/static/common/images/error.png' />" + "<span class='label label-warning'>" + data.msg + "</span>");
                        }
                    }
                });
            }
        } else {
            $("#activity-name-check").html("");
        }
    });

    // 上传Banner文件

    // banner 选择
    var act_upload_params = function (input_id, img_id) {
        var param = {
            url : '/admin/activity/banner/upload/',
            secureuri : false,
            fileElementId : input_id,
            dataType : 'json',
            beforeSend : function () {
            },
            success : function (data, status) {
                if (data.status == 'success') {
                    $("#" + img_id).parent().find("img").attr("src", '/download/' + data.img_path);
                    $("#" + img_id).parent().find("img").removeClass('hidden');
                    $('#input-act-banner').val(data.img_path);
                } else {
                    bootbox.alert(data.msg);
                }
                //解决ajaxfileupload后事件被清除的bug
                $("#activity-banner-file").change(function () {
                    var $target = $(this).parent().parent().find("input[type='text']");
                    if (!$.checkFileSuffix($("#activity-banner-file").val(), 'img')) {
                        bootbox.alert('请上传.png或者.jpg文件');
                        return;
                    }
                    $('#selected-activity-banner').val(this.value);
                    $.ajaxFileUpload(act_upload_params('activity-banner-file', 'btn-activity-banner'));
                    $target.val($(this).val());

                });
            }
        };
        return param;
    }
    // 添加banner图片
    $("#btn-activity-banner").click(function () {
        var $target = $(this).parent().parent().find("input[type='text']");
        $("#activity-banner-file").click();
    });
    $("#activity-banner-file").change(function () {
        var $target = $(this).parent().parent().find("input[type='text']");
        if (!$.checkFileSuffix($("#activity-banner-file").val(), 'img')) {
            bootbox.alert('请上传.png或者.jpg文件');
            return;
        }
        $.ajaxFileUpload(act_upload_params('activity-banner-file', 'btn-activity-banner'));
        $target.val($(this).val());
    });

    // $('#btn-activity-banner').click(function(){
    //     $('#activity-banner-file').click();
    // });
    // 修改

    $('.act-modify').click(function () {
        reset_add_activity_form();
        if (!editor) {
            editor = KindEditor.create('#add-act-detail', options);
        }
        editor.sync();
        $.sendAjax({
            'url' : '/admin/activity/info/',
            'type' : "POST",
            'data' : {'activity_id' : $(this).attr('value')},
            'callback' : function (data) {
                if (data.status == 'success') {
                    $('#input-act-id').val(data.activity_id);
                    $('#add-act-name').val(data.name);
                    $("#activity-name-check").html("<img src='/static/common/images/right.png' />");
                    var banner_name = data.banner.split('/');
                    var banner_name = banner_name[banner_name.length - 1];
                    $('#selected-activity-banner').val(banner_name);
                    $('#input-act-banner').val(data.banner);
                    $("#btn-activity-banner").parent().find("img").attr("src", '/download/' + data.banner);
                    $("#btn-activity-banner").parent().find("img").removeClass('hidden');
                    $("#add-act-desc").val(data.description);
                    editor.html(data.detail);
                    $("#operate-activity-title").html('修改活动');
                } else {
                    bootbox.alert(data.msg);
                }
            }
        });
        $('#act-info').modal('show');
    });

    // 投放
    $("#act-throw-btn").click(function () {
        // 重置投放栏
        $('.choose-box .jtree').html('');
        $('.result-box .jtree').html('');
        $('.selected-count').html('0');
        var result = $.checkboxVal("mp-check-item");
        if (result.length > 0) {
            var params = {
                'url' : '/admin/activity/throw/',
                'type' : 'GET',
                'callback' : function (data) {
                    // 清空
                    $("#act-throw-ul").checkboxTree(data.data, 'activity-throw-node');
                }
            }
            $.sendAjax(params);
            $("#act-throw").modal('show');
        } else {
            bootbox.alert("请先选择活动，然后才能进行投放!", function () {
            });
        }
    });
    //确定投放
    $("#act-throw-yes-btn").click(function () {
        var checkednodes = $.checkboxVal('activity-throw-node');
        var checkedsubjects = $.checkboxVal('mp-check-item');

        // if(checkednodes.length == 1 && checkednodes[0] == '-1')
        //   {
        //         bootbox.alert("请选择要投放到的模块!", function(){});
        //         return;
        //   }
        if (checkednodes.length > 0) {
            var post_data = {};
            post_data['activity_ids'] = checkedsubjects;
            post_data['checked_nodes'] = checkednodes;
            var params = {
                'url' : '/admin/activity/throw/',
                'data' : post_data
            }
            $.sendAjax(params);
        } else {
            bootbox.alert("请选择要投放到的模块!", function () {
            });
        }
    });

    $('#act-throw-ul').delegate('.add-block', 'click', function () {
        var id, text;
        if ($(this).parent().find('ul.has-children').length) {
            id = $(this).parent().attr('data-id');
            text = $(this).parent().attr('data-txt');
            if (!$('.result-box').find('li[data-id=' + id + ']').length) {
                var newLi = $('<li class="list-group-item cate" data-id="' + id + '">' + text + '<a class="glyphicon glyphicon-chevron-left pull-right remove-block" title="移除版块"></a><ul class="has-children"></ul></li>');
                newLi.appendTo($('.result-box ul.jtree'));
            }
            var count = parseInt($('.selected-count').html()) + $(this).parent().find('ul.has-children>li').length;
            $(this).parent().find('ul.has-children>li').appendTo($('.result-box').find('li[data-id=' + id + '] ul.has-children'));
            $('.selected-count').html(count);
            if ($(this).parent().find('.j-switch .glyphicon').hasClass('glyphicon-plus')) {
                $(this).parent().find('.j-switch').click();
            }
        } else {
            id = $(this).parent().attr('data-id');
            text = $('.choose-box').find('li.list-group-item[data-id=-1]').attr('data-txt');
            if (!$('.result-box').find('li[data-id=-1]').length) {
                var newLi = $('<li class="list-group-item cate" data-id="-1">' + text + '<a class="glyphicon glyphicon-chevron-left pull-right remove-block" title="移除版块"></a><ul class="has-children"></ul></li>');
                newLi.appendTo($('.result-box ul.jtree'));
            }
            $(this).parent().appendTo($('.result-box').find('li[data-id=-1] ul.has-children'));
            var count = parseInt($('.selected-count').html()) + 1;
            $('.selected-count').html(count);
        }
    });
    $('.result-box').delegate('.remove-block', 'click', function () {
        var id, parentUL, count;
        if ($(this).parent().find('ul.has-children').length) {
            id = $(this).parent().attr('data-id');
            parentUL = $('.choose-box').find('li.list-group-item[data-id=' + id + ']').find('ul.has-children');
            count = parseInt($('.selected-count').html()) - $(this).parent().find('ul.has-children>li').length;
            $(this).parent().find('ul.has-children li').appendTo(parentUL);
            $(this).parent().remove();
        } else {
            id = $(this).parent().attr('data-id').split('-')[0];
            parentUL = $('.choose-box').find('li.list-group-item[data-id=-1]').find('ul.has-children');
            var temp = $(this).parent();
            if ($(this).parent().parent().find('li').length == 1) {
                $(this).parent().parent().parent().remove();
            }
            temp.appendTo(parentUL);
            count = parseInt($('.selected-count').html()) - 1;
        }
        $('.selected-count').html(count);
    });

    // 批量下架
    // $("#act-down-btn").click(function(){
    //     var result = $.checkboxVal("mp-check-item");
    //     if(result.length > 0){
    //         bootbox.confirm("选择下架后，你投放的活动将被移除，是否继续？", function(type) {
    //             if(type){
    //                 params = {'url': '/admin/activity/offshelf/',
    //                           'data': {'ad_ids': result},
    //                          }
    //                 $.sendAjax(params)
    //             }
    //         });
    //     }else{
    //         bootbox.alert("请先选择，然后才能进行下架操作!", function() {
    //             // ----------
    //         });
    //     }
    // });
    // 下架
    $(".act-down").click(function () {
        var activity_id = $(this).attr('value');
        bootbox.confirm("请确定是否下架所选活动?", function (result) {
            if (result) {
                params = {
                    'url' : '/admin/activity/offshelf/',
                    'data' : {'activity_id' : activity_id}
                }
                $.sendAjax(params);
            }
        });
    });
    // 上架
    $(".act-up").click(function () {
        var activity_id = $(this).attr('value');
        bootbox.confirm("请确定是否上架所选活动?", function (result) {
            if (result) {
                var params = {
                    'url' : '/admin/activity/onshelf/',
                    'data' : {'activity_id' : activity_id}
                };
                $.sendAjax(params);
            }
        });
    });
    // 删除
    $("#act-del-btn").click(function () {
        var values = $.checkboxVal("mp-check-item");
        if (values.length > 0) {
            bootbox.confirm("请确定是否删除所选活动?", function (type) {
                if (type) {
                    params = {
                        'url' : '/admin/activity/delete/',
                        'data' : {'activity_ids' : values}
                    }
                    $.sendAjax(params);
                }
            });
        } else {
            bootbox.alert("请先选择活动，然后才能进行删除操作!", function () {
            });
        }
    });

    //排序 obj.update(url,name)
    $(".activity_priority").update('/admin/activity/priority/update/');
    $('.activity_app_priority').update('/admin/activity/list/priority/update/' + $('#btn-activity-app-list').attr('value') + '/');

    // 活动软件列表下架
    $("#btn-activity-app-list").click(function () {
        var result = $.checkboxVal("mp-check-item");
        var activity_id = $(this).attr('value');
        if (result.length > 0) {
            bootbox.confirm("选择下架后，你投放的资源将被移除，是否继续？", function (type) {
                if (type) {
                    var params = {'url' : '/admin/offshelf_app_from_activity/' + activity_id + '/',
                        'data' : {'app_ids' : result}
                    }
                    $.sendAjax(params)
                }
            });
        } else {
            bootbox.alert("请先选择，然后才能进行下架操作!", function () {
            });
        }
    });
});

function reset_add_activity_form() {
    $('#activity-name-check').html('');
    $('#input-act-id').val('-1');
    $('#add-act-name').val('');
    $('#selected-activity-banner').val('');
    $('#input-act-banner').val('');
    $('#btn-activity-banner').parent().find("img").attr("src", '');
    $('#add-act-desc').val('');
    $('#operate-activity-title').html('新增活动');
    $('#add-act-detail').val('');
}