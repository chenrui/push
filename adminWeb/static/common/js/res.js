$(function () {
    // bootbox 区域设j
    bootbox.setDefaults({
        locale: "zh_CN"
    });
    //++ 广告&资源
    // 分类，查询子分类
    $("#adres_app_category").change(function () {
        var cid = $(this).val();
        if (!$.isNumber(cid)) {
            $("#adres_app_sub_category").html('<option value="">请选择</option>');
            return;
        }
        $.sendAjax({
            url: "/admin/app/sub_category/" + cid + "/",
            data: "",
            callback: function (data) {
                data = data.data;
                var $temp = $("#adres_app_sub_category");
                $temp.empty();
                $temp.append($("<option value=''>" + '请选择' + "</option>"));
                for (var i = 0; i < data.length; i++) {
                    $temp.append($("<option value='" + data[i].id + "'>" + data[i].name + "</option>"));
                }
            }
        });
    });
    // 全选或取消全选
    $.selectAllToggle("ad-res-check", "ad-res-check-item");
    // 删除app
    $("#sf-del-sw").click(function () {
        var result = $.checkboxVal("ad-res-check-item");
        if (result.length > 0) {
            bootbox.confirm("确实要删除所选项到回收站吗？", function (is_delete) {
                if (is_delete) {
                    $.sendAjax({'url': '/admin/app/delete/',
                        'type': 'POST',
                        'data': result
                    });
                }
            });
        } else {
            bootbox.alert("请先选择App，然后才能进行删除!", function () {
            });
        }
    });
    // app投放
    $("#sf-throw-sw").click(function () {
        // 重置投放栏
        $('.result-box .jtree').html('');
        $('.selected-count').html('0');
        $("#throw-yes-btn").html('确定');
        // 获取广告&资源checkbox的value
        var result = $.checkboxVal("ad-res-check-item");
        $("#throw-tree").html("");
        if (result.length > 0) {
            $("#app-throw").modal('show');
        } else {
            bootbox.alert("请先选择App，然后才能进行投放!", function () {
            });
            return;
        }
        var params = {
            'url': '/admin/throw_app/info',
            'type': 'GET',
            'callback': function (data) {
                $(".modal-footer").show();
                $("#throw-tree").throwTree(data.data);
                $('ul.has-children').parent().find('>.glyphicon').css('display', 'none');
            }
        };
        $.sendAjax(params);
    });
    // 绑定投放添加移除事件
    $('#throw-tree').delegate('.add-block', 'click', function () {
        var id, text, targetLi = $(this).parent();
        if (targetLi.find('>ul.has-children').length) {
            var liArr = targetLi.find('>ul.has-children>li');
            var getSub = function (Arr) {
                Arr.each(function (index) {
                    if ($(this).find('>ul.has-children').length) {
                        Arr = $(this).find('>ul.has-children>li');
                        getSub(Arr);
                    }
                    else {
                        var newLi = $('<li class="list-group-item" data-id="' + $(this).attr('data-id') + '" data-type="' + $(this).attr('data-type') + '"><a class="glyphicon glyphicon-chevron-left pull-right remove-block" title="移除版块"></a></li>');
                        var txt = newLi.html();
                        var depth = $(this).treeDepth();
                        depth.reverse();
                        for (var i = 0; i < depth.length; i++) {
                            if (i == 0) {
                                txt += depth[i];
                            }
                            else {
                                txt = txt + ' > ' + depth[i];
                            }
                        }
                        newLi.html(txt + ' > ' + $(this).attr('data-txt'));
                        newLi.appendTo($('.result-box ul'));
                        $(this).hide();
                        var count = parseInt($('.selected-count').html());
                        $('.selected-count').html(++count);
                    }
                });
                return Arr;
            }
            var subArr = getSub(liArr);
        }
        else {
            var depth = targetLi.treeDepth();
            depth.reverse();
            // if(depth.length==1){
            //     if(targetLi.parent().parent().attr('data-type')=='featrued'){
            //         depth.splice(1,0,targetLi.parent().parent().find('option:selected').text());
            //     }
            // }
            // else if(depth.length==2){
            //     if(targetLi.parent().parent().parent().parent().attr('data-type')=='featrued'){
            //         depth.splice(1,0,targetLi.parent().parent().parent().parent().find('option:selected').text());
            //     }
            // }
            // else{
            //     alert('四级以上菜单暂不支持');
            // }
            var newLi = $('<li class="list-group-item" data-id="' + targetLi.attr('data-id') + '" data-type="' + targetLi.attr('data-type') + '"><a class="glyphicon glyphicon-chevron-left pull-right remove-block" title="移除版块"></a></li>');
            var txt = newLi.html();
            for (var i = 0; i < depth.length; i++) {
                if (i == 0) {
                    txt += depth[i];
                }
                else {
                    txt = txt + ' > ' + depth[i];
                }
            }
            newLi.html(txt + ' > ' + targetLi.attr('data-txt'));
            newLi.appendTo($('.result-box ul'));
            targetLi.hide();
            var count = parseInt($('.selected-count').html());
            $('.selected-count').html(++count);
        }
    });
    $('.result-box').delegate('.remove-block', 'click', function () {
        var id, parentUL, count, text;
        if ($(this).parent().find('ul.has-children').length) {
            id = $(this).parent().attr('data-id');
            parentUL = $('.choose-box').find('li.list-group-item[data-id=' + id + ']').find('ul.has-children');
            count = parseInt($('.selected-count').html()) - $(this).parent().find('ul.has-children>li').length;
            $(this).parent().find('ul.has-children li').appendTo(parentUL);
            $(this).parent().remove();
            // 全选功能待完成
        }
        else {
            text = $(this).parent().text().split(' > ');
            var self = $(this);
            var parent = $('.choose-box');
            $(text).each(function (index) {
                if (index !== text.length - 1) {
                    parent = parent.find('li[data-txt="' + text[index] + '"]');
                }
                else {
                    parent.find('li[data-txt="' + text[index] + '"]').show();
                    self.parent().remove();
                    count = parseInt($('.selected-count').html()) - 1;
                }
            });
        }
        $('.selected-count').html(count);
    });
    $(".publish-status").changeStatus("app_publish_status");
    //确定投放
    $("#throw-yes-btn").click(function () {
        var self = $(this);
        var checkedIds = [];
        $('.result-box li').each(function () {
            // checkedIds.push($(this).attr('data-id'));
            var node = {};
            var rel = $(this).text().split(' > ');
            node.name = rel[rel.length - 1];
            node.node_type = $(this).attr('data-type');
            node.value = parseInt($(this).attr('data-id'));
            checkedIds.push(node);
        })
        var apkIds = $.checkboxVal("ad-res-check-item");
        var post_value = {};
        if (checkedIds.length == 0) {
            bootbox.alert("请先选择要投放的模块，然后才能进行投放!", function () {
            });
            return;
        }
        post_value.sections = checkedIds;
        post_value.apks = apkIds;
        post_value.phone = parseInt($('.phone-list').val());
        var params = {
            'url': '/admin/throw_app/info',
            'data': post_value,
            'callback': function (data) {
                if (data.status == 'success') {
                    $("#app-throw").modal("hide");
                    bootbox.alert(data.msg, function () {
                        $.reload();
                    });
                }
                else {
                    bootbox.alert(data.msg, function () {
                    });
                    self.prop('disabled', false).html('确定');
                }
            },
            'error': function (error) {
                bootbox.alert('投放失败: ' + error.statusText + '(' + error.status + ')');
                self.prop('disabled', false).html('确定');
            }
        };
        self.prop('disabled', true).html('投放中');
        $.sendAjax(params);
    });
    //模块投放显示
    $(".module_tree").click(function () {
        var apk_id = $(this).attr("name");
        var params = {
            'url': '/admin/module_tree/' + apk_id + "/",
            'callback': function (data) {
                $("#thrown-tree").html("");
                $("#app-thrown").modal("show");
                $(".modal-footer").hide();
                $("#thrown-tree").moduleTree(data.data);
            }
        };
        $.sendAjax(params);
    });
    // app下架
    $("#sf-down-sw").click(function () {
        var result = $.checkboxVal("ad-res-check-item");
        if (result.length > 0) {
            bootbox.confirm("选择下架后，你投放的资源将被移除，是否继续？", function (is_down) {
                if (is_down) {
                    $.sendAjax({'url': '/admin/app/offshelf/',
                        'type': 'POST',
                        'data': result
                    });
                }
            });
        } else {
            bootbox.alert("请先选择App，然后才能进行下架操作!", function () {
            });
        }
    });
    //++ 回收站
    // 全选或取消全选
    $.selectAllToggle("cycle-check", "cycle-check-item");
    // 还原
    $("#sf-cy-re-sw").click(function () {
        var result = $.checkboxVal("cycle-check-item");
        if (result.length > 0) {
            bootbox.confirm("确定还原选中的选项吗？", function (is_restore) {
                if (is_restore) {
                    $.sendAjax({'url': '/admin/app/offshelf/',
                        'type': 'POST',
                        'data': result
                    });
                }
            });
        } else {
            bootbox.alert("请先选择App，然后才能进行还原操作!", function () {
            });
        }
    });
    // 从回收站删除
    $("#sf-cy-del-sw").click(function () {
        var result = $.checkboxVal("cycle-check-item");
        if (result.length > 0) {
            bootbox.confirm("删除后将不能再找回，确定要删除吗？", function (is_delete) {
                if (is_delete) {
                    $.sendAjax({'url': '/admin/app_recyclebin/delete/',
                        'type': 'POST',
                        'data': result
                    });
                }
            });
        } else {
            bootbox.alert("请先选择App，然后才能进行删除操作!", function () {
            });
        }
    });
    //+ app上传模块
    $("#upload-modify-reset").click(function () {
        modify_flag = 0;
        $("#upload-submit").attr('disabled', false);
        $("#upload-submit").find("img").addClass('hidden');
    });
    var options = {
        resizeType: 0,
        minWidth: 420,
        items: ['fontname', 'fontsize', '|'
            , 'forecolor', 'bold', 'italic', 'underline', '|'
            , 'justifyleft', 'justifycenter', 'justifyright', 'justifyfull', '|'
            , 'insertorderedlist', 'insertunorderedlist', '|'
            , 'indent', 'outdent'
        ]
    };
    var editor;
    var update_params = function (type, html, app_type, checked_value) {
        var param = {
            'url': '/admin/uploadappForm/update/' + type + '/',
            'data': {'app_type': app_type},
            'callback': function (data) {
                if ('language' == type) {
                    for (var i = 0; i < data.data.length; i++) {
                        html += "<input type='checkbox' name='checked[]' value='" + data.data[i].id + "'>" + data.data[i].name + "&nbsp;";
                    }
                    $("#" + type).html(html);
                    if (checked_value) {
                        $("[name='checked[]']").each(function () {
                            for (var i = 0; i < checked_value.length; i++) {
                                if (checked_value[i] == $(this).attr("value")) {
                                    $(this).attr("checked", true);
                                }
                            }
                        });
                    }
                }
                else if ("provider" == type) {
                    for (var i = 0; i < data.data.length; i++) {
                        if ("自有" == data.data[i].name) {
                            html += "<option value='" + data.data[i].id + "'>" + data.data[i].name + "</option>";
                        }
                    }
                    html += "</select>";
                    $("#" + type).html(html);
                    if (checked_value) {
                        $("[name=" + type + "]").val(checked_value);
                    }
                }
                else if ("category" == type) {
                    for (var i = 0; i < data.data.length; i++) {
                        html += "<option value='" + data.data[i].id + "'>" + data.data[i].name + "</option>";
                    }
                    html += "</select>";
                    $("#" + type).html(html);
                    if (checked_value) {
                        $("[name=" + type + "]").val(checked_value);
                    }
                }
            }
        };
        return param;
    }
    $("#app-upload-btn").click(function () {
        //分类默认显示应用
        sfcNum = 0;
        $("#app-upload-modify-title").html("<i class='glyphicon glyphicon-upload'></i>App上传");
        var html = "<select multiple='multiple' name='category' class='form-control input-sm' style='height: 100px;'>";
        $.sendAjax(update_params('category', html, 0));
        html = "<select name='provider' class='form-control input-sm'>";
        $.sendAjax(update_params('provider', html));
        //$.sendAjax(update_params('language', ""));
        $("#pay_type").hide();
        $("#price-percent").hide();
        $("#upload-modify")[0].reset();
        $("#app_type").removeClass("hidden");
        $("#category_tr").removeClass("hidden");
        $(".hid").removeClass("hidden");
        $("img.check").addClass("hidden");
        $("img.check").attr("src", "");
        $("#option").attr("value", "upload");
        $(".btn-sfc-del").parent().parent().parent().remove();
        $(".upload_preview").html('').addClass('hidden');
        $(".path").val('');
        $(".progress").addClass('hidden');
        $(".check-icon").addClass('hidden');
        $('#apkinfo').html('支持安卓系统的安装包，后缀格式为.apk');
        if (!editor) {
            editor = KindEditor.create('#app-desc-info', options);
        }
        editor.sync();
        editor.html("");
        $("#name-dsc").html("");
        //默认是广告
        //-------------
        $("#source_type").val(1);
        $("#pay_type").show();
        $("#price-percent").show();
        //--------------
        $(".modal-footer").show();
        $("#app-upload").modal("show");
    });
    $("#app_type").change(function () {
        var html = "<select multiple='multiple' name='category' class='form-control input-sm' style='height: 100px;'>";
        $.sendAjax(update_params('category', html, $("[name=app_type]").val()));
    });
    $("#source_type").change(function () {
        if (0 == $("#source_type").val()) {
            $("#pay_type").hide();
            $("#price-percent").hide();
        }
        else if (1 == $("#source_type").val()) {
            $("#pay_type").show();
            $("#price-percent").show();
        }
    });
    $("[name=pay_type]").change(function () {
        if ('0' == $("[name=pay_type]").val()) {
            $("#price-percent").html("<td>单价</td>" +
                "<td><input type='text' name='price' placeholder='/' class='form-control input-sm'/></td>" +
                "<td></td><td></td>");
        }
        else if ('1' == $("[name=pay_type]").val()) {
            $("#price-percent").html("<td><span style='color: red;'>*</span>&nbsp;分成比例</td>" +
                "<td><input type='text' name='percent' placeholder='/' class='form-control input-sm'/></td>" +
                "<td></td><td></td>");
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
        max_file_size: '30kb',           //最大文件体积限制
        flash_swf_url: '../../../../static/plugin/qiniu/js/plupload/Moxie.swf',  //引入flash,相对路径
        max_retries: 0,                   //上传失败最大重试次数
        dragdrop: false,                   //开启可拖曳上传
        // chunk_size: '4mb',                //分块上传时，每片的体积
        auto_start: false,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
        multi_selection: false,
        unique_names: true,
        save_key: true,
        init: {
            'FilesAdded': function (up, files) {
                //文件添加进队列后,判断文件Type
                if (files[0].type.indexOf('png') < 0) {
                    up.files.pop();
                    alert('请上传png图片');
                    return false;
                }
                // check size
                if (files[0].size > 30 * 1024) {
                    up.files.pop();
                    alert('文件过大');
                    return false;
                }
                // shift the old file
                if (up.files.length > 1) {
                    up.files.shift();
                }

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
                reader.onload = function (e) {
                    previewHTML = '<div><a class="upload_delete close glyphicon glyphicon-remove" title="删除"></a>' +
                        '<img  src="' + e.target.result + '" class="upload_image img-thumbnail" /></div>';

                    // show file preview
                    preview.html(previewHTML).removeClass('hidden');
                    progress_bar.css('width', '0');
                    progress_container.removeClass('hidden');
                    bbtn.attr('title', file.name);
                    submit.removeClass('hidden');
                    check_icon.addClass('hidden');
                    upload_inf.html('').addClass('hidden');
                    // bind delete_upload button
                    preview.delegate('.upload_delete', 'click', function () {
                        // pop out current file
                        up.files.pop();
                        // hide preview & clear data
                        check_icon.addClass('hidden');
                        preview.html('').addClass('hidden');
                        progress_bar.css('width', '0');
                        progress_container.addClass('hidden');
                        submit.addClass('hidden');
                        bbtn.attr('title', '未选择文件');
                        uploaded_file_name.val('');
                        upload_inf.html('').addClass('hidden');
                    });
                    uploaded_file_name.val('');
                    //bind submit
                    submit[0].onclick = function () {
                        upload_inf.html('').addClass('hidden');
                        iconUploader.start();
                    };
                }
                // use getNative() to get native file object
                reader.readAsDataURL(file.getNative());
            },
            'BeforeUpload': function (up, file) {
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
                abort.click(function () {
                    iconUploader.stop();
                    progress_bar.css('width', '0');
                    $(this).addClass('hidden');
                    submit.removeClass('hidden');
                    upload_inf.html('<i class="icon-warning-sign"> 文件上传失败：用户终止上传').removeClass('hidden');
                });
            },
            'UploadProgress': function (up, file) {
                //每个文件上传时,处理相关的事情
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    progress_bar = bbtn.parent().parent().find('.progress-bar');
                progress_bar.css('width', file.percent + '%');
            },
            'FileUploaded': function (up, file, info) {
                var res = $.parseJSON(info);
                if (res) {
                    // things to do
                    $('#icon-path').val(res.key + ',' + res.name);

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
            'Error': function (up, err, errTip) {
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
                upload_inf.html('<i class="icon-warning-sign"> ' + errTip).removeClass('hidden');
            },
            'UploadComplete': function () {
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
        max_file_size: '500kb',           //最大文件体积限制
        flash_swf_url: '../../../../static/plugin/qiniu/js/plupload/Moxie.swf',  //引入flash,相对路径
        max_retries: 0,                   //上传失败最大重试次数
        dragdrop: false,                   //开启可拖曳上传
        // chunk_size: '4mb',                //分块上传时，每片的体积
        auto_start: false,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
        multi_selection: false,
        unique_names: true,
        save_key: true,
        init: {
            'FilesAdded': function (up, files) {
                //文件添加进队列后,判断文件Type
                if (files[0].type.indexOf('image') < 0) {
                    up.files.pop();
                    alert('请上传图片文件');
                    return false;
                }
                // check size
                if (files[0].size > 50 * 1024) {
                    up.files.pop();
                    alert('文件过大');
                    return false;
                }
                // shift the old file
                if (up.files.length > 1) {
                    up.files.shift();
                }

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
                reader.onload = function (e) {
                    previewHTML = '<div><a class="upload_delete close glyphicon glyphicon-remove" title="删除" ></a>' +
                        '<img  src="' + e.target.result + '" class="upload_image img-thumbnail" /></div>';

                    // show file preview
                    preview.html(previewHTML).removeClass('hidden');
                    progress_bar.css('width', '0');
                    progress_container.removeClass('hidden');
                    bbtn.attr('title', file.name);
                    submit.removeClass('hidden');
                    check_icon.addClass('hidden');
                    upload_inf.html('').addClass('hidden');
                    // bind delete_upload button
                    preview.delegate('.upload_delete', 'click', function () {
                        // pop out current file
                        up.files.pop();
                        // hide preview & clear data
                        check_icon.addClass('hidden');
                        preview.html('').addClass('hidden');
                        progress_bar.css('width', '0');
                        progress_container.addClass('hidden');
                        submit.addClass('hidden');
                        bbtn.attr('title', '未选择文件');
                        uploaded_file_name.val('');
                        upload_inf.html('').addClass('hidden');
                    });
                    uploaded_file_name.val('');
                    //bind submit
                    submit[0].onclick = function () {
                        upload_inf.html('').addClass('hidden');
                        bannerUploader.start();
                    };
                }
                // use getNative() to get native file object
                reader.readAsDataURL(file.getNative());
            },
            'BeforeUpload': function (up, file) {
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
                abort.click(function () {
                    bannerUploader.stop();
                    progress_bar.css('width', '0');
                    $(this).addClass('hidden');
                    submit.removeClass('hidden');
                    upload_inf.html('<i class="icon-warning-sign"> 文件上传失败：用户终止上传').removeClass('hidden');
                });
            },
            'UploadProgress': function (up, file) {
                //每个文件上传时,处理相关的事情
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    progress_bar = bbtn.parent().parent().find('.progress-bar');
                progress_bar.css('width', file.percent + '%');
            },
            'FileUploaded': function (up, file, info) {
                var res = $.parseJSON(info);
                if (res) {
                    // things to do
                    $('#banner-path').val(res.key + ',' + res.name);
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
            'Error': function (up, err, errTip) {
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
                upload_inf.html('<i class="icon-warning-sign"> ' + errTip).removeClass('hidden');
            },
            'UploadComplete': function () {
                //队列文件处理完毕后,处理相关的事情
            }
        }
    });

    // screenshot-1
    var screenshotUploader_1 = Qiniu.uploader({
        runtimes: 'html5,flash,html4',    //上传模式,依次退化
        browse_button: 'choose-ss-1',       //上传选择的点选按钮，**必需**
        uptoken_url: '/admin/qiniu/token',         //Ajax请求upToken的Url，**必需**（服务端提供）
        domain: 'tcl-cd-test.qiniudn.com',   //bucket 域名，下载资源时用到，**必需**
        container: 'container-ss-1',           //上传区域DOM ID，默认是browser_button的父元素，
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
            'FilesAdded': function (up, files) {
                //文件添加进队列后,判断文件Type
                if (files[0].type.indexOf('image') < 0) {
                    up.files.pop();
                    alert('请上传图片文件');
                    return false;
                }
                // check size
                if (files[0].size > 100 * 1024) {
                    up.files.pop();
                    alert('文件过大');
                    return false;
                }
                // shift the old file
                if (up.files.length > 1) {
                    up.files.shift();
                }

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
                    uploaded_file_name = $('#screenshot-path-1');
                // read img preview
                var reader = new FileReader();
                reader.onload = function (e) {
                    previewHTML = '<div><a class="upload_delete close glyphicon glyphicon-remove" title="删除" ></a>' +
                        '<img  src="' + e.target.result + '" class="upload_image img-thumbnail" /></div>';

                    // show file preview
                    preview.html(previewHTML).removeClass('hidden');
                    progress_bar.css('width', '0');
                    progress_container.removeClass('hidden');
                    bbtn.attr('title', file.name);
                    submit.removeClass('hidden');
                    check_icon.addClass('hidden');
                    upload_inf.html('').addClass('hidden');
                    // bind delete_upload button
                    preview.delegate('.upload_delete', 'click', function () {
                        // pop out current file
                        up.files.pop();
                        // hide preview & clear data
                        check_icon.addClass('hidden');
                        preview.html('').addClass('hidden');
                        progress_bar.css('width', '0');
                        progress_container.addClass('hidden');
                        submit.addClass('hidden');
                        bbtn.attr('title', '未选择文件');
                        uploaded_file_name.val('');
                        upload_inf.html('').addClass('hidden');
                    });
                    uploaded_file_name.val('');
                    //bind submit
                    submit[0].onclick = function () {
                        upload_inf.html('').addClass('hidden');
                        screenshotUploader_1.start();
                    };
                }
                // use getNative() to get native file object
                reader.readAsDataURL(file.getNative());
            },
            'BeforeUpload': function (up, file) {
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
                abort.click(function () {
                    screenshotUploader_1.stop();
                    progress_bar.css('width', '0');
                    $(this).addClass('hidden');
                    submit.removeClass('hidden');
                    upload_inf.html('<i class="icon-warning-sign"> 文件上传失败：用户终止上传').removeClass('hidden');
                });
            },
            'UploadProgress': function (up, file) {
                //每个文件上传时,处理相关的事情
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    progress_bar = bbtn.parent().parent().find('.progress-bar');
                progress_bar.css('width', file.percent + '%');
            },
            'FileUploaded': function (up, file, info) {
                var res = $.parseJSON(info);
                if (res) {
                    // things to do
                    $('#screenshot-path-1').val(res.key + ',' + res.name);
                }
                else {
                    bootbox.alert("上传截图失败");
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
            'Error': function (up, err, errTip) {
                //上传出错时,处理相关的事情
                var uc = up.settings,
                    bbtn = $(uc.browse_button[0]),
                    submit = bbtn.parent().parent().find('.file-submit'),
                    abort = bbtn.parent().parent().find('.file-abort'),
                    progress_container = bbtn.parent().parent().find('.progress'),
                    delete_upload = bbtn.parent().parent().find('.upload_delete'),
                    check_icon = bbtn.parent().find('i.check-icon'),
                    uploaded_file_name = $('#screenshot-path-1'),
                    upload_inf = bbtn.parent().parent().find('.upload_inf');
                // submit.removeClass('hidden');
                delete_upload.removeClass('hidden');
                abort.addClass('hidden');
                check_icon.addClass('hidden');
                uploaded_file_name.val('');
                progress_container.removeClass('active');
                upload_inf.html('<i class="icon-warning-sign"> ' + errTip).removeClass('hidden');
            },
            'UploadComplete': function () {
                //队列文件处理完毕后,处理相关的事情
            }
        }
    });

    // 下面的上传已弃用
    // icon 选择
    var upload_params = function (type, input_id, img_id, option) {
        var param = {
            url: '/admin/uploadFile/check/' + type + '/' + modify_app_id + '/' + option + '/',
            secureuri: false,
            fileElementId: input_id,
            dataType: 'json',
            beforeSend: function () {
            },
            success: function (data, status) {
                if (data.success == 1 && modify_flag == 1) {
                    if ("apk" == type && "upload" == option) {
                        $("#" + img_id).parent().find("img").attr("src", "/static/common/images/right.png");
                        $("#apkinfo").html("包名: " + data.apkinfo['package_name'] + "</br>" +
                            "版本: " + data.apkinfo['version_name'] + "</br>" +
                            "大小: " + Math.round(data.apkinfo['size'] / 1024 / 1024 * 100) / 100 + "M");
                        $("#" + img_id).parent().parent().find("input[type=hidden]").attr("value", data.imgpath);
                    } else if ("apk" == type && "modify" == option) {
                        $("#" + img_id).parent().find("img").attr("src", "/static/common/images/error.png");
                        bootbox.alert("你修改的apk和服务器不是同一个文件, 必须修改同一个apk(不同版本)");
                    } else {
                        $("#" + img_id).parent().find("img").attr("src", data.imgpath);
                        $("#" + img_id).parent().parent().find("input[type=hidden]").attr("value", data.imgpath);
                    }
                    $("#" + img_id).parent().find("img").removeClass('hidden');
                } else if (-1 == data.success) {
                    $("#" + img_id).parent().find("img").attr("src", "/static/common/images/error.png");
                    $("#" + img_id).parent().find("img").removeClass('hidden');
                    bootbox.alert("网络失败,请重新上传");
                } else if (0 == data.success && modify_flag == 1) {
                    if ("apk" == type) {
                        $("#" + img_id).parent().find("img").attr("src", "/static/common/images/right.png");
                        $("#apkinfo").html("包名: " + data.apkinfo['package_name'] + "</br>" +
                            "版本: " + data.apkinfo['version_name'] + "</br>" +
                            "大小: " + Math.round(data.apkinfo['size'] / 1024 / 1024 * 100) / 100 + "M");
                        $("#" + img_id).parent().parent().find("input[type=hidden]").attr("value", data.imgpath);
                    } else {
                        $("#" + img_id).parent().find("img").attr("src", "/static/common/images/error.png");
                        bootbox.alert(data.msg);
                    }
                    $("#" + img_id).parent().find("img").removeClass('hidden');
                } else if (-2 == data.success) {
                    $("#" + img_id).parent().find("img").attr("src", "/static/common/images/error.png");
                    bootbox.alert(data.msg);
                    $("#" + img_id).parent().find("img").removeClass('hidden');
                }
                //rebind event
                if (input_id == 'icon-file-input') {
                    $("#icon-file-input").change(function () {
                        var $target = $(this).parent().parent().find("input[type='text']");
                        if (!$.checkFileSuffix($("#icon-file-input")[0].val(), 'png')) {
                            alert('请上传.png格式文件');
                            return;
                        }
                        $("#btn-icon-select").parent().find("img").attr("src", "/static/common/images/loading.gif");
                        $("#btn-icon-select").parent().find("img").removeClass("hidden");
                        $.ajaxFileUpload(upload_params('icon', 'icon-file-input', 'btn-icon-select'));
                        $target.val($(this).val());
                    });
                }
                else if (input_id == 'banner-file-input') {
                    $("#banner-file-input").change(function () {
                        var $target = $(this).parent().parent().find("input[type='text']");
                        if (!$.checkFileSuffix($("#banner-file-input").val(), 'img')) {
                            alert('请上传.png或者.jpg文件');
                            return;
                        }
                        $("#btn-banner-select").parent().find("img").attr("src", "/static/common/images/loading.gif");
                        $("#btn-banner-select").parent().find("img").removeClass("hidden");
                        $.ajaxFileUpload(upload_params('banner', 'banner-file-input', 'btn-banner-select'));
                        $target.val($(this).val());
                    });
                }
                else if (input_id == 'screenshot-file-input') {
                    $("#screenshot-file-input").change(function () {
                        var $targetShow = $(this).parent().parent().find("input[type='text']");
                        if (!$.checkFileSuffix($(this).val(), 'img')) {
                            alert('请上传.png或者.jpg文件');
                            return;
                        }
                        $("#btn-screen-select").parent().find("img").attr("src", "/static/common/images/loading.gif");
                        $("#btn-screen-select").parent().find("img").removeClass("hidden");
                        $.ajaxFileUpload(upload_params('screenshot', "screenshot-file-input", "btn-screen-select"));
                        $targetShow.val($(this).val());
                    });
                }
                else if (input_id == 'sfpak-file-input') {
                    $("#sfpak-file-input").change(function () {
                        var $target = $(this).parent().parent().find("input[type='text']");
                        if (!$.checkFileSuffix($("#sfpak-file-input").val(), 'apk')) {
                            alert('请上传.apk文件');
                            return;
                        }
                        $("#btn-sfpak-select").parent().find("img").attr("src", "/static/common/images/loading.gif");
                        $("#btn-sfpak-select").parent().find("img").removeClass("hidden");
                        $.ajaxFileUpload(upload_params('apk', 'sfpak-file-input', 'btn-sfpak-select', $("#option").attr("value")));
                        $target.val($(this).val());
                    });
                }
                else {
                    $(".screenshot-file-input").change(function () {
                        var $pathInput = $(this).parent().parent().find("input[type='text']");
                        if (!$.checkFileSuffix($(this).val(), 'img')) {
                            alert('请上传.png或者.jpg文件');
                            return;
                        }
                        $(this).parent().find("img").attr("src", "/static/common/images/loading.gif");
                        $(this).parent().find("img").removeClass("hidden");
                        $.ajaxFileUpload(upload_params('screenshot', this.id, this.previousSibling.id));
                        $pathInput.val($(this).val());
                    });
                }
            }
        };
        return param;
    }
    // $("#btn-icon-select").click(function () {
    //     var $target = $(this).parent().parent().find("input[type='text']");
    //     $("#icon-file-input").click()
    // });
    // $("#icon-file-input").parent().delegate('input[type=file]', 'change', function () {
    //     var $target = $(this).parent().parent().find("input[type='text']");
    //     if (!$.checkFileSuffix($("#icon-file-input").val(), 'png')) {
    //         //解决同一个文件不能触发onchang事件的问题
    //         var parent = this.parentNode;
    //         var that = this;
    //         parent.removeChild(that);
    //         var newInput = $('<input type="file" class="hidden" name="icon" id="icon-file-input" style="position:absolute;top:12px;left:5px;width:68.5%; height:26px; filter:alpha(opacity=0);cursor:pointer;outline:none;"/>');
    //         $(parent).append(newInput);
    //         if (is_iE()) {
    //             newInput.removeClass('hidden');
    //         }
    //         alert('请上传.png格式文件');
    //         return;
    //     }
    //     $("#btn-icon-select").parent().find("img").attr("src", "/static/common/images/loading.gif");
    //     $("#btn-icon-select").parent().find("img").removeClass("hidden");
    //     $.ajaxFileUpload(upload_params('icon', 'icon-file-input', 'btn-icon-select'));
    //     $target.val($(this).val());
    // });
    // // Banner图片
    // $("#btn-banner-select").click(function () {
    //     var $target = $(this).parent().parent().find("input[type='text']");
    //     $("#banner-file-input").click();
    // });
    // $("#banner-file-input").parent().delegate('input[type=file]', 'change', function () {
    //     var $target = $(this).parent().parent().find("input[type='text']");
    //     if (!$.checkFileSuffix($("#banner-file-input").val(), 'img')) {
    //         //解决同一个文件不能触发onchang事件的问题
    //         var parent = this.parentNode;
    //         var that = this;
    //         parent.removeChild(that);
    //         var newInput = $('<input type="file" class="hidden" name="banner" id="banner-file-input" style="position:absolute;top:12px;left:5px;width:68.5%; height:26px; filter:alpha(opacity=0);cursor:pointer;outline:none;"/>');
    //         $(parent).append(newInput);
    //         if (is_iE()) {
    //             newInput.removeClass('hidden');
    //         }
    //         alert('请上传.png或者.jpg文件');
    //         return;
    //     }
    //     $("#btn-banner-select").parent().find("img").attr("src", "/static/common/images/loading.gif");
    //     $("#btn-banner-select").parent().find("img").removeClass("hidden");
    //     $.ajaxFileUpload(upload_params('banner', 'banner-file-input', 'btn-banner-select'));
    //     $target.val($(this).val());
    // });
    // 默认截图选择
    // $("#btn-screen-select").click(function () {
    //     var $targetShow = $(this).parent().parent().find("input[type='text']");
    //     $("#screenshot-file-input").click();
    // });
    // $("#screenshot-file-input").parent().delegate('input[type=file]', 'change', function () {
    //     var $targetShow = $(this).parent().parent().find("input[type='text']");
    //     if (!$.checkFileSuffix($(this).val(), 'img')) {
    //         //解决同一个文件不能触发onchang事件的问题
    //         var parent = this.parentNode;
    //         var that = this;
    //         parent.removeChild(that);
    //         var newInput = $('<input type="file" name="screenshot" class="hidden screenshot-file-input btn-sfc-select" id="screenshot-file-input" style="position:absolute;top:12px;top:23px\0;left:5px;width:68.5%; height:26px; filter:alpha(opacity=0);cursor:pointer;outline:none;"/>');
    //         $(parent).append(newInput);
    //         if (is_iE()) {
    //             newInput.removeClass('hidden');
    //         }
    //         alert('请上传.png或者.jpg文件');
    //         return;
    //     }
    //     $("#btn-screen-select").parent().find("img").attr("src", "/static/common/images/loading.gif");
    //     $("#btn-screen-select").parent().find("img").removeClass("hidden");
    //     $.ajaxFileUpload(upload_params('screenshot', "screenshot-file-input", "btn-screen-select"));
    //     $targetShow.val($(this).val());
    // });
    //上传表单检测
    /*
     $("#name").change(function(){
     if (! $.isNull($("#name").val())){
     if ($.strLength($("#name").val())){
     var param = {
     'url': '/admin/appname/check/',
     'data': {'name': $("#name").val()},
     'sync': false,
     'callback': function(data){
     if ('success' == data.status){
     $("#name-dsc").html("<img class='hidden check' src='/static/common/images/right.png' />");
     }
     else {
     $("#name-dsc").html("<img class='hidden check' src='/static/common/images/error.png' />" + "<span>" + data.msg + "</span>");
     }
     $("#name-dsc").find("img").removeClass("hidden");
     }};
     $.sendAjax(param);
     return;
     }
     }
     else{
     alert("输入不能为空");
     }
     });
     */
    // $("[name=price]").change(function () {
    //     if (!($.isInteger($("[name=price]").val()) || $.isDecimal($("[name=price]").val()))) {
    //         bootbox.alert("单价请输入整数或者小数");
    //     }
    // });
    // $("[name=read_count]").blur(function(){
    //         if (!$.isInteger($(this).val()) && $.trim($(this).val())!=""){
    //             bootbox.alert("阅读次数必须为整数");
    //         }
    // });
    // $("[name=read_count]").blur(function(){
    //         if (Number($(this).val())>999999999 && $.trim($(this).val())!=""){
    //             bootbox.alert("阅读次数超过范围(长度最多为9位)");
    //         }
    // });
    // $("[name=download_count]").blur(function(){
    //         if (!$.isInteger($(this).val()) && $.trim($(this).val())!=""){
    //             bootbox.alert("下载次数必须为整数");
    //         }
    // });
    // $("[name=download_count]").blur(function(){
    //         if (Number($(this).val())>999999999 && $.trim($(this).val())!=""){
    //             bootbox.alert("下载次数超过范围(长度最多为9位)");
    //         }
    // });
    $("[name=publisher]").blur(function () {
        if (!$.isNull($(this).val())) {
            $.strLength($(this).val());
        }
        else {
            bootbox.alert("输入不能为空");
        }
    });
    var sfcNum = 0;
    var select_id;
    $("#btn-sfc-add").click(function () {
        if (sfcNum > 4) {
            bootbox.alert("软件截图最多上传6张！");
            return;
        }
        var sid = "s" + Date.parse(new Date()) + "" + $.parseInt($.random(1000, 9999));
        var did = "d" + sid;
        var fid = "f" + sid;
        var $inputText = $("<tr><td><span class='hid' style='color: red;'>*</span>&nbsp;</td>" +
            "<td colspan='2' style='position:relative'>" +
            // "<input class='input-sm input-must' type='text' name='screenshot' alt='软件截图' style='width:47.9%;width:47%\0;margin-right:5px'/>" +
            // "<input type='hidden' name='screenshot_path[]' />" +
            // "<input type='button' class='btn btn-default btn-xs btn-sfc-select' value='选择' id='" + sid + "' style='margin-left:3px;'/>&nbsp;" +
            // "<input type='button' class='btn btn-warning btn-xs btn-sfc-del' value='删除' id='" + did + "'/>" +
            // "<input type='file' name='screenshot' class='hidden screenshot-file-input " + sid + "' id='" + fid + "' style='position:absolute;top:5px;left:5px;width:66%; height:26px; filter:alpha(opacity=0);cursor:pointer;outline:none;'/>" +
            // "&nbsp;<img class='hidden imgpreviews' src=''/></td>" +
            '<div class="td-container btn-group" id="container-ss-' + sid + '">' +
            '<a class="btn btn-default btn-sm fileinput-button" id="choose-ss-' + sid + '" title="未选择文件">' +
            '选择截图' +
            '</a><input type="button" class="btn btn-warning btn-sm btn-sfc-del" value="删除"/>&nbsp;&nbsp;<i class="glyphicon glyphicon-ok-circle hidden check-icon"></i>' +
            '<div id="preview-ss-' + sid + '" class="upload_preview hidden"></div>' +
            '<div id="progress-ss-' + sid + '" class="progress z-progress hidden progress-striped">' +
            '<div class="progress-bar progress-bar-success"></div>' +
            '</div>' +
            '<a class="btn btn-xs btn-primary hidden file-submit" id="app-ss-submit-' + sid + '">上传</a><a class="btn btn-xs btn-danger hidden file-abort" id="app-ss-abort-' + sid + '">终止</a>' +
            '<div class="upload_inf hidden"></div>' +
            '</div>' +
            '<input type="hidden" name="screenshot_path[]"  class="path" id="screenshot-path-' + sid + '">' +
            "</td><td></td></tr>");
        var $inputFile = $("");
        $("#insert-before").before($inputText);
        $("#f-input-file").append($inputFile);
        // if (is_iE()) {
        //     $('.screenshot-file-input').removeClass('hidden');
        // }
        // $(".imgpreviews").imgPreview();
        select_id = sid;
        // 文件选择
        var ssId = sid;
        // screenshot-n
        window['screenshotUploader_' + (ssId)] = Qiniu.uploader({
            runtimes: 'html5,flash,html4',    //上传模式,依次退化
            browse_button: 'choose-ss-' + (ssId),       //上传选择的点选按钮，**必需**
            uptoken_url: '/admin/qiniu/token',         //Ajax请求upToken的Url，**必需**（服务端提供）
            domain: 'tcl-cd-test.qiniudn.com',   //bucket 域名，下载资源时用到，**必需**
            container: 'container-ss-' + (ssId),           //上传区域DOM ID，默认是browser_button的父元素，
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
                'FilesAdded': function (up, files) {
                    //文件添加进队列后,判断文件Type
                    if (files[0].type.indexOf('image') < 0) {
                        up.files.pop();
                        alert('请上传图片文件');
                        return false;
                    }
                    // check size
                    if (files[0].size > 100 * 1024) {
                        up.files.pop();
                        alert('文件过大');
                        return false;
                    }
                    // shift the old file
                    if (up.files.length > 1) {
                        up.files.shift();
                    }

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
                        uploaded_file_name = $('#screenshot-path-' + (ssId));
                    // read img preview
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        previewHTML = '<div><a class="upload_delete close glyphicon glyphicon-remove" title="删除" ></a>' +
                            '<img  src="' + e.target.result + '" class="upload_image img-thumbnail" /></div>';

                        // show file preview
                        preview.html(previewHTML).removeClass('hidden');
                        progress_bar.css('width', '0');
                        progress_container.removeClass('hidden');
                        bbtn.attr('title', file.name);
                        submit.removeClass('hidden');
                        check_icon.addClass('hidden');
                        upload_inf.html('').addClass('hidden');
                        // bind delete_upload button
                        preview.delegate('.upload_delete', 'click', function () {
                            // pop out current file
                            up.files.pop();
                            // hide preview & clear data
                            check_icon.addClass('hidden');
                            preview.html('').addClass('hidden');
                            progress_bar.css('width', '0');
                            progress_container.addClass('hidden');
                            submit.addClass('hidden');
                            bbtn.attr('title', '未选择文件');
                            uploaded_file_name.val('');
                            upload_inf.html('').addClass('hidden');
                        });
                        uploaded_file_name.val('');
                        //bind submit
                        submit[0].onclick = function () {
                            upload_inf.html('').addClass('hidden');
                            window['screenshotUploader_' + (ssId)].start();
                        };
                    }
                    // use getNative() to get native file object
                    reader.readAsDataURL(file.getNative());
                },
                'BeforeUpload': function (up, file) {
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
                    abort.click(function () {
                        window['screenshotUploader_' + (ssId)].stop();
                        progress_bar.css('width', '0');
                        $(this).addClass('hidden');
                        submit.removeClass('hidden');
                        upload_inf.html('<i class="icon-warning-sign"> 文件上传失败：用户终止上传').removeClass('hidden');
                    });
                },
                'UploadProgress': function (up, file) {
                    //每个文件上传时,处理相关的事情
                    var uc = up.settings,
                        bbtn = $(uc.browse_button[0]),
                        abort = bbtn.parent().parent().find('.file-abort'),
                        progress_bar = bbtn.parent().parent().find('.progress-bar');
                    progress_bar.css('width', file.percent + '%');
                },
                'FileUploaded': function (up, file, info) {
                    var res = $.parseJSON(info);
                    if (res) {
                        // things to do
                        $('#screenshot-path-' + (ssId)).val(res.key + ',' + res.name);
                    }
                    else {
                        bootbox.alert("上传截图失败");
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
                'Error': function (up, err, errTip) {
                    //上传出错时,处理相关的事情
                    var uc = up.settings,
                        bbtn = $(uc.browse_button[0]),
                        submit = bbtn.parent().parent().find('.file-submit'),
                        abort = bbtn.parent().parent().find('.file-abort'),
                        progress_container = bbtn.parent().parent().find('.progress'),
                        delete_upload = bbtn.parent().parent().find('.upload_delete'),
                        check_icon = bbtn.parent().find('i.check-icon'),
                        uploaded_file_name = $('#screenshot-path-' + (ssId)),
                        upload_inf = bbtn.parent().parent().find('.upload_inf');
                    // submit.removeClass('hidden');
                    delete_upload.removeClass('hidden');
                    abort.addClass('hidden');
                    check_icon.addClass('hidden');
                    uploaded_file_name.val('');
                    progress_container.removeClass('active');
                    upload_inf.html('<i class="icon-warning-sign"> ' + errTip).removeClass('hidden');
                },
                'UploadComplete': function () {
                    //队列文件处理完毕后,处理相关的事情
                }
            }
        });
        sfcNum++;
    });
    // 删除
    $('#app-upload-table').delegate('.btn-sfc-del', 'click', function () {
        sfcNum--;
        $(this).parent().parent().parent().remove();
    });
    // 软件包
    $("#btn-sfpak-select").click(function () {
        modify_flag = 1;
        var $target = $(this).parent().parent().find("input[type='text']");
        $("#sfpak-file-input").click();
    });
    $("#sfpak-file-input").change(function () {
        var $target = $(this).parent().parent().find("input[type='text']");
        if (!$.checkFileSuffix($("#sfpak-file-input").val(), 'apk')) {
            alert('请上传.apk文件');
            return;
        }
        $("#btn-sfpak-select").parent().find("img").attr("src", "/static/common/images/loading.gif");
        $("#btn-sfpak-select").parent().find("img").removeClass("hidden");
        $.ajaxFileUpload(upload_params('apk', 'sfpak-file-input', 'btn-sfpak-select', $("#option").attr("value")));
        $target.val($(this).val());
    });
    // app修改
    var modify_app_id, modify_flag = 1;//modify_flag修改标示符,点击选择按钮后为1，点击取消后为0;
    $(".app-modify").click(function () {
        if (!editor) {
            editor = KindEditor.create('#app-desc-info', options);
        }
        editor.sync();
        $("#name-dsc").html("");
        $("#upload-modify")[0].reset();
        var id = $(this).parent().parent().find("input[type='checkbox']").val();
        modify_app_id = id;
        var modify_params = {
            url: '/admin/app/modify/' + id + '/',
            type: 'GET',
            callback: function (data) {
                var apk_info = data.data;
                $("[name=name]").val(apk_info.name);
                $("[name=read_count]").val(apk_info.read_count);
                $("[name=download_count]").val(apk_info.download_count);
                $("[name=publisher]").val(apk_info.publisher);
                $("[name=app_type]").val(apk_info.app_type);
                var apkPath = apk_info.apk.split('/');
                var apkName = apkPath[apkPath.length - 1];
                $("#sfpak-input-file").val(apkName);
                $("#sfpak-input-file").parent().find("input[type=hidden]").attr("value", apk_info.apk)
                $(".btn-sfc-del").parent().parent().parent().remove();
                $(".upload_preview").html('').addClass('hidden');
                $(".path").val('');
                $(".progress").addClass('hidden');
                $(".check-icon").addClass('hidden');
                var url = location.href;
                var host = url.substring(0, url.indexOf("admin"));
                if (apk_info.banner_icon) {
                    var bannerPath = apk_info.banner_icon.split('/');
                    var bannerName = bannerPath[bannerPath.length - 1];
                    $("#choose-banner").attr('title', bannerName);
                    var previewBannerHTML = '<div><img  src="' + apk_info.banner_icon + '" class="upload_image img-thumbnail" /></div>';
                    $('#preview-banner').html(previewBannerHTML).removeClass('hidden');
                    $('#banner-path').val(apk_info.banner_icon);
                    $('#container-banner').find('.check-icon').removeClass('hidden');
                }
                if (apk_info.icon) {
                    var iconPath = apk_info.icon.split('/');
                    var iconName = iconPath[iconPath.length - 1];
                    $('#choose-icon').attr('title', iconName);
                    var previewIconHTML = '<div><img  src="' + apk_info.icon + '" class="upload_image img-thumbnail" /></div>';
                    $('#preview-icon').html(previewIconHTML).removeClass('hidden');
                    $('#icon-path').val(apk_info.icon);
                    $('#container-icon').find('.check-icon').removeClass('hidden');
                }
                var screenshot = apk_info.screenshot.split(",");
                var screenshotPath = screenshot[0].split('/');
                var screenshotName = screenshotPath[screenshotPath.length - 1];
                $('#choose-ss-1').attr('title', screenshotName);
                var ssHtml = '<div><img  src="' + screenshot[0] + '" class="upload_image img-thumbnail" /></div>';
                $('#preview-ss-1').html(ssHtml).removeClass('hidden');
                $('#screenshot-path-1').val(screenshot[0]);
                $('#container-ss-1').find('.check-icon').removeClass('hidden');
                // $("#btn-screen-select").parent().find("input[type='text']").val(screenshotName);
                // $("#btn-screen-select").parent().find("img").attr("src", host + 'download/' + screenshot[0]);
                // $("#btn-screen-select").parent().find("input[type=hidden]").attr("value", screenshot[0]);
                // $("#btn-screen-select").parent().find("img").removeClass("hidden");
                var count = 1;
                sfcNum = 0;
                for (var i = 1; i < screenshot.length; i++) {
                    var screenshotPath = screenshot[i].split('/');
                    var screenshotName = screenshotPath[screenshotPath.length - 1];
                    if (count > 6) {
                        break;
                    }
                    $("#btn-sfc-add").click();
                    // $("#" + select_id).parent().find("input[type='text']").val(screenshotName);
                    // $("#" + select_id).parent().find("img").attr("src", host + 'download/' + screenshot[i]);
                    // $("#" + select_id).parent().find("input[type=hidden]").attr("value", screenshot[i]);
                    // $("#" + select_id).parent().find("img").removeClass("hidden");
                    $('#choose-ss-' + select_id).attr('title', screenshotName);
                    ssHtml = '<div><img  src="' + screenshot[i] + '" class="upload_image img-thumbnail" /></div>';
                    $('#preview-ss-' + select_id).html(ssHtml).removeClass('hidden');
                    $('#screenshot-path-' + select_id).val(screenshot[i]);
                    $('#container-ss-' + select_id).find('.check-icon').removeClass('hidden');
                    count += 1;
                }
                editor.html(apk_info.description);
                if ("0" == apk_info.pay_type) {
                    $("#source_type").val(1);
                    $("#pay_type").show();
                    $("[name=pay_type]").val(0);
                    $("#price-percent").html("<td>单价</td>" +
                        "<td><input type='text' name='price' placeholder='/' class='form-control input-sm'/></td>" +
                        "<td></td><td></td>");
                    $("#price-percent").show();
                    $("[name=price]").val(apk_info.price);
                }
                else if ("1" == apk_info.pay_type) {
                    $("#source_type").val(1);
                    $("#pay_type").show();
                    $("[name=pay_type]").val(1);
                    $("#price-percent").html("<td><span style='color: red;'>*</span>&nbsp;分成比例</td>" +
                        "<td><input type='text' name='percent' placeholder='/' class='form-control input-sm'/></td>" +
                        "<td></td><td></td>");
                    $("#price-percent").show();
                    $("[name=percent]").val(apk_info.percent);
                }
                else {
                    $("#source_type").val(0);
                    $("#pay_type").hide();
                    $("#price-percent").hide();
                }
                $("[name=icon]").removeClass("input-must");
                $("[name=apk]").removeClass("input-must");
                category_list = apk_info.category.split(",");
                var html = "<select multiple='multiple' name='category' class='form-control input-sm' style='height: 100px;'>";
                $.sendAjax(update_params('category', html, apk_info.app_type, category_list));
                html = "<select name='provider' class='form-control input-sm'>";
                $.sendAjax(update_params('provider', html, '', apk_info.provider));
                html = "";
                language_list = apk_info.language.split(",");
                $.sendAjax(update_params('language', html, '', language_list));
                $("[name=charge_type]").val(apk_info.charge_type)
                $("#upload-modify").attr("action", "/admin/app/modify/" + id + "/");
            }
        };
        $.sendAjax(modify_params);

        $.sendAjax({
            url: "/admin/app/show_detail/" + id + "/",
            type: "GET",
            callback: function (data) {
                var apkInfoText = "包名: " + data.data.package_name + "<br>" +
                    "版本: " + data.data.version_name + "<br>" +
                    "大小: " + Math.round(data.data.size / 1024 / 1024 * 100) / 100 + "M";
                $("#apkinfo").html(apkInfoText);
            }
        });

        $("#app-upload-modify-title").html("<i class='glyphicon glyphicon-upload'></i>App修改");
        $("#option").attr("value", "modify");
        $("img.check").attr("src", "");
        $(".modal-footer").show();
        $("#app-upload").modal("show");
    });
    $(".imgpreviews").imgPreview();
    //表单提交前表单验证
    $("#upload-submit").click(function () {
        $("#upload-submit-real").click()
    });
    $("#upload-submit-real").click(function () {
        var $percent = $("input[name=percent]"),
            percent = $percent.val();
        if ("1" == $("#source_type").val() && "" == percent) {
            bootbox.alert("分成比例不能为空!");
            $percent.focus();
            return false;
        }
        // else if (percent && isNaN(Number(percent))) {
        //     bootbox.alert("分成比例必须是数字，小数或整数均可!");
        //     $percent.focus();
        //     return false;
        // } else if (percent && (percent < 0 || percent > 100)) {
        //     bootbox.alert("分成比例介于0-100之间!");
        //     $percent.focus();
        //     return false;
        // }
        // if ($("[name=price]").val()) {
        //     if (!($.isInteger($("[name=price]").val()) || $.isDecimal($("[name=price]").val()))) {
        //         bootbox.alert("单价请输入整数或者小数");
        //         return false;
        //     }
        // }
        // 检查图片
        // icon
        if ($.isNull($('#icon-path').val())) {
            var warning = "";
            if ($('#preview-icon').html() === "") {
                warning = "请选择Icon";
            }
            else {
                warning = "请上传icon";
            }
            bootbox.alert(warning);
            return false;
        }
        for (var i = 0; i < $(".input-must").length; i++) {
            var input_name = $(".input-must")[i].name;
            if ($.isNull($(".input-must")[i].value)) {
                bootbox.alert($(".input-must")[i].alt + "不能为空");
                return false;
            } else {
                if ('icon' == input_name || 'banner' == input_name || 'screenshot' == input_name) {
                    if (!$.checkFileSuffix($(".input-must")[i].value, 'img')) {
                        alert("请选择.png或.jpg图片");
                        return false;
                    }
                }
                else if ('apk' == input_name) {
                    if (!$.checkFileSuffix($(".input-must")[i].value, 'apk')) {
                        alert($(".input-must")[i].alt + "请选择.apk文件");
                        return false
                    }
                }
            }
        }
        // if ($("[name=price]").val()) {
        //     if ($.isInteger($("[name=price]").val())) {
        //         if (Number($("[name=price]").val()) > 999) {
        //             bootbox.alert("单价范围(0~999)");
        //             return false;
        //         }
        //     }
        //     else if ($.isDecimal($("[name=price]").val())) {
        //         var price = $("[name=price]").val();
        //         var point = price.indexOf('.');
        //         var pre_price = price.substring(0, point);
        //         var suf_price = price.substring(point + 1, price.length);
        //         if (Number($("[name=price]").val()) > 999) {
        //             bootbox.alert("单价范围(0~999)");
        //             return false;
        //         }
        //         else if (suf_price.length > 3) {
        //             bootbox.alert("单价小数最多保留3位");
        //             return false;
        //         }
        //     }
        // }
        if (!$.isInteger($("[name=read_count]").val()) && $.trim($("[name=read_count]").val()) != "") {
            bootbox.alert("阅读次数必须为整数");
            return false;
        }
        if (Number($("[name=read_count]").val()) > 999999999 && $.trim($("[name=read_count]").val()) != "") {
            bootbox.alert("阅读次数超过范围(长度最多为9位)");
            return false;
        }
        if (!$.isInteger($("[name=download_count]").val()) && $.trim($("[name=download_count]").val()) != "") {
            bootbox.alert("下载次数必须为整数");
            return false;
        }
        if (Number($("[name=download_count]").val()) > 999999999 && $.trim($("[name=download_count]").val()) != "") {
            bootbox.alert("下载次数超过范围(长度最多为9位)");
            return false;
        }
        if (0 == $("select[name=category] option:selected").length) {
            bootbox.alert("请选择分类");
            return false;
        }
        var flag = false;
        for (var i = 0; i < $("[name='checked[]']").length; i++) {
            if ($("[name='checked[]']")[i].checked) {
                flag = true;
                break;
            }
        }
        /*
         if (! flag){
         bootbox.alert("请选择语言");
         return false;
         }
         */
        if (editor.isEmpty()) {
            bootbox.alert("内容介绍不能为空");
            return false;
        }
        var htmlv = editor.html();
        htmlv = htmlv.replace(/(<p>\s*<br \/>\s*<\/p>\s*)*\s*$/g, "");
        editor.html(htmlv);
        editor.sync();
        for (var i = 0; i < $("img.check").length; i++) {
            re_error = /.*error.png$/;
            re_loading = /.*loading.gif$/;
            if (re_error.test($("img.check")[i].src)) {
                bootbox.alert("请改正错误信息");
                return false;
            }
            if (re_loading.test($("img.check")[i].src)) {
                bootbox.alert("正在上传文件,请等待...");
                return false;
            }
        }
        var screenhostNum = $("input[name='screenshot_path[]']"),
            finished = 0;
        screenhostNum.each(function () {
            if ($(this).val() !== '') {
                finished++;
            }
        });
        if (finished < 3) {
            bootbox.alert("上传软件截图必须大于3张!");
            return false;
        }
        if ('upload' == $("#option").val()) {
            var post_url = '/admin/app/upload/';
        }
        else if ('modify' == $("#option").val()) {
            var post_url = '/admin/app/modify/' + modify_app_id + '/';
        }
        var options = {
            url: post_url,
            type: 'post',
            dataType: 'text',
            data: $("#upload-modify").serialize(),
            success: function (data) {
                data = JSON.parse(data);
                if ("success" == data.status) {
                    $("#upload-submit").attr('disabled', false);
                    $("#upload-submit").find("img").addClass('hidden');
                    bootbox.alert(data.msg);
                    location.href = window.location.protocol + "//" + window.location.host + "/admin/app/?app_name=" + data.apk_name;
                }
                else {
                    bootbox.alert(data.msg);
                    $("#upload-submit").attr('disabled', false);
                    $("#upload-submit").find("img").addClass('hidden');
                    $("#app-upload").modal("hidden");
                }
            },
            error: function (data) {
                bootbox.alert("服务器错误");
            }
        };
        $.ajax(options);
        $("#upload-submit").attr('disabled', true);
        $("#upload-submit").find("img").removeClass('hidden');
    });
    //------------------资源管理排序--------------------
    $(".sort").click(function () {
        var args = $(this).attr("value").split(':');
        var host_url = window.location.protocol + "//" + window.location.host;
        var url = location.href;
        var pattern = /sort/;
        var url_params = "";
        host_url += "/admin/resource/sort/1?sortName=" + args[0] + "&sortModel=" + args[1];
        if (pattern.test(url) && -1 != url.indexOf("app_name")) {
            url_params = url.substring(url.indexOf("app_name"), url.length);
        }
        else if (-1 != url.indexOf("?")) {
            url_params = url.substring(url.indexOf("?") + 1, url.length);
        }
        else {
            url_params = "";
        }
        if (url_params) {
            host_url += "&" + url_params;
        }
        location.href = host_url;
    });
    // 软件详情
    $(".btn-sf-detail").click(function () {
        var apk_id = $(this).attr("name");
        var params = {
            url: '/admin/app/show_detail/' + apk_id + "/",
            type: 'GET',
            callback: function (data) {
                var apk_info = data.data;
                $('#sf-name').html(apk_info.name);
                $('#sf-price-type').html(apk_info.price_type);
                $('#sf-price').html(apk_info.price);
                $('#sf-provider').html(apk_info.provider);
                $('#sf-res-type').html(apk_info.pay_type);
                $('#sf-res-category').html(apk_info.app_type);
                $('#sf-desc').html(apk_info.description);
                $('#sf-read-count').html(apk_info.read_count);
                $('#sf-download-count').html(apk_info.downlod_count);
                $('#sf-version').html(apk_info.version_name);
                $('#sf-update-date').html(apk_info.update_time);
                $('#sf-screenshot').html('');
                var screenshot = apk_info.screenshot;
                var screenshot_list = screenshot.split(',');
                for (var i = 0; i < screenshot_list.length; i++) {
                    var sc = document.createElement('img');
                    sc.src = screenshot_list[i];
                    sc.alt = apk_info.name + '-截图' + (i + 1);
                    sc.width = 100;
                    document.getElementById('sf-screenshot').appendChild(sc);
                }
                $("#sf-detail-modal").modal("show");
                $(".modal-footer").hide();
            }
        };
        $.sendAjax(params);
    });
});
function is_iE() {
    return !!window.ActiveXObject;
}
