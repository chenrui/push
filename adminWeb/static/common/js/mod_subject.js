$(function () {
    // bootbox设置区域
    bootbox.setDefaults({
        locale: "zh_CN"
    });

    //++ 专题管理
    // 专题介绍表格
    var options = {
        width: '100%',
        height: '270',
        items: ['fontname', 'fontsize', '|'
            , 'forecolor', 'bold', 'italic', 'underline', '|'
            , 'justifyleft', 'justifycenter', 'justifyright', 'justifyfull', '|'
            , 'insertorderedlist', 'insertunorderedlist', '|'
            , 'indent', 'outdent'
        ],
        resizeType: 0
    };

    var editor;

    // 实现全选
    $.selectAllToggle("sbj-check", "sbj-check-item");
    // 点击增加按钮
    $("#btn-sbj-add").click(function () {
        reset_add_subject_form();
        if (!editor) {
            editor = KindEditor.create('#subject-description', options);
        }
    });
    // 投放
    $("#btn-sbj-sw").click(function () {
        // 重置投放栏
        $('.choose-box .jtree').html('');
        $('.result-box .jtree').html('');
        $('.selected-count').html('0');

        var result = $.checkboxVal("sbj-check-item");
        if (result.length > 0) {
            var params = {
                'url': '/admin/subject/throw/',
                'type': 'GET',
                'callback': function (data) {
                    // 清空
                    $("#sj-throw").checkboxTree(data.data, 'subject-throw-node');
                }
            }
            $.sendAjax(params);
            $("#sbj-throw").modal('show');
        } else {
            bootbox.alert("请先选择专题，然后才能进行投放!", function () {
            });
        }
    });

    $('#sj-throw').delegate('.add-block', 'click', function(){
        var id,text;
        if($(this).parent().find('ul.has-children').length){
            id = $(this).parent().attr('data-id');
            text = $(this).parent().attr('data-txt');
            if(!$('.result-box').find('li[data-id='+id+']').length){
                var newLi = $('<li class="list-group-item cate" data-id="'+id+'">'+text+'<a class="glyphicon glyphicon-chevron-left pull-right remove-block" title="移除版块"></a><ul class="has-children"></ul></li>');
                newLi.appendTo($('.result-box ul.jtree'));
            }
            var count = parseInt($('.selected-count').html()) + $(this).parent().find('ul.has-children>li').length;
            $(this).parent().find('ul.has-children>li').appendTo($('.result-box').find('li[data-id='+id+'] ul.has-children'));
            $('.selected-count').html(count);
            if($(this).parent().find('.j-switch .glyphicon').hasClass('glyphicon-plus')){
                $(this).parent().find('.j-switch').click();
            }
        }
        else{
            id = $(this).parent().attr('data-id');
            text = $('.choose-box').find('li.list-group-item[data-id=-1]').attr('data-txt');
            if(!$('.result-box').find('li[data-id=-1]').length){
                var newLi = $('<li class="list-group-item cate" data-id="-1">'+text+'<a class="glyphicon glyphicon-chevron-left pull-right remove-block" title="移除版块"></a><ul class="has-children"></ul></li>');
                newLi.appendTo($('.result-box ul.jtree'));
            }
            $(this).parent().appendTo($('.result-box').find('li[data-id=-1] ul.has-children'));
            var count = parseInt($('.selected-count').html())+1;
            $('.selected-count').html(count);
        }
    });
    $('.result-box').delegate('.remove-block', 'click', function(){
        var id,parentUL,count;
        if($(this).parent().find('ul.has-children').length){
            id = $(this).parent().attr('data-id');
            parentUL = $('.choose-box').find('li.list-group-item[data-id='+id+']').find('ul.has-children');
            count = parseInt($('.selected-count').html()) - $(this).parent().find('ul.has-children>li').length;
            $(this).parent().find('ul.has-children li').appendTo(parentUL);
            $(this).parent().remove();
        }
        else{
            id = $(this).parent().attr('data-id').split('-')[0];
            parentUL = $('.choose-box').find('li.list-group-item[data-id=-1]').find('ul.has-children');
            var temp = $(this).parent();
            if($(this).parent().parent().find('li').length == 1){
                $(this).parent().parent().parent().remove();
            }
            temp.appendTo(parentUL);
            count = parseInt($('.selected-count').html())-1;
        }
        $('.selected-count').html(count);
    });

    //确定投放
    $("#throw-yes-btn").click(function () {
        var checkednodes = [];
        $('.result-box li').each(function(){
            checkednodes.push($(this).attr('data-id'));
        })
        console.log(checkednodes)
        var checkedsubjects = $.checkboxVal('sbj-check-item');

        if (checkednodes.length == 1 && checkednodes[0] == '-1') {
            bootbox.alert("请选择要投放到的模块!", function () {
            });
            return;
        }
        if (checkednodes.length > 0) {
            var post_data = {};
            post_data['subject_ids'] = checkedsubjects;
            post_data['checked_nodes'] = checkednodes;
            var params = {
                'url': '/admin/subject/throw/',
                'data': post_data
            }
            $.sendAjax(params);
        } else {
            bootbox.alert("请选择要投放到的模块!", function () {
            });
        }
    });

    // 下架
    $(".btn-sbj-offshelf").click(function () {
        var subject_id = $(this).attr('value');
        bootbox.confirm("请确定是否下架所选专题?", function (result) {
            if (result) {
                var params = {
                    'url': '/admin/subject/offshelf/',
                    'data': {'subject_id': subject_id}
                }
                $.sendAjax(params);
            }
        });
    });
    // 上架
    $(".btn-sbj-onshelf").click(function () {
        var subject_id = $(this).attr('value');
        bootbox.confirm("请确定是否上架所选专题?", function (result) {
            if (result) {
                var params = {
                    'url': '/admin/subject/onshelf/',
                    'data': {'subject_id': subject_id}
                }
                $.sendAjax(params);
            }
        });
    });
    // 删除
    $("#btn-sbj-del").click(function () {
        var values = $.checkboxVal("sbj-check-item");
        if (values.length > 0) {
            bootbox.confirm("请确定是否删除所选专题?", function (type) {
                if (type) {
                    var params = {
                        'url': '/admin/subject/delete/',
                        'data': {'subject_ids': values}
                    }
                    $.sendAjax(params);
                }
            });
        } else {
            bootbox.alert("请先选择专题，然后才能进行删除操作!", function () {
            });
        }
    });
    // 全选
    $.selectAllToggle("slist-check", "slist-check-item");
    // 添加专题，专题名称唯一性检查
    $("#add-subject-name").blur(function () {
        if (!$.isNull($.trim($(this).val()))) {
            if ($.strLength($.trim($(this).val()), 1)) {
                $.sendAjax({
                    "url": "/admin/subject/title/check/",
                    "type": "POST",
                    "data": {'title': $.trim($(this).val()), 'subject_id': $('#input-subject-id').val()},
                    "callback": function (data) {
                        if (data.status == 'success') {
                            $("#subject-name-check").html("<img src='/static/common/images/right.png' />");
                        }
                        else {
                            $("#subject-name-check").html("<img src='/static/common/images/error.png' />" +
                                "<span class='label label-warning'>" + data.msg + "</span>");
                        }
                    }
                });
            }
        } else {
            $("#subject-name-check").html("<small>专题名称建议不超过14个字</small>");
        }
    });


    //upload
    // icon 
    var iconUploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4',    //上传模式,依次退化
        browse_button: 'choose-icon',       //上传选择的点选按钮，**必需**
        uptoken_url: '/admin/qiniu/token',         //Ajax请求upToken的Url，**必需**（服务端提供）
        domain: 'tcl-cd-test.qiniudn.com',   //bucket 域名，下载资源时用到，**必需**
        container: 'container-icon',           //上传区域DOM ID，默认是browser_button的父元素，
        max_file_size: '100kb',           //最大文件体积限制
        flash_swf_url: '../../../../static/plugin/qiniu/js/plupload/Moxie.swf',  //引入flash,相对路径
        max_retries: 0,                   //上传失败最大重试次数
        dragdrop: false,                   //开启可拖曳上传
        // chunk_size: '4mb',                //分块上传时，每片的体积
        auto_start: false,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
        multi_selection: false,
        unique_names: true,
        save_key: true,
        init: {
            'FilesAdded': function(up, files) {
                //文件添加进队列后,判断文件Type
                if(files[0].type.indexOf('image') < 0) {
                    up.files.pop();
                    alert('请上传图片文件');
                    return false;
                }
                // shift the old file
                if(up.files.length>1){
                    up.files.shift();
                }
                // console.log(up.files)

                var file = up.files[0],
                    previewHTML = '';
                // get uploader config & other elements
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    preview = bbtn.parent().parent().find('.upload_preview'),
                    progress_bar = bbtn.parent().parent().find('.progress-bar'),
                    progress_container = bbtn.parent().parent().find('.progress'),
                    submit = bbtn.parent().parent().find('.file-submit'),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    check_icon = bbtn.parent().find('i.check-icon'),
                    upload_inf = bbtn.parent().parent().find('.upload_inf'),
                    uploaded_file_name = $('#icon-path');
                // read img preview
                var reader = new FileReader();
                reader.onload = function(e){
                    previewHTML = '<div><a class="upload_delete close glyphicon glyphicon-remove" title="删除"></a>'+
                    '<img  src="' + e.target.result + '" class="upload_image img-thumbnail" /></div>';

                    // show file preview
                    preview.html(previewHTML).removeClass('hidden');
                    progress_bar.css('width','0');
                    progress_container.removeClass('hidden');
                    bbtn.attr('title',file.name);
                    submit.removeClass('hidden');
                    check_icon.addClass('hidden');
                    upload_inf.html('').addClass('hidden');
                    // bind delete_upload button
                    preview.delegate('.upload_delete', 'click', function(){
                        // pop out current file
                        up.files.pop();
                        // hide preview & clear data
                        check_icon.addClass('hidden');
                        preview.html('').addClass('hidden');
                        progress_bar.css('width','0');
                        progress_container.addClass('hidden');
                        submit.addClass('hidden');
                        bbtn.attr('title','未选择文件');
                        uploaded_file_name.val('');
                        upload_inf.html('').addClass('hidden');
                    });
                    uploaded_file_name.val('');
                    //bind submit
                    submit[0].onclick = function() {
                        upload_inf.html('').addClass('hidden');
                        iconUploader.start();
                    };
                }
                // use getNative() to get native file object
                reader.readAsDataURL(file.getNative());
            },
            'BeforeUpload': function(up, file) {
               //每个文件上传前,处理相关的事情
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    progress_container = bbtn.parent().parent().find('.progress'),
                    progress_bar = bbtn.parent().parent().find('.progress-bar'),
                    submit = bbtn.parent().parent().find('.file-submit'),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    delete_upload = bbtn.parent().parent().find('.upload_delete'),
                    upload_inf = bbtn.parent().parent().find('.upload_inf');
                submit.addClass('hidden');
                abort.removeClass('hidden');
                delete_upload.addClass('hidden');
                progress_container.addClass('active');
                abort.click(function(){
                    iconUploader.stop();
                    progress_bar.css('width', '0');
                    $(this).addClass('hidden');
                    submit.removeClass('hidden');
                    upload_inf.html('<i class="icon-warning-sign"> 文件上传失败：用户终止上传').removeClass('hidden');
                });
            },
            'UploadProgress': function(up, file) {
               //每个文件上传时,处理相关的事情
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    progress_bar = bbtn.parent().parent().find('.progress-bar');
                progress_bar.css('width',file.percent+'%');
            },
            'FileUploaded': function(up, file, info) {
                var res = $.parseJSON(info);
                if (res){
                    // things to do
                    $('#icon-path').val(res.key +','+ res.name);

                }
                else {
                    bootbox.alert("上传专题icon文件失败");
                    return;
                }
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    progress_container = bbtn.parent().parent().find('.progress'),
                    submit = bbtn.parent().parent().find('.file-submit'),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    delete_upload = bbtn.parent().parent().find('.upload_delete'),
                    check_icon = bbtn.parent().find('i.check-icon');
                abort.addClass('hidden');
                delete_upload.removeClass('hidden');
                check_icon.removeClass('hidden');
                progress_container.removeClass('active');
            },
            'Error': function(up, err, errTip) {
                //上传出错时,处理相关的事情
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    submit = bbtn.parent().parent().find('.file-submit'),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    progress_container = bbtn.parent().parent().find('.progress'),
                    delete_upload = bbtn.parent().parent().find('.upload_delete'),
                    check_icon = bbtn.parent().find('i.check-icon'),
                    uploaded_file_name = $('#video_cover_name'),
                    upload_inf = bbtn.parent().parent().find('.upload_inf');
                // submit.removeClass('hidden');
                delete_upload.removeClass('hidden');
                abort.addClass('hidden');
                check_icon.addClass('hidden');
                uploaded_file_name.val('');
                progress_container.removeClass('active');
                upload_inf.html('<i class="icon-warning-sign"> '+errTip).removeClass('hidden');
            },
            'UploadComplete': function() {
                //队列文件处理完毕后,处理相关的事情
            }
        }
    });
    // banner
    var bannerUploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4',    //上传模式,依次退化
        browse_button: 'choose-banner',       //上传选择的点选按钮，**必需**
        uptoken_url: '/admin/qiniu/token',         //Ajax请求upToken的Url，**必需**（服务端提供）
        domain: 'tcl-cd-test.qiniudn.com',   //bucket 域名，下载资源时用到，**必需**
        container: 'container-banner',           //上传区域DOM ID，默认是browser_button的父元素，
        max_file_size: '1mb',           //最大文件体积限制
        flash_swf_url: '../../../../static/plugin/qiniu/js/plupload/Moxie.swf',  //引入flash,相对路径
        max_retries: 0,                   //上传失败最大重试次数
        dragdrop: false,                   //开启可拖曳上传
        // chunk_size: '4mb',                //分块上传时，每片的体积
        auto_start: false,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
        multi_selection: false,
        unique_names: true,
        save_key: true,
        init: {
            'FilesAdded': function(up, files) {
                //文件添加进队列后,判断文件Type
                if(files[0].type.indexOf('image') < 0) {
                    up.files.pop();
                    alert('请上传图片文件');
                    return false;
                }
                // shift the old file
                if(up.files.length>1){
                    up.files.shift();
                }
                // console.log(up.files)

                var file = up.files[0],
                    previewHTML = '';
                // get uploader config & other elements
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    preview = bbtn.parent().parent().find('.upload_preview'),
                    progress_bar = bbtn.parent().parent().find('.progress-bar'),
                    progress_container = bbtn.parent().parent().find('.progress'),
                    submit = bbtn.parent().parent().find('.file-submit'),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    check_icon = bbtn.parent().find('i.check-icon'),
                    upload_inf = bbtn.parent().parent().find('.upload_inf'),
                    uploaded_file_name = $('#banner-path');
                // read img preview
                var reader = new FileReader();
                reader.onload = function(e){
                    previewHTML = '<div><a class="upload_delete close glyphicon glyphicon-remove" title="删除" ></a>'+
                    '<img  src="' + e.target.result + '" class="upload_image img-thumbnail" /></div>';

                    // show file preview
                    preview.html(previewHTML).removeClass('hidden');
                    progress_bar.css('width','0');
                    progress_container.removeClass('hidden');
                    bbtn.attr('title',file.name);
                    submit.removeClass('hidden');
                    check_icon.addClass('hidden');
                    upload_inf.html('').addClass('hidden');
                    // bind delete_upload button
                    preview.delegate('.upload_delete', 'click', function(){
                        // pop out current file
                        up.files.pop();
                        // hide preview & clear data
                        check_icon.addClass('hidden');
                        preview.html('').addClass('hidden');
                        progress_bar.css('width','0');
                        progress_container.addClass('hidden');
                        submit.addClass('hidden');
                        bbtn.attr('title','未选择文件');
                        uploaded_file_name.val('');
                        upload_inf.html('').addClass('hidden');
                    });
                    uploaded_file_name.val('');
                    //bind submit
                    submit[0].onclick = function() {
                        upload_inf.html('').addClass('hidden');
                        bannerUploader.start();
                    };
                }
                // use getNative() to get native file object
                reader.readAsDataURL(file.getNative());
            },
            'BeforeUpload': function(up, file) {
               //每个文件上传前,处理相关的事情
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    progress_container = bbtn.parent().parent().find('.progress'),
                    progress_bar = bbtn.parent().parent().find('.progress-bar'),
                    submit = bbtn.parent().parent().find('.file-submit'),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    delete_upload = bbtn.parent().parent().find('.upload_delete'),
                    upload_inf = bbtn.parent().parent().find('.upload_inf');
                submit.addClass('hidden');
                abort.removeClass('hidden');
                delete_upload.addClass('hidden');
                progress_container.addClass('active');
                abort.click(function(){
                    bannerUploader.stop();
                    progress_bar.css('width', '0');
                    $(this).addClass('hidden');
                    submit.removeClass('hidden');
                    upload_inf.html('<i class="icon-warning-sign"> 文件上传失败：用户终止上传').removeClass('hidden');
                });
            },
            'UploadProgress': function(up, file) {
               //每个文件上传时,处理相关的事情
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    progress_bar = bbtn.parent().parent().find('.progress-bar');
                progress_bar.css('width',file.percent+'%');
            },
            'FileUploaded': function(up, file, info) {
                var res = $.parseJSON(info);
                if (res){
                    // things to do
                    $('#banner-path').val(res.key+','+ res.name);
                }
                else {
                    bootbox.alert("上传专题banner文件失败");
                    return;
                }
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    progress_container = bbtn.parent().parent().find('.progress'),
                    submit = bbtn.parent().parent().find('.file-submit'),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    delete_upload = bbtn.parent().parent().find('.upload_delete'),
                    check_icon = bbtn.parent().find('i.check-icon');
                abort.addClass('hidden');
                delete_upload.removeClass('hidden');
                check_icon.removeClass('hidden');
                progress_container.removeClass('active');
            },
            'Error': function(up, err, errTip) {
                //上传出错时,处理相关的事情
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    submit = bbtn.parent().parent().find('.file-submit'),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    progress_container = bbtn.parent().parent().find('.progress'),
                    delete_upload = bbtn.parent().parent().find('.upload_delete'),
                    check_icon = bbtn.parent().find('i.check-icon'),
                    uploaded_file_name = $('#video_cover_name'),
                    upload_inf = bbtn.parent().parent().find('.upload_inf');
                // submit.removeClass('hidden');
                delete_upload.removeClass('hidden');
                abort.addClass('hidden');
                check_icon.addClass('hidden');
                uploaded_file_name.val('');
                progress_container.removeClass('active');
                upload_inf.html('<i class="icon-warning-sign"> '+errTip).removeClass('hidden');
            },
            'UploadComplete': function() {
                //队列文件处理完毕后,处理相关的事情
            }
        }
    });


    // 提交添加专题
    $("#btn-add-subject").click(function () {
        $("#btn-add-subject-real").click();
    });
    $("#btn-add-subject-real").click(function () {
        if ($.trim($("#add-subject-name").val()) != '') {
            $.sendAjax({
                "url": "/admin/subject/title/check/",
                "type": "POST",
                "data": {'title': $.trim($('#add-subject-name').val()), 'subject_id': $('#input-subject-id').val()},
                "sync": false,
                "callback": function (data) {
                    if (data.status == 'success') {
                        $("#subject-name-check").html("<img src='/static/common/images/right.png' />");
                    }
                    else {
                        $("#subject-name-check").html("<img src='/static/common/images/error.png' />" +
                            "<span class='label label-warning'>" + data.msg + "</span>");
                    }
                }
            });
        }

        // 检查专题名
        if (!($("#subject-name-check").find('img').attr('src') == '/static/common/images/right.png')) {
            bootbox.alert("无效的专题名");
            return false;
        }

        //检查图片
        if ($.isNull($('#icon-path').val())) {
            var warning = "";
            if($('#preview-icon').html()===""){
                warning = "请选择Icon";
            }
            else{
                warning = "请上传icon";
            }
            bootbox.alert(warning);
            return false;
        }
        //检查推荐应用
        if(!$.strLength($.trim($('#recommend_app_1').val()), 14) || !$.strLength($.trim($('#recommend_app_2').val()), 14)) {
            bootbox.alert("推荐应用字数不能超过14个");
            return false;
        }
        //检查描述
        if (editor.isEmpty()) {
            bootbox.alert("专题描述不能为空");
            return false;
        }
        var htmlv = editor.html();
        htmlv = htmlv.replace(/(<p>\s*<br \/>\s*<\/p>\s*)*\s*$/g, "");
        editor.html(htmlv);
        // 同步数据后可以直接取得textarea的value
        editor.sync();
    });

    // 修改专题
    $('.btn-modify-subject').click(function () {
        reset_add_subject_form();
        if (!editor) {
            editor = KindEditor.create('#subject-description', options);
        }
        $.sendAjax({
            'url': '/admin/subject/info/',
            'type': "POST",
            'data': {'subject_id': $(this).attr('value')},
            'callback': function (data) {
                if (data.status == 'success') {
                    $('#input-subject-id').val(data.id);
                    $('#add-subject-name').val(data.title);
                    $("#subject-name-check").html("<img src='/static/common/images/right.png' />");
                    // $('#input-subject-icon').val(data.icon);
                    // $('#input-subject-banner').val(data.banner);
                    var previewIconHTML = '<div>'+
                    '<img  src="' + data.icon + '" class="upload_image img-thumbnail" /></div>',
                        previewBannerHTML = '<div>'+
                    '<img  src="' + data.banner_icon + '" class="upload_image img-thumbnail" /></div>';
                    $('#icon-path').val(data.icon);
                    $('#banner-path').val(data.banner_icon);
                    // $("#btn-subject-icon").parent().find("img").attr("src", '/download/' + data.icon);
                    // $("#btn-subject-banner").parent().find("img").attr("src", '/download/' + data.banner);
                    $('#preview-icon').html(previewIconHTML).removeClass('hidden');
                    $('#preview-banner').html(previewBannerHTML).removeClass('hidden');
                    $('.check-icon').removeClass('hidden');
                    $('#choose-icon').attr('title',data.icon);
                    $('#choose-banner').attr('title',data.banner_icon);
                    // $("#btn-subject-icon").parent().find("img").removeClass('hidden');
                    // $("#btn-subject-banner").parent().find("img").removeClass('hidden');
                    $("#recommend_app_1").val(data.demo_app[0]);
                    $("#recommend_app_2").val(data.demo_app[1]);
                    $("#operate-subject-title").html('修改专题');
                    editor.html(data.description);
                }
                else {
                    bootbox.alert(data.msg);
                }
            }
        });
        $('#sbj-add').modal('show');
    });

    // 专题图片预览
    $('.imgpreviews').imgPreview();

    // 修改专题里面app的点评
    $(".update-subject-app-comment").change(function (){
        var subject_id = $('#btn-subject-app-list').attr('value');
        var id = $(this).parent().parent().find("input[type='checkbox']").val();
        params = {'url': "/admin/subject/list/comment/update/"+ subject_id,
                  'data': {'app_id': id, 'comment': $(this).val()},
        };
        $.sendAjax(params);
    });

    // 排序 软件列表
    $(".update-subject-app-priority").update('/admin/subject/list/priority/update/' + $('#btn-subject-app-list').attr('value') + '/');
    // 排序 专题
    $(".update-subject-priority").update('/admin/subject/priority/update/');

    // 专题软件列表全选
    $.selectAllToggle("app-check", "app-check-item");
    // 专题软件列表下架
    $("#btn-subject-app-list").click(function () {
        var result = $.checkboxVal("app-check-item");
        var subject_id = $(this).attr('value');
        if (result.length > 0) {
            bootbox.confirm("选择下架后，你投放的资源将被移除，是否继续？", function (type) {
                if (type) {
                    var params = {
                        'url': '/admin/offshelf_app_from_subject/' + subject_id + '/',
                        'data': {'app_ids': result}
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

function reset_add_subject_form() {
    $('#input-subject-id').val('-1');
    $("#subject-name-check").html('<small>专题名称建议不超过14个字</small>');
    $('#add-subject-name').val('');
    $('#selected-subject-icon').val('');
    $('#input-subject-banner').val('');
    $('#input-subject-icon').val('');
    $("#btn-subject-banner").parent().find("img").attr("src", '');
    $("#btn-subject-icon").parent().find("img").attr("src", '');
    $("#recommend_app_1").val('');
    $("#recommend_app_2").val('');
    $("#subject-description").val('');
    $("#operate-subject-title").html('增加专题');
    $('.upload_preview').html('').addClass('hidden');
    $('.check-icon').addClass('hidden');
    $('.fileinput-button').attr('title', '未选择文件');
}

function is_iE() {
    return !!window.ActiveXObject;
}
