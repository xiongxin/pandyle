var $carousels = [];

jQuery.fn.carousel = function() {
    var id = this.data('id');
    if (id != undefined) {
        if (!$carousels[id]) {
            $carousels[id] = new Pandyle.Carousel(this);
        }
        return $carousels[id];
    } else {
        return new Pandyle.Carousel(this);
    }
}

Pandyle.Carousel = function(element) {
    var width = $(element).width();
    var duration = $(element).data('timing') ? $(element).data('timing') : 500;
    var afterSlide = [];

    function current() {
        return $(element).find('.inner>.active');
    }

    function prev() {
        return current().prev();
    }

    function next() {
        return current().next();
    }

    function items() {
        return $(element).find('.inner>*');
    }

    this.prev = prev;
    this.active = current;
    this.next = next;

    this.slidePrev = function() {
        if (items().length < 2) {
            return;
        }
        var temp_current = current();
        var temp_prev = prev();
        var temp_next = next();
        if (temp_prev.index() < 0) {
            $(element).children('.inner').animate({ scrollLeft: 0 }, duration);
            return;
        }
        $(element).children('.inner').animate({ scrollLeft: temp_prev.index() * width + 'px' }, duration, function() {
            temp_current.removeClass('active');
            if (temp_prev.index() == 0) {
                if ($(element).hasClass('noCycle')) {
                    temp_current.addClass('active');
                } else {
                    items().last().prev().addClass('active');
                    $(element).children('.inner').scrollLeft((items().length - 2) * width);
                }
            } else {
                temp_prev.addClass('active');
            }
            afterSlide.forEach(function(handler) {
                handler.apply(this);
            })
        })
    }

    this.slideNext = function() {
        if (items().length < 2) {
            return;
        }
        var temp_current = current();
        var temp_prev = prev();
        var temp_next = next();
        if (temp_next.index() < 0) {
            $(element).children('.inner').animate({ scrollLeft: temp_current.index() * width + 'px' }, duration);
            return;
        }
        $(element).children('.inner').animate({ scrollLeft: temp_next.index() * width + 'px' }, duration, function() {
            temp_current.removeClass('active');
            if (temp_next.index() == items().length - 1) {
                if ($(element).hasClass('noCycle')) {
                    temp_next.addClass('active');
                } else {
                    items().first().next().addClass('active');
                    $(element).children('.inner').scrollLeft(width);
                }
            } else {
                temp_next.addClass('active');
            }
            afterSlide.forEach(function(handler) {
                handler.apply(this);
            })
        })
    }

    this.afterSlide = function(handler) {
        afterSlide.push(handler);
    }
}

Pandyle.initCarousel = function() {
    $('.carousel').each(function(index, ele) {
        var carousel = $(ele).carousel();
        initDom(index, ele, carousel);
        initTouch(ele, carousel);
    })

    function initDom(index, ele, carousel) {
        if (!$(ele).data('id')) {
            $(ele).data('id', index);
        }

        $(ele).addClass('flex').addClass('slide');
        var itemNum = $(ele).children(':not(.layer)').length;
        if (itemNum < 2) {
            return;
        }

        if (!$(ele).hasClass('noCycle')) {
            var first = $(ele).children(':not(.layer)').first();
            var last = $(ele).children(':not(.layer)').last();
            $(ele).prepend(last.prop('outerHTML')).append(first.prop('outerHTML'));
        }

        if ($(ele).children('.active').length < 1) {
            if ($(ele).hasClass('noCycle')) {
                $(ele).children(':not(.layer)').first().addClass('active');
            } else {
                $(ele).children(':not(.layer)').first().next().addClass('active');
            }
        }

        $(ele).children(':not(.layer)').wrapAll('<div class="inner"></div>');
        $(ele).children('.inner').addClass('flex').addClass('slide');

        if (!$(ele).hasClass('noCycle')) {
            $(ele).children('.inner').scrollLeft($(ele).width());
        }

        if ($(ele).hasClass('hasIndicator')) {
            if ($(ele).find('.indicator').length < 1) {
                if ($(ele).children('.layer').length < 1) {
                    $(ele).append('<div class="layer"></div>');
                }
                $(ele).children('.layer').append('<div class="indicator"></div>');
                var indicatorDom = '';
                for (var i = 0; i < itemNum; i++) {
                    indicatorDom += '<i></i>';
                }
                $(ele).find('.indicator').html(indicatorDom);
            }
        }
        initIndicator(ele, carousel, itemNum);
    }

    function initIndicator(ele, carousel, itemNum) {
        if ($(ele).find('.indicator').length > 0) {
            var indicators = $(ele).find('.indicator').children();
            if (!indicators.hasClass('active')) {
                var index = $(ele).find('.inner>*').index('.active');
                if (index < 0) {
                    $(indicators[0]).addClass('active');
                } else {
                    $(indicators[index]).addClass('active');
                }
            }
            carousel.afterSlide(function() {
                var index = $(ele).find('.inner>*').index(carousel.active());
                indicators.removeClass('active');
                if (itemNum == 2) {
                    $(indicators[index % 2]).addClass('active');
                } else {
                    $(indicators[index]).addClass('active');
                }
            });
        }
    }

    function initTouch(ele, carousel) {
        var currentX = 0;
        var startX = 0;
        var width = $(ele).width();
        var startLeft = 0;
        var touchFlag = true;
        var moveFlag = false;
        var endFlag = false;
        carousel.afterSlide(function() {
            touchFlag = true;
        });
        $(ele).children('.inner').on('touchstart', function(e) {
            if (!touchFlag) {
                e.preventDefault();
                return;
            }
            touchFlag = false;
            var x = e.targetTouches[0].clientX;
            startX = currentX = x;
            startLeft = $(ele).children('.inner').scrollLeft();
            moveFlag = true;
        });
        $(ele).children('.inner').on('touchmove', function(e) {
            if (!moveFlag) {
                e.preventDefault();
                return;
            }
            currentX = e.targetTouches[0].clientX;
            var delta = startX - currentX;
            $(ele).children('.inner').scrollLeft(startLeft + delta);
            endFlag = true;
            e.preventDefault();
        });
        $(ele).children('.inner').on('touchend', function(e) {
            moveFlag = false;
            if (!endFlag) {
                touchFlag = true;
                e.preventDefault();
                return;
            }
            endFlag = false;
            if (currentX - 5 > startX) {
                carousel.slidePrev();
            } else if (currentX + 5 < startX) {
                carousel.slideNext();
            } else {
                touchFlag = true;
            }
        });
    }
}

$(document).ready(function() {
    Pandyle.initCarousel();
})