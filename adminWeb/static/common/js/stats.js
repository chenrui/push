// 数据统计
$(function () {
// bootbox设置区域
    bootbox.setDefaults({
        locale: "zh_CN"
    });

//++ 商店流量
    //查询
    $("#shop-statistics-search").click(function () {
        if ("sst" == $("[name=statistics]:checked").val()) {
            $("#statform").attr("method", "GET");
            $("#statform").attr("action", "/admin/marketapp_stats/");
        }
        else if ("sds" == $("[name=statistics]:checked").val()) {
            $("#statform").attr("method", "GET");
            $("#statform").attr("action", "/admin/marketapp_stats/daily/1/");
            /*
             if ($.isNull($("#from-time").val()) || $.isNull($("#to-time").val())){
             bootbox.alert("查询时间不能为空");
             return false;
             }
             */
        }
    });

    //导出
    $("#shop-export-excel").click(function () {
        $("#statform").attr("method", "POST");
        $("#statform").attr("action", "/admin/stats/export_excel/");
        /*
         if ("sds" == $("[name=statistics]:checked").val()){
         if ($.isNull($("#from-time").val()) || $.isNull($("#to-time").val())){
         bootbox.alert("查询时间不能为空");
         return false;
         }
         }
         */
    });

//++ 搜索统计
    // 全选
    $.selectAllToggle("search-word-th", "search-word-item");
    //    $.selectAllToggle("search-record-th", "search-record-item");
    // 搜索词与搜索记录之间切换
    //$.tabToggle("search-word-item-switch", "search-wct-item");
    // 页面刷新保持到原有位置
    //$.setPos("search-word-item-switch", "search-wct-item");

    // 搜索词删除
    $("#btn-sws-del").click(function () {
        var values = $.checkboxVal("search-word-item");
        if (values.length > 0) {
            bootbox.confirm("请确定是否删除？", function (result) {
                if (result) {
                    var params = {'url': '/admin/search_stats/delete/',
                        'type': 'POST',
                        'data': {'keywords': values}
                    };
                    $.sendAjax(params);
                }
            });
        } else {
            bootbox.alert("请先选择，然后才能进行删除操作!", function () {
            });
        }
    });

    //日期选择
    var datetimeParam = {
        language: 'zh-CN',
        format: 'yyyy-mm-dd',
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0
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
    })
});
