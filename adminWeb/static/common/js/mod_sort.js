$(function () {
    // bootbox设置区域
    bootbox.setDefaults({
        locale : "zh_CN"
    });

    //++ 分类管理
    //排序 分类
    $(".category_priority").update('/admin/category/priority/update/');

    // 删除分类
    $(".btn-clsf-del").click(function () {
        var id = $(this).parent().parent().find(".clsf-check-item").val();
        bootbox.confirm("请确定是否删除所选分类?", function (type) {
            if (type) {
                params = {
                    'url' : '/admin/category/delete/',
                    'data' : {'id' : id}
                }
                $.sendAjax(params);
            }
        });
    });
    //++ 分类软件列表
    //全选
    $.selectAllToggle("capl-check", "capl-check-item");

    //排序 软件列表
    var url = '/admin/category/list_app/update/' + $("#category_id").val() + "/";
    $('.category_app_priority').update(url);

    //下架
    $("#btn-capl-sw").click(function () {
        var result = $.checkboxVal("capl-check-item");
        if (result.length > 0) {
            bootbox.confirm("选择下架后，你投放的资源将被移除，是否继续？", function (value) {
                if (value) {
                    var params = {"ids" : result};
                    var url = "/admin/category/list_app/offshelf/" + $("#category_id").val() + "/";
                    $.sendAjax({"url" : url,
                        "type" : "POST",
                        "data" : params
                    });
                }
            });
        } else {
            bootbox.alert("请先选择，然后才能进行下架操作!", function () {
            });
        }
    });

    // 点击增加按钮
    $("#btn-cat-add").click(function () {
        reset_add_category_form();
    });

    // 添加分类，分类名称唯一性检查
    $("#add-category-name").blur(function () {
        if (!$.isNull($.trim($(this).val()))) {
            if ($.strLength($.trim($(this).val()), 15)) {
                $.sendAjax({
                    "url" : "/admin/category/name/check/",
                    "type" : "POST",
                    "data" : {'name' : $.trim($(this).val()), 'category_id' : $('#input-category-id').val()},
                    "callback" : function (data) {
                        if (data.status == 'success') {
                            $("#category-name-check").html("<img src='/static/common/images/right.png' />");
                        } else {
                            $("#category-name-check").html("<img src='/static/common/images/error.png' />" + "<span class='label label-warning'>" + data.msg + "</span>");
                        }
                    }
                });
            }
            else {
                $("#category-name-check").html("<img src='/static/common/images/error.png' />" + "<span class='label label-warning'>分类名称长度要小于15个字</span>");
            }
        } else {
            $("#category-name-check").html("<img src='/static/common/images/error.png' />" + "<span class='label label-warning'>分类名称不能为空</span>");
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

    // 提交添加分类
    $("#btn-add-category").click(function () {
        $("#btn-add-category-real").click();
    });
    $("#btn-add-category-real").click(function () {
        if ($.isNull($.trim($('#add-category-name').val()))) {
            bootbox.alert("分类名称不能为空");
            return false;
        }
        if ($.trim($("#add-category-name").val()) != '' && $.strLength($.trim($('#add-category-name').val()), 15)) {
            $.sendAjax({
                "url" : "/admin/category/name/check/",
                "type" : "POST",
                "data" : {'name' : $.trim($('#add-category-name').val()), 'category_id' : $('#input-category-id').val()},
                "sync" : false,
                "callback" : function (data) {
                    if (data.status == 'success') {
                        $("#category-name-check").html("<img src='/static/common/images/right.png' />");
                    } else {
                        $("#category-name-check").html("<img src='/static/common/images/error.png' />" + "<span class='label label-warning'>" + data.msg + "</span>");
                    }
                }
            });
        }
        if (!$.strLength($.trim($('#add-category-name').val()), 15)) {
            bootbox.alert("分类名称长度要小于15个字")
            return false;
        }

        // 检查分类名
        if (!($("#category-name-check").find('img').attr('src') == '/static/common/images/right.png')) {
            bootbox.alert("无效的分类名");
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

        // 检查分类类型
        if ($("#category-type").val() == '-1') {
            bootbox.alert("请选择分类类型");
            return false;
        }
        //检查推荐应用
        if(!$.strLength($.trim($('#recommend_app_1').val()), 14) || !$.strLength($.trim($('#recommend_app_2').val()), 14)) {
            bootbox.alert("推荐应用字数不能超过14个");
            return false;
        }
        //检查描述
        if ($.isNull($("#category-description").val())) {
            bootbox.alert("分类描述不能为空");
            return false;
        }
    });

    // 修改分类
    $('.btn-modify-category').click(function () {
        reset_add_category_form();
        $.sendAjax({
            'url' : '/admin/category/info/',
            'type' : "POST",
            'data' : {'category_id' : $(this).attr('value')},
            'callback' : function (data) {
                if (data.status == 'success') {
                    $('#input-category-id').val(data.id);
                    $('#add-category-name').val(data.name);
                    $("#category-name-check").html("<img src='/static/common/images/right.png' />");
                    $('#input-category-icon').val(data.icon);
                    // $("#btn-category-icon").parent().find("img").attr("src", '/download/' + data.icon);
                    // $("#btn-category-icon").parent().find("img").removeClass('hidden');
                    var previewIconHTML = '<div><img  src="' + data.icon + '" class="upload_image img-thumbnail" /></div>';
                    $('#icon-path').val(data.icon);
                    $('#preview-icon').html(previewIconHTML).removeClass('hidden');
                    $('.check-icon').removeClass('hidden');
                    $('#choose-icon').attr('title',data.icon);
                    $("#category-type").val(data.type);
                    $("#category-type").attr('disabled', 'disabled');
                    $("#recommend_app_1").val(data.demo_app[0]);
                    $("#recommend_app_2").val(data.demo_app[1]);
                    $("#category-description").val(data.description);
                    $("#operate-category-title").html('修改分类');
                } else {
                    bootbox.alert(data.msg);
                }
            }
        });
        $('#category-add').modal('show');
    });

    // 分类图片预览
    // $('.imgpreviews').imgPreview();
});

function reset_add_category_form() {
    $('#input-category-id').val('-1');
    $("#category-type").val('-1');
    $("#category-name-check").html('<small>分类名称建议不超过7个字</small>');
    $('#add-category-name').val('');
    $('#selected-category-icon').val('');
    $('#input-category-icon').val('');
    $("#category-type").removeAttr("disabled");
    $("#btn-category-icon").parent().find("img").attr("src", '');
    $("#recommend_app_1").val('');
    $("#recommend_app_2").val('');
    $("#category-description").val('');
    $("#operate-category-title").html('增加分类');
    $("#category-type").removeAttr('disabled');
    $('.upload_preview').html('').addClass('hidden');
    $('.check-icon').addClass('hidden');
    $('.fileinput-button').attr('title', '未选择文件');
}
function is_iE() {
    return !!window.ActiveXObject;
}
