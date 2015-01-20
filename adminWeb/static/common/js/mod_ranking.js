$(function () {
    // bootbox设置区域
    bootbox.setDefaults({
        locale : "zh_CN"
    });

    //修改单页条数
    $(".itemperpage").update('.', 'per_page');

    // 选择来源
    $("#provider").change(function () {
        $(this).installUrl('provider', $(this).val());
    });

    //修改排序
    $(".ranking_priority").update();


    // 调整app标签
    $(".tag").update('.', 'tag_id');

    // 实现全选
    $.selectAllToggle("mp-check", "mp-check-item");

    //下架
    $("#btn-mp-sw").click(function () {
        var result = $.checkboxVal("mp-check-item");
        var method = $(this).data('method');
        if (result.length > 0) {
            bootbox.confirm("选择下架后，你投放的资源将被移除，是否继续？", function (value) {
                if (value) {
                    var params = {"ids" : result, "method" : method};
                    var url = location.href;
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
