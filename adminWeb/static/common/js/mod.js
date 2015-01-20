$(function () {
    // bootbox设置区域
    bootbox.setDefaults({
        locale : "zh_CN"
    });

    //++ app banner位模块
    // 实现全选
    $.selectAllToggle("banner-check", "banner-check-item");

    // 下架
    $("#btn-banner-sw").click(function () {
        var result = $.checkboxVal("banner-check-item");
        if (result.length > 0) {
            bootbox.confirm("选择下架后，你投放的资源将被移除，是否继续？", function (type) {
                if (type) {
                    var params = {
                        'url' : '/admin/ads/offshelf/',
                        'data' : {'ad_ids' : result}
                    };
                    $.sendAjax(params)
                }
            });
        } else {
            bootbox.alert("请先选择，然后才能进行下架操作!", function () {
            });
        }
    });

    //排序 App Banner
    $(".update_ads_priority").update('/admin/ads/priority/update/');

    //++ 首页管理
    // 实现全选
    $.selectAllToggle("mp-check", "mp-check-item");
    // 下架
    $("#btn-mp-sw").click(function () {
        var result = $.checkboxVal("mp-check-item");
        var featured_tag = $("#featured_tag").val();
        var url = "/admin/featured/off_shelf/";
        if ("necessary" == featured_tag) {
            url = "/admin/necessary/off_shelf/";
        }
        if (result.length > 0) {
            bootbox.confirm("选择下架后，你投放的资源将被移除，是否继续？", function (value) {
                if (value) {
                    var listbox = document.getElementById("provider");
                    var provider = listbox.options[listbox.selectedIndex].value;
                    var params = {"id" : result, "provider" : provider};
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
    // 复制
    $("#btn-dp-sw").click(function () {
        $('.all-check').prop('checked', false);
        try {
            clearInterval(timer);
        } catch (e) {
        }
        ;
        $('#dp-yes-btn').html('确定').prop('disabled', false).removeClass('active');
        $.sendAjax({
            'url' : '/admin/featured/copyinfo/?from=' + $('#phonemodel').val(),
            'type' : 'GET',
            'callback' : function (data) {
                if (data) {
                    var featured_category = data.featured_category;
                    var phones = data.phone_models;
                    var cate_html = '';
                    $(featured_category).each(function () {
                        cate_html += '<li><label><input class="cate-check-item" type="checkbox" data-id="' + this.id + '" />' + this.name + '</label></li>'
                    });
                    $('.all-phones>ul').html(cate_html);
                    var phone_html = '';
                    $(phones).each(function () {
                        phone_html += '<div class="dup-tree checkbox">' + '<label><input class="all-phone-check" title="全选" type="checkbox" data-id="' + this.id + '" />' + this.name + '</label>' + '<ul class="clearfix">' + cate_html + '</ul></div>';
                    });
                    $('.phone_models').html(phone_html);
                    $("#duplicate").modal("show");
                } else {
                    alert("获取机型列表失败，请稍候重试");
                }
            }
        });
    });
    // 复制-选择/全选
    $('.all-check').click(function () {
        var parent = $(this).parent().parent().parent();
        if ($(this).is(':checked')) {
            parent.find('ul .cate-check-item').prop('checked', true);
            parent.find('.all-phone-check').prop('checked', true);
        } else {
            parent.find('ul .cate-check-item').prop('checked', false);
            parent.find('.all-phone-check').prop('checked', false);
        }
    });
    $('.all-phones').delegate('.cate-check-item', 'click', function () {
        var same_cate = $('.phone_models').find('input[data-id = ' + $(this).attr('data-id') + '].cate-check-item');
        if ($(this).is(':checked')) {
            same_cate.prop('checked', true);
        } else {
            same_cate.prop('checked', false);
        }
    });
    $('.phone_models').delegate('.all-phone-check', 'click', function () {
        var children = $(this).parent().parent().find('.cate-check-item');
        if ($(this).is(':checked')) {
            children.prop('checked', true);
        } else {
            children.prop('checked', false);
        }
    });
    // 确认复制
    $('#dp-yes-btn').click(function () {
        var data = [];
        $('.phone_models').find('.all-phone-check').each(function () {
            var checkedChildren = $(this).parent().parent().find('.cate-check-item:checked');
            if (checkedChildren.length) {
                var checkedId = [];
                var phone = {};
                checkedChildren.each(function () {
                    checkedId.push(parseInt($(this).attr('data-id')));
                });
                var phoneId = $(this).attr('data-id');
                phone[phoneId] = checkedId;
                data.push(phone);
            }
        });
        if (!data.length) {
            alert('请选择要复制的机型');
            return false;
        }
        $.sendAjax({
            'url' : '/admin/featured/copyinfo/',
            'type' : 'POST',
            'data' : {"duplicateData" : data, 'from' : $('#phonemodel').val()},
            'callback' : function (data) {
                if (data.status == 'success') {
                    clearInterval(timer);
                    bootbox.alert('复制成功', function () {
                        $.reload();
                    });
                } else {
                    bootbox.alert(data.msg);
                }
            }
        });

        var count = 0;
        $('#dp-yes-btn').html('提交中').prop('disabled', true).addClass('active');
        timer = setInterval(function () {
            if (count > 2) {
                $('#dp-yes-btn').html('提交中');
                count = 0;
            } else {
                $('#dp-yes-btn').html($('#dp-yes-btn').html() + '.');
                count++;
            }
        }, 800)
    });

    //排序 首页管理-推荐
    $('.featured_priority').update('/admin/featured/update_priority/');
    //排序 首页管理-必备
    $('.necessary_priority').update('/admin/necessary/update_priority/');
    //排序 首页管理-自定义
    $('.fc_priority').update('/admin/featured_category/priority/update/');

    //修改单页条数
    $(".itemperpage").update('', 'per_page');

    //来源过滤
    $("#provider").change(function () {
        $('.itemperpage').installUrl('provider', $(this).val());
    });

    //机型过滤
    $("#phonemodel").change(function () {
        $('.itemperpage').installUrl('phonemodel', $(this).val());
    });

    // 调整app标签
    $(".tag").update('/admin/featured/update_tag/', 'tag_id');

    //编辑分栏
    $('.btn-modify-tab').click(function () {
        var category_id = $(this).parent().parent().find('input[name=category_id]').attr('value');
        // reset modal
        $('.upload_inf').html('').addClass('hidden');
        $.sendAjax({
            'url' : '/admin/featured_category/detail/?category_id=' + category_id,
            'type' : 'GET',
            'sync' : false,
            'callback' : function (data) {
                if (data.status == 'success') {
                    $('#category-name').val(data.category.name);
                    $('#input-category-id').val(data.category.id);
                    $('#input-fc-icon').val(data.category.icon);
                    // $('#selected-fc-icon').parent().find('img').attr('src', '/download/' + data.category.icon);
                    var previewIconHTML = '<div><img  src="' + data.category.icon + '" class="upload_image img-thumbnail" /></div>';
                    $('#icon-path').val(data.category.icon);
                    $('#preview-icon').html(previewIconHTML).removeClass('hidden');
                    $('.check-icon').removeClass('hidden');
                    $('#choose-icon').attr('title',data.category.icon);
                    $('#tab-modify').modal('show');
                } else {
                    bootbox.alert("修改失败");
                }
            }
        });
    });

    // 添加推荐
    $('.add-app').click(function(){
        //reset 
        $('input[name=app_name]').val('');
        $('.search-result .table tbody').html('');
        $('.page-li').remove();
        $('.search-result').addClass('hidden');

        $('#add-app input[name=master_app_id]').val($(this).attr('data-value'));
        $('#add-app').modal('show');
    });
    $('input[name=app_name]').keypress(function(e){
        var key = e.charCode || e.keyCode;
        if(key === 13) {
            $('.search-app').click();
        }
    });
    $('.search-app').click(function(){
        var rTimer = null;
        $.ajax({
            url:'/admin/featured/related_apps/',
            type: 'GET',
            data: {
                app_name: $.trim($('input[name=app_name]').val()),
                page: 1
            },
            beforeSend: function(){
                rTimer = setTimeout(function(){$('.search-app').html('查找中...');},200);
            },
            success: function(data) {
                if(data.status === 'success') {
                    loadAppData(data);
                    setAjaxPagination($('.search-result .pagination'), data.pages, 7, '/admin/featured/related_apps/', {app_name: $.trim($('input[name=app_name]').val())}, loadAppData);
                }
                else {
                    alert(data.msg);
                }
            },
            error: function(){
                alert('搜索好像出问题了...请再试一下');
            },
            complete: function(){
                if(rTimer){
                    clearTimeout(rTimer);
                }
                $('.search-app').html('查找');
            }
        })

    });
    $('#add-app-btn').click(function(){
        var result = $.checkboxVal("app-mp-check-item");
        if (result.length > 0) {
            $.ajax({
                url:'/admin/featured/related_apps/',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    master_app_id: +($('#add-app input[name=master_app_id]').val()),
                    related_app_ids: result
                }),
                success: function(data){
                    if(data.status === 'success'){
                        alert('添加成功');
                        $('#add-app').modal('hide');
                    }
                    else{
                        alert(data.msg);
                    }
                },
                error: function(){
                    alert('添加出错');
                }
            });
        } else {
            alert("请选择要添加的应用");
        }
    });

    // 查看推荐
    $('.view-app').click(function(){
        $('#view-app .modal-title .app-name').html($(this).parent().parent().find('.app-name').html());
        $('#view-app input[name=master_app_id]').val($(this).attr('data-value'));
        $('#view-app').modal('show');
        var appId = +$(this).attr('data-value');
        getRecommendApp(appId);
    });
    // bind off app
    $('.added-app').delegate('.off-added-app', 'click', function(){
        var self = this;
        if (confirm("确认要下架该APP吗？")) {
            $.ajax({
                url: '/admin/featured/related_apps/delete/',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    master_app_id: +($('#view-app input[name=master_app_id]').val()),
                    related_app_id: +$(self).attr('data-id')
                }),
                success: function(data){
                    if(data.status === 'success') {
                        getRecommendApp(+($('#view-app input[name=master_app_id]').val()));
                    }
                }
            });
        }
    });
    $('.added-app').delegate('.recommend-app-priority', 'blur', function(){
        if($.trim($(this).val()) === '') {
            $(this).val($(this).attr('data-default'));
            return false;
        }
        else if (!+$(this).val()){
            alert('排序只能为1~9999的数字');
            $(this).val($(this).attr('data-default'));
            return false;
        }
        else if ($(this).val() < 1 || $(this).val()>9999) {
            alert('排序取值范围为1~9999');
            $(this).val($(this).attr('data-default'));
            return false;
        }
        var self = this;
        $.ajax({
            url: '/admin/featured/related_apps/query/',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                master_app_id: +($('#view-app input[name=master_app_id]').val()),
                related_app_id: +$(self).attr('data-id'),
                priority: +$(self).val()
            }),
            success: function(data){
                if(data.status === 'success') {
                    getRecommendApp(+($('#view-app input[name=master_app_id]').val()));
                }
            }
        });
    });
    // app select all
    $.selectAllToggle("app-mp-check", "app-mp-check-item");

    $('.imgpreviews').imgPreview();

    //--------------------首页自定义修改------------------
    $("#btn-modify-category").click(function () {
        var $categoryName = $("#category-name"), nameVal = $.trim($categoryName.val());
        var reg=/^[\u4E00-\u9FA5\uf900-\ufa2d]{1,3}$|^[A-Za-z0-9_]{1,6}$/;
        if (nameVal == '') {
            bootbox.alert("请输入名称！");
            $categoryName.focus();
            return false;
        } else if (!reg.test(nameVal)) {
            bootbox.alert("请输入1-3个汉字或1-6个英文字母！");
            $categoryName.focus();
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

        $.ajax({
            url : '/admin/featured_category/modify/',
            data : $("#form_modify_tab").serialize(),
            type : 'POST',
            sync : false,
            success : function (data) {
                if (data.status == 'success') {
                    location.href = window.location.protocol + "//" + window.location.host + "/admin/featured_category/custom/";
                } else {
                    alert('修改失败');
                }
            },
            error : function(err) {
                bootbox.alert('请求失败: '+err.statusText+'('+err.status+')');
            }
        });
    });

    // add app
    function setAjaxPagination(pagination, totalPage, maxLiLength, url, extraData, callback) {
        pagination.find('.page-li').remove();
        // setpagination
        // init
        var totalpage = totalPage,
            pageHtml = '',
            pageLength = totalpage < maxLiLength ? totalpage: maxLiLength;
        for (var i = 1; i <= pageLength; i++) {
            if (i === 1) {
                pageHtml += '<li class="active page-li"><a>' + i + '</a></li>';
            } else {
                pageHtml += '<li class="page-li"><a>' + i + '</a></li>';
            }
        }
        $(pageHtml).insertAfter(pagination.find('.prev'));

        pagination.find('.page-li a').click(function() {
            if($(this).parent().hasClass('active')) {
                return;
            }
            var self = this,
                pageNow = $(this).html();
            $.ajax({
                url: url,
                type: "GET",
                data: $.extend({},extraData,{page:parseInt(pageNow)}),
                success: function(data) {
                    $('#app-mp-check').prop('checked', false);
                    if(typeof callback === 'function'){
                        callback(data);
                    }

                    //change page
                    var totalpage = totalPage;
                    pagination.find('li.active').removeClass('active');
                    pagination.find('li.disabled').removeClass('disabled');
                    if(totalpage>maxLiLength && Number(pageNow)>=Math.floor(maxLiLength/2)+1 && Number(pageNow)<=(totalpage-Math.floor(maxLiLength/2))) {
                        pagination.find('.page-li a').each(function(index) {
                            $(this).html(Number(pageNow)+index-Math.floor(maxLiLength/2) );
                            if(index === Math.floor(maxLiLength/2)) {
                                $(this).parent().addClass('active');
                            }
                        });
                    }
                    else {
                        pagination.find('li.active').removeClass('active');
                        if(Number(pageNow)<Math.floor(maxLiLength/2)+1) {
                            pagination.find('.page-li a').each(function(index) {
                                if(index+1 == pageNow) {
                                    $(this).parent().addClass('active');
                                }
                                $(this).html(index+1);
                            });
                        }
                        else if (Number(pageNow)>(totalpage-Math.floor(maxLiLength/2))) {
                            var liLength = pagination.find('.page-li').length;
                            pagination.find('.page-li a').each(function(index) {
                                if(totalpage-(liLength-1-index) == pageNow) {
                                    $(this).parent().addClass('active');
                                }
                                $(this).html(totalpage-(liLength-1-index));
                            });
                        }
                        else {
                            $(this).parent().addClass('active');
                        }
                    }

                    if(pagination.find('li.active a').html() == 1) {
                        pagination.find('li.prev').addClass('disabled');
                    }
                    if(pagination.find('li.active a').html() == totalpage) {
                        pagination.find('li.next').addClass('disabled');
                    }
                }
            });
        });
        // set prev next page
        pagination.find('li.prev a').click(function() {
            if($(this).parent().hasClass('disabled')) {
                return;
            }
            pagination.find('li.active').prev().find('a').click();
        });
         pagination.find('li.next a').click(function() {
            if($(this).parent().hasClass('disabled')) {
                return;
            }
            pagination.find('li.active').next().find('a').click();
        });
    }

    function getRecommendApp(appId){
        $.ajax({
            url: '/admin/featured/related_apps/query/',
            type: 'GET',
            data: {
                app_id: appId,
                page: 1
            },
            success: function(data) {
                if(data.status === 'success') {
                    showAddedApp(data);
                    if(data.pages === 0){
                        $('.added-app').removeClass('table-bordered');
                        $('#view-app .pagination').addClass('hidden');
                    }
                    else {
                        $('.added-app').addClass('table-bordered');
                        $('#view-app .pagination').removeClass('hidden');
                        if(data.pages === 1) {
                            $('#view-app .pagination .next').addClass('disabled');
                        }
                        setAjaxPagination($('#view-app .pagination'), data.pages, 7, '/admin/featured/related_apps/query/', {app_id: appId}, showAddedApp);
                    }
                }
            }
        });
    }

    // load search result 
    function loadAppData(data){
        if(data.total === 0) {
            $('#add-app .pagination').addClass('hidden');
            $('.search-result .table tbody').html('<tr><td colspan="100%">没有找到相关APP</td><tr>');
            $('.search-result').removeClass('hidden');
            return;
        }
        else {
            $('#add-app .pagination').removeClass('hidden');
            $('.search-result .table tbody').html('');
            var items = data.items,
                appHTML = '';
            for(var i = 0; i<items.length; i++){
                appHTML += '<tr><td><input type="checkbox" class="app-mp-check-item" value="'+ items[i].id +'" /></td><td>'+ items[i].name +'</td><td>'+ items[i].provider +'</td></tr>';
            }
            $('.search-result .table tbody').html(appHTML);
            $('.search-result').removeClass('hidden');
        }
    }
    // show added apps
    function showAddedApp(data){
        if(data.total === 0) {
           $('.added-app tbody').html('<tr><td colspan="100%">此应用还没有添加推荐APP</td><tr>');
           return;
        }
        else {

            var starMap = ['暂无评星', '一星', '二星', '三星', '四星', '五星'];

            $('.added-app tbody').html('');
            var items = data.items,
                appHTML = '';
            for(var i = 0; i<items.length; i++){
                var stars = getStars(items[i].stars);
                appHTML += '<tr><td>'+ ((data.page-1)*10+i+1) +'</td><td><img src="'+ items[i].icon +'"></td><td>'+ items[i].name +'</td><td>'+ items[i].provider +'</td><td>'+ stars +'</td>'+
                            '<td><input type="text" class="text-center input-sm input-static recommend-app-priority" data-default="'+ items[i].priority +'" name="priority" value="'+ items[i].priority +'" data-id="'+ items[i].id +'"></td>'+
                            '<td><a class="btn btn-xs btn-warning off-added-app" data-id="'+ items[i].id +'">下架</a></td></tr>';
            }
            $('.added-app tbody').html(appHTML);
        }

        function getStars(stars){
            switch(stars) {
                case 0 :
                    return '暂无评星';
                case 0.5 :
                    return '半星';
                case 1 :
                    return '一星';
                case 1.5 :
                    return '一星半';
                case 2 :
                    return '二星';
                case 2.5 :
                    return '二星半';
                case 3 :
                    return '三星';
                case 3.5 :
                    return '三星半';
                case 4 :
                    return '四星';
                case 4.5 :
                    return '四星半';
                case 5 :
                    return '五星';
            }
        }
    }
    

    // 添加首页分类图片
    // upload
    // icon 
    // work when page has Qiniu script
    try{
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
    }catch(e){
        // do nothing
    }
});

function is_iE() {
    return !!window.ActiveXObject;
}
