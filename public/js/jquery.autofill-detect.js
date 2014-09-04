(function ($) {
    $.fn.listenForChange = function (options) {
        settings = $.extend({
            interval: 200 // in microseconds
        }, options);

        var jquery_object = this.filter(":input").add(":input", this)
.filter('[type="text"],[type="radio"],[type="checkbox"],[type="file"],select,textarea');
        var current_focus = null;

        jquery_object
.focus(function () {
    current_focus = this;
})
.blur(function () {
    current_focus = null;
})
.change(function () {
    var element = $(this),
elementValue = ((this.type == 'checkbox' || this.type == 'radio') && this.checked == false) ? null : element.val();
    element.data('change_listener', elementValue);
});

        setInterval(function () {
            jquery_object.each(function () {
                var element = $(this),
elementValue = ((this.type == 'checkbox' || this.type == 'radio') && this.checked == false) ? null : element.val();
                // set data cache on element to input value if not yet set
                if (element.data('change_listener') == undefined) {
                    element.data('change_listener', elementValue);
                    return;
                }
                // return if the value matches the cache
                if (element.data('change_listener') == elementValue) {
                    return;
                }
                // ignore if element is in focus (since change event will fire on blur)
                if (this == current_focus) {
                    return;
                }
                // if we make it here, manually fire the change event, which will set the new value
                element.trigger('change');
            });
        }, settings.interval);
        return this;
    };
})(jQuery);