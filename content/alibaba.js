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
                        "skuNo": getSkuNo(),
                        "title": getTitle(),
                        "keywords": getKeywords(),
                        "description": getDescription(),
                        "priceStrategy": getPriceStrategy(),
                        "pictureList": getPictures(),
                        "quickDetails": getQuickDetails(),
                        "detailImages": getDetailImages(),
                        "target": "alibaba"
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
        return $("h1[class='ma-title']").html();
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
        $("div.thumb a[rel='nofollow']").find("img").each(function (i, e) {
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
        let skuNoRegex = /_(.*?)\.html/;
        let href = window.location.href;
        let result = href.match(skuNoRegex);
        if (result.length >= 2) {
            return result[1];
        }
        return null;
    }

    /**
     * 获取商品属性
     */
    function getQuickDetails() {
        let result = [];
        $("div.do-overview div.do-entry:first").each(function (i, e) {
            $(e).find("dl").each(function (j, se) {
                let attrTitle = $(se).find(".attr-name").attr("title");
                let attrValue = $(se).find(".ellipsis").attr("title");
                result.push({
                    "title": attrTitle,
                    "value": attrValue
                });
            });
        });
        return result;
    }

    /**
     * 获取价格策略
     */
    function getPriceStrategy() {
        let $priceWrap = $("div.ma-price-wrap");
        if ($priceWrap.find("ul").length === 0) {
            // 报价范围最小订购数量
            let minOrderText = $priceWrap.find("span.ma-min-order").html();
            let minOrderArray = minOrderText.match(/\d+/);
            let $refPrice = $priceWrap.find("span.ma-ref-price");
            let $refPriceSpan = $refPrice.find("span");
            let priceArray;
            if ($refPriceSpan.length === 0) {
                priceArray = $refPrice.html().match(/(\d+(\.\d+)?)/g);
            } else {
                priceArray = $refPriceSpan.html().match(/(\d+(\.\d+)?)/g);
            }
            if (priceArray.length === 1) {
                return {
                    "type": "single",
                    "priceRule": {
                        "type": "single",
                        "price": priceArray[0],
                        "pieces": minOrderArray[0]
                    }
                }
            } else {
                return {
                    "type": "single",
                    "priceRule": {
                        "type": "range",
                        "startPrice": priceArray[0],
                        "endPrice": priceArray[1],
                        "pieces": minOrderArray[0]
                    }
                }
            }
        } else {
            // 订购数量范围报价
            let list = [];
            $priceWrap.find("ul li").each(function (i, e) {
                let rangeText = $(e).find("span.ma-quantity-range").html();
                let priceText = $(e).find("span.pre-inquiry-price").html();

                if ($(e).hasClass("util-clearfix") || $(e).children().first().is("div")) {
                    rangeText = $(e).find("div.ma-quantity-range").html();
                    priceText = $(e).find("span.priceVal").html();
                }

                let rangeTextResult = rangeText.match(/\d+/g);
                let priceTextResult = priceText.match(/(\d+(\.\d+)?)/g);
                let startPieces = rangeTextResult[0];
                let endPieces = 0;
                let price = 0;
                if (rangeTextResult.length > 1) {
                    startPieces = rangeTextResult[0];
                    endPieces = rangeTextResult[1];
                }
                if (priceTextResult.length > 0) {
                    price = priceTextResult[0];
                }
                list.push({
                    "startPieces": startPieces,
                    "endPieces": endPieces,
                    "price": price
                });
            });
            return {
                "type": "multiple",
                "priceRule": list
            }
        }
    }

    /**
     * 获取商品详情图片
     */
    function getDetailImages() {
        // 将商品详情页图片全部加载出来
        $("div.tab-body img[data-src]").each(function (i, e) {
            $(e).attr({src: $(e).data("src")});
        });

        let result = [];
        let minArea = 62500;
        $("div.tab-body-pane div.module-productSpecification img").each(function (i, e) {
            if ($(e).parent().is("noscript")) {
                return true;
            }
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