(function ($) {
    var ms = {
        pageCount: 1,
        init: function (obj, args) {
            return (function () {
                ms.initPageData(args);
                if (args.onlyPage != true) {
                    ms.initTable(obj, args);
                }
                ms.doRequest(obj, args);
                ms.bindEvent(obj, args);
            })();
        },
        initPageData: function (args) {
            ms.perPage = args.perPage;
            ms.onlyPage = args.onlyPage;
            if (typeof(args.backFn) == "function") {
                ms.backFn = args.backFn;
            } else {
                ms.backFn = function () {
                    console.log('没有定义回调函数');
                }
            }
            if (typeof(args.errorFn) == "function") {
                ms.errorFn = args.errorFn;
            } else {
                ms.errorFn = function () {
                    console.log('没有定义错误处理回调函数');
                }
            }
        },
        initTable: function (obj, args) {
            return (function () {
                obj.empty();
                obj.append('<table><thead></thead><tbody></tbody></table><div class="lhpagination"></div>');
                var tableHtml = '<tr>';
                for (i = 0; i < args.header.length; i++) {
                    tableHtml += '<th>' + args.header[i].name + '</th>';
                }
                tableHtml += '</tr>';
                obj.find('thead').append(tableHtml);
            })();
        },
        doRequest: function (obj, args) {
            return (function () {
                $.ajax({
                    type: "GET",
                    url: args.dataUrl,   //提交的URL
                    data: {page: ms.current, perPage: ms.perPage},
                    dataType: args.dataType,
                    headers: {
                        'X-CSRF-TOKEN': args.csrfToken
                    },
                    success: function (json) {
                        ms.fillData(obj, json, args);
                    },
                    error: function () {
                        console.log("Connection error");
                    }
                });
            })();
        },
        fillData: function (obj, json, args) {
            return (function () {
                if (json.ret == 0) {
                    ms.pageCount = Math.ceil(json.data.total / ms.perPage);
                    ms.current = json.data.current_page;
                    ms.current = ms.current || args.currentPage;
                    if (ms.onlyPage == undefined || ms.onlyPage == false) {
                        var html = "";
                        var data = json.data.data;
                        for (i = 0; i < data.length; i++) {
                            html += '<tr>';
                            for (j = 0; j < args.header.length; j++) {
                                if (args.header[j].constant != undefined) {
                                    html += '<td>' + args.header[j].constant + '</td>';
                                } else if (args.header[j]['type'] == 'time') {
                                    html += '<td>' + moment.unix(data[i][args.header[j]['field']]).format('YYYY-MM-D hh:mm:ss') + '</td>';
                                } else {
                                    html += '<td>' + data[i][args.header[j]['field']] + '</td>';
                                }
                            }
                            html += '</tr>';
                        }
                        if (data.length == 0 && args.blankHtml) {
                            html += '<tr><td colspan="' + args.header.length + '">' + args.blankHtml + '</td></tr>';
                        }
                        obj.find('tbody').html(html);
                        if (data.length != 0) {
                            ms.fillHtml(obj);
                        }
                    } else {
                        args.backFn(json.data);
                        ms.fillHtml(obj);
                    }
                } else {
                    ms.errorFn(json);
                }
            })();
        },
        // 填充分页html
        fillHtml: function (obj) {
            return (function () {
                obj.find('.lhpagination').empty();
                //上一页
                if (ms.current > 1) {
                    obj.find('.lhpagination').append('<a href="javascript:;" class="prevPage">上一页</a>');
                } else {
                    //obj.remove('.prevPage');
                    obj.find('.lhpagination').append('<span class="disabled">上一页</span>');
                }
                //中间页码
                if (ms.current != 1 && ms.current >= 4 && ms.pageCount != 4) {
                    obj.find('.lhpagination').append('<a href="javascript:;" class="lhNumber">' + 1 + '</a>');
                }
                if (ms.current - 2 > 2 && ms.current <= ms.pageCount && ms.pageCount > 5) {
                    obj.find('.lhpagination').append('<span>...</span>');
                }
                var start = ms.current - 2, end = ms.current + 2;
                if ((start > 1 && ms.current < 4) || ms.current == 1) {
                    end++;
                }
                if (ms.current > ms.pageCount - 4 && ms.current >= ms.pageCount) {
                    start--;
                }
                for (; start <= end; start++) {
                    if (start <= ms.pageCount && start >= 1) {
                        if (start != ms.current) {
                            obj.find('.lhpagination').append('<a href="javascript:;" class="lhNumber">' + start + '</a>');
                        } else {
                            obj.find('.lhpagination').append('<span class="current">' + start + '</span>');
                        }
                    }
                }
                if (ms.current + 2 < ms.pageCount - 1 && ms.current >= 1 && ms.pageCount > 5) {
                    obj.find('.lhpagination').append('<span>...</span>');
                }
                if (ms.current != ms.pageCount && ms.current < ms.pageCount - 2 && ms.pageCount != 4) {
                    obj.find('.lhpagination').append('<a href="javascript:;" class="lhNumber">' + ms.pageCount + '</a>');
                }
                //下一页
                if (ms.current < ms.pageCount) {
                    obj.find('.lhpagination').append('<a href="javascript:;" class="nextPage">下一页</a>');
                } else {
                    obj.find('.lhpagination').remove('.nextPage');
                    obj.find('.lhpagination').append('<span class="disabled">下一页</span>');
                }
            })();
        },
        //绑定事件
        bindEvent: function (obj, args) {
            return (function () {
                obj.on("click", "a.lhNumber", function () {
                    var current = parseInt($(this).text());
                    ms.current = current;
                    ms.doRequest(obj, args);
                });
                //上一页
                obj.on("click", "a.prevPage", function () {
                    var current = parseInt(obj.find('.lhpagination').children("span.current").text());
                    ms.current = current - 1;
                    ms.doRequest(obj, args);
                });
                //下一页
                obj.on("click", "a.nextPage", function () {
                    var current = parseInt(obj.find('.lhpagination').children("span.current").text());
                    ms.current = current + 1;
                    ms.doRequest(obj, args);
                });
            })();
        }
    };
    $.fn.createPage = function (options) {
        var args = $.extend({
            current: 1,
            perPage: 6,
            backFn: function (json) {

            }
        }, options);
        ms.init(this, args);
    }
})(jQuery);