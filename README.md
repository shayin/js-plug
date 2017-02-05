js-plug
===============


基于jquery的插件，兼容IE6

### LHTableComponent
1. 配合laravel分页的前端 table + pagination 插件
2. 使用
```javascript

$(".lhTable").createPage({
    header: [
        {field: 'order_id', name: '订单'},
        {field: 'money', name: '金额'},
    ],
    current: 1,
    perPage: 6,
    dataUrl: 'api.example.com/getOrderList',
    dataType: 'jsonp',
    csrfToken: $('meta[name="csrf-token"]').attr('content'),
    blankHtml: "这里是没有任何内容时候的提示"
});

```