(function () {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        let msgId = message.id;
        if (msgId === 'ALIBABA:INJECT_HTML') {
            $.get(chrome.extension.getURL("resources/templates/alibaba/alibaba.html"), function (html) {
                $("body").append(html);
            });
            $("body").on("click", "#alibabaImportBtn", function () {
                $("html").animate({scrollTop: 0}, 300, function () {
                    let detail = {
                        "url": getUrl(),
                        "title": getTitle(),
                        "keywords": getKeywords(),
                        "description": getDescription(),
                        "skuNo": getSkuNo(),
                        "pictureList": getPictures(),
                        "detailImages": getDetailImages(),
                        "target": "aliexpress"
                    };
                    sendResponse(detail);
                });
            });
        }
        return true;
    });

    /**
     * 获取商品地址
     */
    function getUrl() {
        return location.href;
    }

    /**
     * 获取商品标题
     */
    function getTitle() {
        return $("h1[class='product-title-text']").html();
    }

    /**
     * 获取商品关键词
     */
    function getKeywords() {
        let $meta = $("meta[name='keywords']");
        if ($meta.length > 0) {
            return $meta.attr("content");
        } else {
            return null;
        }
    }

    /**
     * 获取商品描述
     */
    function getDescription() {
        let $meta = $("meta[name='description']");
        if ($meta.length > 0) {
            return $meta.attr("content");
        } else {
            return null;
        }
    }

    /**
     * 获取商品主图列表
     */
    function getPictures() {
        let imgList = [];
        $("ul.images-view-list").find("img").each(function (i, e) {
            let src = $(e).attr("src");
            if (src.indexOf("https") === -1 && src.indexOf("http") === -1) {
                src = "https:" + src;
            }
            imgList.push(src.replace(/_50x50\.(.*)/, ""));
        });
        return imgList;
    }

    /**
     * 获取商品SKU编码
     */
    function getSkuNo() {
        let skuNoRegex = /item\/(.*?)\.html/;
        let href = window.location.href;
        let result = href.match(skuNoRegex);
        if (result.length >= 2) {
            return result[1];
        }
        return null;
    }

    /**
     * 获取商品详情图片
     */
    function getDetailImages() {
        let result = [];
        let minArea = 62500;
        $("div.product-description img").each(function (i, e) {
            let width = $(e).width;
            let height = $(e).hidden;
            let _area = width * height;
            let src = $(e).data("src");

            if (_area < minArea) {
                return true;
            }

            if (src === undefined || $.trim(src) === '') {
                src = $(e).attr("src");
            }

            if (src.indexOf("https") === -1 && src.indexOf("http") === -1) {
                src = "https:" + src;
            }

            result.push(src);
        });

        if (result.length <= 0) {
            return null;
        }

        return {
            "type": "image",
            "imgs": result
        }
    }

})();