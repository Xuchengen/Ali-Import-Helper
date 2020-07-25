chrome.webNavigation.onCompleted.addListener(function (details) {
    chrome.tabs.sendMessage(details.tabId, {"id": "ALIBABA:INJECT_HTML"}, function (detail) {
        chrome.storage.sync.get(["SETTING:IMPORT_API"], function (result) {
            let cache = result["SETTING:IMPORT_API"];
            let url = cache[detail.target];
            if (url === undefined || url.length <= 0) {
                return false;
            }
            $.post(url, detail, function (resp) {
                console.log(JSON.stringify(resp));
            }, 'json');
        });
    });
}, {
    url: [
        {pathContains: "product-detail"},
        {pathContains: "item"}
    ]
});