/**
 * @fileoverview  #note
 * @author  #name
 * @date  14-1-3
 */
(function ($) {

    var team = $.IC || ($.IC = {});
    //判断是否支持placeHolder属性
    var isSupportOnInput = !!("oninput" in window),

    //默认配置
        config = {
            focusColor: "#999",  // String        获取焦点时的字体颜色值
            blurColor: "#333",    // String        获取失去时的字体颜色值
            text: "请输入"          // String        占位文字
        },
        operation = {
            init: function (o) {
                var target = o.target,
                    id = target[0].id;
                if (id === undefined) {
                    //id = 'placeholder_' + ( +new Date() ) + ( Math.random() + '' ).slice(-8);
                    target.id = id;
                }

                operation.createLabel(o, id);
                operation.bindFocus(o);
                operation.bindBlur(o);
                operation.bindInput(o);
                operation.bindKeyup(o);
            },
            createLabel: function (o, id) {
                o.label = $('<label for="' + id + '">' + o.text + '</label>');
                operation.setLabelStyle(o);
                o.label.appendTo(o.target[0].ownerDocument.body);
                o.label.on('click',function () {
                    o.target.focus();
                }).on("selectstart", function () {
                        return false;
                })
            },
            setLabelStyle: function (o) {
                var target = o.target,
                    width = target.width(),
                    height = parseInt(target.css("height"), 10),
                    offset = target.offset(),
                    paddingLeft = parseInt(target.css("paddingLeft"), 10),
                    paddingRight = parseInt(target.css("paddingRight"), 10),
                    paddingTop = parseInt(target.css("paddingTop"), 10),
                    paddingBottom = parseInt(target.css("paddingBottom"), 10),
                    borderLeftWidth = parseInt(target.css("borderLeftWidth"), 10),
                    borderTopWidth = parseInt(target.css("borderTopWidth"), 10),
                    borderBottomWidth = parseInt(target.css("borderBottomWidth"), 10),
                    borderRightWidth = parseInt(target.css("borderRightWidth"), 10),
                    lineHeight = target[0].type === "textarea" ? 22 : height;
                o.visible = target[0].value === "";
                o.label.css({
                    width: width,
                    height: height,
                    lineHeight: lineHeight + "px",
                    position: "absolute",
                    padding: (paddingTop + borderTopWidth) + "px " + (paddingRight + borderRightWidth) + "px " + (paddingBottom + borderBottomWidth) + "px " + (paddingLeft + borderLeftWidth) + "px",
                    left: offset.left,
                    top: offset.top,
                    cursor: 'text',
                    display: o.visible ? 'block' : 'none'
                })
            },
            // 绑定焦点处理事件
            bindFocus: function (o) {
                o.target.on('focus.placeholder', function () {
                    o.label.css('color', o.focusColor);
                });
            },
            // 绑定失去焦点事件
            bindBlur: function (o) {
                o.target.on('blur.placeholder', function () {
                    o.label.css('color', o.blurColor);

                    if (o.timer) {
                        clearInterval(o.timer);
                        o.timer = null;
                    }
                });
            },
            // 绑定input事件
            bindInput: function (o) {
                // 标准浏览器使用input事件
                if (isSupportOnInput) {
                    o.target.on('input.placeholder', function () {
                        var val = o.target[0].value;
                        if (o.target[0].type !== 'password') {
                            val = $.trim(val);
                        }

                        if (val === '') {
                            if (!o.visible) {
                                o.visible = true;
                                o.label.show();
                            }
                        } else {
                            if (o.visible) {
                                o.visible = false;
                                o.label.hide();
                            }
                        }
                    });
                }
                // 低版本浏览器使用keydown+定时器的方式来模拟input事件
                else {
                    o.target.on('keydown.placeholder', function () {
                        var val = o.target[0].value;

                        if (o.target[0].type !== 'password') {
                            val = $.trim(val);
                        }

                        if (o.timer) {
                            clearInterval(o.timer);
                            o.timer = null;
                        }

                        if (val === '') {
                            if (!o.visible) {
                                o.visible = true;
                                o.label.show();
                            }
                            else {
                                o.timer = setInterval(function () {
                                    var val = o.target[0].value;

                                    if (o.target[0].type !== 'password') {
                                        val = $.trim(val);
                                    }

                                    if (val !== '') {
                                        clearInterval(o.timer);
                                        o.timer = null;
                                        o.visible = false;
                                        o.label.hide();
                                    }
                                }, 50);
                            }
                        }
                        else {
                            if (o.visible) {
                                o.visible = false;
                                o.label.hide();
                            }
                        }
                    });
                }
            },

            // 绑定keyup事件
            bindKeyup: function (o) {
                o.target.on('keyup.placeholder', function () {
                    var val = o.target[0].value;

                    if (o.target[0].type !== 'password') {
                        val = $.trim(val);
                    }

                    if (o.timer) {
                        clearInterval(o.timer);
                        o.timer = null;
                    }

                    if (val === '') {
                        if (!o.visible) {
                            o.visible = true;
                            o.label.show();
                        }
                    }
                });
            }
        };

    var placeHolder = function (target, options) {
        target = $(target).eq(0);
        options = options || {};

        if (!target)  return;

        //合并默认配置
        var o = $.extend({}, config, options);
        o.target = target;
        o.timer = null;
        operation.init(o);
        this._o_ = o;
    };
    placeHolder.prototype = {
        distroy: function () {
            if (!this._o_) return;
            var o = this._o_;
            o.label.remove();
            o.target.off("focus.placeholder blur.placeholder keyup.placeholder keydown.placeholder input.placeholder");
            this._o_ = o = null;
            delete  this._o_;
        },
        disable: function () {
            if (!this._o_) return;
            var o = this._o_;
            o.label.hide();
            o.target.off("focus.placeholder blur.placeholder keyup.placeholder keydown.placeholder input.placeholder");
            o.visible = false;
        },
        enable: function () {
            var o = this._o_;
            if (!o) return;
            if (!o.visible) {
                o.visible = true;
                o.label.show();
                operation.bindFocus(o);
                operation.bindBlur(o);
                operation.bindInput(o);
                operation.bindKeyup(o);
            }
        }
    };
    team.PlaceHolder = placeHolder;
})(jQuery);

 