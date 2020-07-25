$(function () {
    $("#submit").on("click", function () {
        let alibaba = $("#alibaba").val();
        let aliexpress = $("#aliexpress").val();

        let data = {
            "alibaba": alibaba,
            "aliexpress": aliexpress
        };

        chrome.storage.sync.set({
            "SETTING:IMPORT_API": data
        });
    });

    (function () {
        chrome.storage.sync.get(["SETTING:IMPORT_API"], function (result) {
            let data = result["SETTING:IMPORT_API"];
            $("#alibaba").val(data.alibaba);
            $("#aliexpress").val(data.aliexpress);
        });
    })();

});