/*
Created by Andrew Goodwin
*/

(function ($) {
    var methods = {
        show: function (options, shown, hidden) {
            var defaults = {
                timed: false,
                show_duration: 5000,
                show_countdown: false,
                show_close: true,
                show_mask: true,
                allow_escape: true,
                mask_class: "",
                modal_class: "",
                mask_opacity: "0.7",
                redirect_close_url: "",
                close_img: "images/fancy_closebox.png",
                default_button: null,
                default_button_causes_close: true,
                height: "",
                width: "",
                show_animation: "",
                attach_location: "",
                prependToBody: false,
		resize_animation: true
            };

            current_options = $.extend(defaults, options);
            hiddenCallback = hidden;
            return this.each(function () {
                /*Taking care of bad options*/
                if (current_options.close_img == "")
                    current_options.close_img = "images/fancy_closebox.png";

                if (current_options.mask_opacity == "" || parseFloat(current_options.mask_opacity) > 1 || parseFloat(current_options.mask_opacity) < 0)
                    current_options.mask_opacity = "0.7"

                /****************************/
                if (current_options.prependToBody) {
                    this_modal_window = $(this).clone();
                    $("body").prepend(this_modal_window);
                    $(this).remove();
                }
                else {
                    this_modal_window = this;
                }

                //if it wasn't a js-modal-window before then it will be now
                $(this_modal_window).addClass('js-modal-window');


                clearInterval(countdown);
                clearTimeout(timeout);

                if (current_options.show_mask) {
                    $("#js-modal-window-mask").remove();
                    $("body").prepend("<div id='js-modal-window-mask'></div>");

                    var base_mask_css = {
                        "position": "fixed",
                        "left": "0px",
                        "top": "0px",
                        "z-index": "1000000",
                        "display": "none"
                    }

                    $("#js-modal-window-mask").css(base_mask_css);


                    if (current_options.mask_class != "") {
                        var classes = current_options.mask_class.toString().split(' ');
                        $.each(classes, function (index, value) {
                            $("#js-modal-window-mask").addClass(value);
                        });
                    }
                    else {
                        var mask_css = {
                            "background-color": "#000"
                        }
                        $("#js-modal-window-mask").css(mask_css);
                    }

                    $("#js-modal-window-mask").css("opacity", current_options.mask_opacity);

                    $('#js-modal-window-mask').show();
                }

                var base_modal_window_css = {
                    "position": "fixed",
                    "display": "none",
                    "z-index": "1000001"
                }

                $(".js-modal-window").css(base_modal_window_css);

                if (current_options.modal_class != "") {
                    var classes = current_options.modal_class.toString().split(' ');
                    $.each(classes, function (index, value) {
                        $(".js-modal-window").addClass(value);
                    });

                }
                else {
                    var modal_window_css = {
                        "background": "#fff",
                        "padding": "20px",
                        "color": "#000"
                    }
                    $(".js-modal-window").css(modal_window_css);
                }

                if (current_options.width != "")
                    $(".js-modal-window").width(current_options.width);

                if (current_options.height != "")
                    $(".js-modal-window").height(current_options.height);

                initialWidth = $(".js-modal-window").outerWidth();
                initialHeight = $(".js-modal-window").outerHeight();

                var winH = $(window).height();
                var winW = $(window).width();

                ZoomModalContent();
                //if ($(this_modal_window).children("img").attr('src').search(/(.*)\.(jpg|jpeg|gif|png|bmp|tif|tiff)$/gi) != -1)
                //alert("it's an image!");

                if (current_options.attach_location == "top") {
                    if (current_options.show_closer)
                        $(this_modal_window).css('top', 30);
                    else
                        $(this_modal_window).css('top', 0);
                }
                else if (current_options.attach_location == "bottom") {
                    $(this_modal_window).css('bottom', 0);
                }
                else if (current_options.attach_location == "left") {
                    $(this_modal_window).css('left', 0);
                }
                else if (current_options.attach_location == "right") {
                    $(this_modal_window).css('right', 0);
                }
                else {
                    $(this_modal_window).css('top', winH / 2 - $(this_modal_window).outerHeight() / 2);
                }

                if (current_options.attach_location == "") {
                    if (current_options.show_animation) {
                        $(this_modal_window).stop().animate({
                            top: winH / 2 - $(this_modal_window).outerHeight() / 2,
                            left: winW / 2 - $(this_modal_window).outerWidth() / 2
                        }, 200, null);
                    }
                    else {
                        $(this_modal_window).css({ "top": winH / 2 - $(this_modal_window).outerHeight() / 2, "left": winW / 2 - $(this_modal_window).outerWidth() / 2 });
                    }
                }
                else if (current_options.attach_location === "top" || current_options.attach_location === "bottom") {
                    if (current_options.show_animation) {
                        $(this_modal_window).stop().animate({
                            left: winW / 2 - $(this_modal_window).outerWidth() / 2
                        }, 200, null);
                    }
                    else {
                        $(this_modal_window).css({ "left": winW / 2 - $(this_modal_window).outerWidth() / 2 });
                    }
                }
                else { //left or right
                    if (current_options.show_animation) {
                        $(this_modal_window).stop().animate({
                            top: winH / 2 - $(this_modal_window).outerHeight() / 2
                        }, 200, null);
                    }
                    else {
                        $(this_modal_window).css({ "top": winH / 2 - $(this_modal_window).outerHeight() / 2 });
                    }
                }


                if ($("body").height() > $(window).height())
                    $('#js-modal-window-mask').css('height', $("body").height());
                else
                    $('#js-modal-window-mask').css('height', $(window).height());

                if ($("body").width() > $(window).width())
                    $('#js-modal-window-mask').css('width', $("body").width());
                else
                    $('#js-modal-window-mask').css('width', $(window).width());

                //find out if it will fit the window.  if not, make adjustments???               
                if ($(this_modal_window).outerHeight() > winH) {
                    //taller than the window
                    origOffsetTop = $(document).scrollTop();
                    if (current_options.show_close) {
                        $(this_modal_window).css('top', 30);
                    }
                    else {
                        $(this_modal_window).css('top', 0);
                    }

                    $(window).off("scroll.modal").on("scroll.modal", function (e) {
                        $(this_modal_window).css('top', -$(document).scrollTop() + origOffsetTop);
                    });
                }

                if ($(this_modal_window).outerWidth() > winW) {
                    //wider than the window
                    //console.log("too wide");
                }
                //////////////////////////////////////////////////////////////////

                if (current_options.show_animation == "fadein")
                    $(this_modal_window).fadeIn("slow", function () {
                        AddCloser();
                    });
                else if (current_options.show_animation == "slide")
                    $(this_modal_window).slideToggle(1500, function () {
                        AddCloser();
                    });
                else {
                    $(this_modal_window).show(0, function () {
                        AddCloser();
                    });
                }

                if (current_options.timed == true) {
                    if (current_options.show_countdown == true) {
                        $(this_modal_window).append("<div id='js-modal-countdown'></div>");

                        var countdown_css = {
                            "position": "absolute",
                            "bottom": "0px",
                            "right": "0px"
                        }
                        $("#js-modal-countdown").css(countdown_css);
                        var count = current_options.show_duration / 1000;
                        $("#js-modal-countdown").html(count);

                        countdown = setInterval(function () {
                            count--;
                            $("#js-modal-countdown").html(count);
                        }, 1000);
                    }

                    //$(window).resize();

                    timeout = setTimeout(function () {
                        HideModal();
                        if (typeof hidden == 'function') {
                            hidden.call(this_modal_window);
                        }
                    }, current_options.show_duration);

                }




                // now we are calling our own callback function
                if (typeof shown == 'function') {
                    shown.call(this_modal_window);
                }
            });

        },
        hide: function (options, hidden) {
            return this.each(function () {
                HideModal();
                if (typeof hidden == 'function') {
                    hidden.call(this_modal_window);
                }
            });

        },
        resize: function (options, resized) {
            return this.each(function () {

                $(window).resize();

                if (typeof resized == 'function') {
                    resized.call(this_modal_window);
                }
            });
        }
    }

    function ZoomModalContent() {
        $(".js-modal-window").on("click.modal", ".detail-img", function (e) {

            if ($("#js-img-zoom").is(":visible")) {
                //$(".js-modal-window img").unbind("click");
            }
            else {
                $(".js-modal-window").append("<div id='js-img-zoom'></div>");
                var img = $(this).clone();
                imgHeight = $(img).height();
                $("#js-img-zoom").html(img);
                $("#js-img-zoom img").removeClass("detail-img").addClass("zoom-img");
                //var css = { 'height': $(window).height() - 7, 'width': $(img).height() / imgHeight * $(img).width(), 'position': 'fixed', 'top': 7, 'left': $(window).width() / 2 - $(img).width() / 2 };
                //$("#js-img-zoom").css(css);
                $("#js-img-zoom").css({ 'position': 'fixed', 'top': '50%', 'height': $(img).height(), 'width': $(img).width(), 'left': $(img).offset().left });
                $("#js-img-zoom").stop().animate({
                    height: $(window).height() - 15,
                    width: ($(window).height() - 15) * .67,
                    left: ($(window).width() / 2 - (($(window).height() - 15) * .67) / 2) + 21,
                    top: 7
                }, 300, function () {
                    $("#js-img-zoom img").click(function () {
                        $("#js-img-zoom").remove();
                    });

                    if (current_options.show_close) {
                        $("#js-img-zoom").append("<img id='js-img-zoom-closer' src='" + current_options.close_img + "' />");

                        var closer_css = {
                            "position": "absolute",
                            "top": "-15px",
                            "right": "-15px",
                            "cursor": "pointer",
                            "width": "30px !important",
                            "height": "30px !important"
                        }
                        $("#js-img-zoom-closer").css(closer_css);

                        $("#js-img-zoom-closer").click(function () {
                            $("#js-img-zoom").remove();
                        });
                    }
                });




            }
        });
    }

    function AllowEscape() {
        $("body").off('click.closemodalbutton').on('click.closemodalbutton', '.js-modal-window .modal-close-button', function (e) {
            e.preventDefault();
            HideModal();
            if (typeof hiddenCallback == 'function') {
                hiddenCallback.call(this_modal_window);
            }
        });

        $("body").off('click.closemodalmask').on('click.closemodalmask', "#js-modal-window-mask", function (e) {
            e.preventDefault();
            HideModal();
            if (typeof hiddenCallback == 'function') {
                hiddenCallback.call(this_modal_window);
            }
        });
    }

    function HideModal() {
        clearTimeout(timeout);
        if ($("#js-modal-countdown") != null)
            $("#js-modal-countdown").remove();

        if (current_options.mask_class != "") {
            var classes = current_options.mask_class.toString().split(' ');
            $.each(classes, function (index, value) {
                $("#js-modal-window-mask").removeClass(value);
            });
        }

        $('#js-modal-window-mask, .js-modal-window:visible').hide();
        $('#js-modal-window-mask, #js-modal-window-closer').remove();

        if (current_options.modal_class != "") {
            var classes = current_options.modal_class.toString().split(' ');
            $.each(classes, function (index, value) {
                $(".js-modal-window").removeClass(value);
            });
        }

        $(this_modal_window).removeClass("js-modal-window");

        if (current_options.redirect_close_url != "") {
            window.location = current_options.redirect_close_url;
        }

        $(window).off("scroll.modal");

        if (current_options.prependToBody) {
            //$(this_modal_window).remove();
        }

        //$("#js-modal-window").remove();

        //$(".js-modal-window").remove();

        /*this_modal_window = null;
        imgHeight = null;
        imgCSS = null;
        imgRatio = null;
        countdown = null;
        timeout = null;
        current_options = null;
        lastScrollTop = 0;
        currentScrollTop = 0;
        lastScrollLeft = 0;
        currentScrollLeft = 0;
        hiddenCallback;
        initialWidth = 0;
        initialHeight = 0;
        scrollV = false;
        scrollH = false;*/

        /*TODO: make these the initial values*/
        //$("body").height("auto");
        //$("body").width("auto");
    }

    function AddCloser() {
        if (current_options.show_close == true && current_options.allow_escape == true) {
            $("#js-modal-window-closer").remove();
            $(this_modal_window).append("<img id='js-modal-window-closer' class='modal-close-button' src='" + current_options.close_img + "' />");

            var closer_css = {
                "position": "absolute",
                "top": "-15px",
                "right": "-15px",
                "cursor": "pointer",
                "width": "30px !important",
                "height": "30px !important"
            }
            $("#js-modal-window-closer").css(closer_css);
        }

        if (current_options.allow_escape == true) {
            AllowEscape();
        }
    }

    function AttachEvents() {
        $("body").off('keyup.modal').on('keyup.modal', function (e) {
            if (e.which === 13) {
                if (current_options.default_button !== null) {
                    //e.preventDefault();

                    if (current_options.default_button_causes_close) {
                        HideModal();
                    }

                    if ($(current_options.default_button).type === 'submit' || $(current_options.default_button).type === 'button') {
                        $(current_options.default_button).click();
                    }
                    else {
                        eval($(current_options.default_button).href);
                    }
                }
            }
            else if (e.which === 27) {
                HideModal();
                if (typeof hiddenCallback == 'function') {
                    hiddenCallback.call(this_modal_window);
                }
            }
        });
        $(window).off("resize.modal").on("resize.modal", function (e) {
            var winH = $(window).height();
            var winW = $(window).width();

            if (current_options.attach_location == "") {
		if(current_options.resize_animation){
			$(this_modal_window).stop().animate({
			    top: winH / 2 - $(this_modal_window).outerHeight() / 2,
			    left: winW / 2 - $(this_modal_window).outerWidth() / 2
			}, 200, null);
		}
		else{
			$(this_modal_window).css({ top: winH / 2 - $(this_modal_window).outerHeight() / 2,
			    left: winW / 2 - $(this_modal_window).outerWidth() / 2
			});
		}
            }
            else if (current_options.attach_location === "top" || current_options.attach_location === "bottom") {

                $(this_modal_window).stop().animate({
                    left: winW / 2 - $(this_modal_window).outerWidth() / 2
                }, 200, null);

            }
            else { //left or right

                $(this_modal_window).stop().animate({
                    top: winH / 2 - $(this_modal_window).outerHeight() / 2
                }, 200, null);

            }

            if ($(this_modal_window).outerHeight() > winH) {
                //taller than the window
                origOffsetTop = $(document).scrollTop();
                if (current_options.show_close) {
                    $(this_modal_window).css('top', 30);
                }
                else {
                    $(this_modal_window).css('top', 0);
                }

                $(window).off("scroll.modal").on("scroll.modal", function (e) {
                    $(this_modal_window).css('top', -$(document).scrollTop() + origOffsetTop);
                });
            }

            if ($(this_modal_window).outerWidth() > winW) {
                //wider than the window
                //console.log("too wide");
            }


            if ($("body").height() > winH)
                $('#js-modal-window-mask').css('height', $("body").height());
            else
                $('#js-modal-window-mask').css('height', winH);

            if ($("body").width() > winW)
                $('#js-modal-window-mask').css('width', $("body").width());
            else
                $('#js-modal-window-mask').css('width', winW);
        });
    }

    var imgHeight;
    var imgCSS;
    var imgRatio;
    var countdown;
    var timeout;
    var this_modal_window;
    var current_options;
    var lastScrollTop = 0;
    var currentScrollTop = 0;
    var lastScrollLeft = 0;
    var currentScrollLeft = 0;
    var hiddenCallback;
    var initialWidth = 0;
    var initialHeight = 0;
    var scrollV = false;
    var scrollH = false;
    var origOffsetTop;
    var origOffsetLeft;
    $.fn.modal = function (method) {

        AttachEvents();

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.modal');
        }

    };
})(jQuery);
