(function (root, factory) {
    // if (typeof define === 'function' && define.amd) {
    //     // AMD. Make globaly available as well
    //     define(['jquery','PDFJS'],function (jquery) {
    //         return (root.holiday = factory(jquery,PDFJS));
    //     });
    // } else if (typeof module === 'object' && module.exports) {
    //     var jQuery = (typeof window != 'undefined') ? window.jQuery : undefined;
    //     if (!jQuery) {
    //         jQuery = require('jquery');
    //         if (!jQuery.fn) jQuery.fn = {};
    //     }

    //     var PDFJS = (typeof window != 'undefined') ? window.PDFJS : undefined;
    //     if (!PDFJS) {
    //         PDFJS = require('PDFJS');
    //     }
    //     module.exports = factory(jQuery,PDFJS);
    // }else{
    //     root.PDFViewer = factory(jQuery,PDFJS);
    // }

    root.PDFViewer = factory(jQuery,PDFJS);
}(this, function($,PDFJS) {
    /// 滚轮事件的统一处理
    function scrollEvent(){
        var _eventCompat = function(event) {
            var type = event.type;
            if (type == 'DOMMouseScroll' || type == 'mousewheel') {
                event.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
            }
            //alert(event.delta);
            if (event.srcElement && !event.target) {
                event.target = event.srcElement;    
            }
            if (!event.preventDefault && event.returnValue !== undefined) {
                event.preventDefault = function() {
                    event.returnValue = false;
                };
            }
            /* 
               ......其他一些兼容性处理 */
            return event;
        };

        if (window.addEventListener) {
            return function(el, type, fn, capture) {
                if (type === "mousewheel" && document.mozFullScreen !== undefined) {
                    type = "DOMMouseScroll";
                }
                el.addEventListener(type, function(event) {
                    fn.call(this, _eventCompat(event));
                }, capture || false);
            }
        } else if (window.attachEvent) {
            return function(el, type, fn, capture) {
                el.attachEvent("on" + type, function(event) {
                    event = event || window.event;
                    fn.call(el, _eventCompat(event));    
                });
            }
        }
    }
    
    /// 滚轮事件的统一处理

    function renderPage(num) {
        pageRendering = true;
        // Using promise to fetch the page
        pdfDoc.getPage(num).then(function(page) {
            var viewport = page.getViewport(scale);
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);
            // Wait for rendering to finish
            renderTask.promise.then(function() {
                pageRendering = false;
                if (pageNumPending !== null) {
                    // New page rendering is pending
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });
        // Update page counters
        document.getElementById('page_num').textContent = pageNum;
    }

    function pdfDrawer(c,pdfDoc){
        scrollEvent()($(c)[0],"mousewheel", function(e){
            //if (e.delta < 0) { alert("鼠标向上滚了！"); }
            //console.log(e);
        });
        return {
            container:$(c),
            pdfDoc:pdfDoc,
            currentPage:null,
            pageNumPending:null,
            toPage:function(num){
                var that=this;
                this.pdfDoc.getPage(num).then(function(page) {
                    var $canvas=$('<canvas id="'+num+'"></canvas>');
                    that.container.append($canvas);
                    var canvas=$canvas[0];
                    var ctx = canvas.getContext('2d');
                    var viewport = page.getViewport(1.5);
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    // Render PDF page into canvas context
                    var renderContext = {
                        canvasContext: ctx,
                        viewport: viewport
                    };
                    var renderTask = page.render(renderContext);
                    that.currentPage=page;
                    // Wait for rendering to finish
                    renderTask.promise.then(function() {
                        pageRendering = false;
                        if (that.pageNumPending !== null) {
                            // New page rendering is pending
                            that.toPage(that.pageNumPending);
                            that.pageNumPending = null;
                        }
                    });
                }); 
            },
        }
    }

    return {
        createPDFDoc:function (url,callback){
            PDFJS.getDocument({url:url,source:{disableAutoFetch:true}}).then(function (pdfDoc_) {
                callback(pdfDoc_);
            });
        },
        createPdfDrawer:function(canvas,pdfdoc){
            return pdfDrawer(canvas,pdfdoc);
        }
    }
}))

