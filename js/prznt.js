var PRZNT = {};

PRZNT.init = function () {
    this.slides = $('.slide');
    this.currentSlide = 0;
    this.page_number = $('.page-number');
    this.toc = {
        box: $('.toc-box'),
        list: $('.toc'),
        closer: $('.toc-box .closer')
    };

    $('.pages-count').text(this.slides.length);

    this.toc.closer.click(this.toggleTOC);

    for (var i=0, l=this.slides.length; i<l; i++) {
        $("<li></li>")
        .text(PRZNT.slides[i].dataset.title)
        .click(function (e) {
            PRZNT.currentSlide = $(e.target).index();
            PRZNT.go();
            PRZNT.toggleTOC();
            return false;
        })
        .appendTo(this.toc.list);
    }


    $(document).keyup(function(e) {
        switch (e.keyCode) {
            case 39:
            case 40:
                PRZNT.next();
                break;

            case 37:
            case 38:
                PRZNT.prev();
                break;
            case 32:
            case 76:
                PRZNT.toggleTOC();
                break;
        }
    });

    this.go();
};

PRZNT.next = function() {
    if(this.currentSlide === (this.slides.length - 1)) {
        return;
    }

    this.currentSlide ++;
    this.go();
};

PRZNT.prev = function() {
    if(this.currentSlide === 0) {
        return;
    }

    this.currentSlide --;
    this.go();
};

PRZNT.go = function() {
    location.hash = '#' + this.slides.eq(this.currentSlide).attr('id');

    this.page_number.text(this.currentSlide + 1);
};

PRZNT.toggleTOC = function() {
    PRZNT.toc.box.toggleClass('toc-box-hidden');
};

$(function() {
    PRZNT.init();
});
