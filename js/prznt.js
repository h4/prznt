var PRZNT = {};

PRZNT.init = function (data) {
    var $body = $('.slides');

    data.forEach(this.parseSlide, $body);

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

PRZNT.parseSlide = function(el, index, arr) {
    var $slide = $('<slide class="slide" />'),
        $header = $('<hgroup />'),
        $body = $('<article />');

    $slide
        .attr("id", "slide_" + index)
        .attr("data-title", el.title);

    if (el.type) {
        $slide.addClass(el.type);
    }

    $header.append("<h1>" + el.title + "</h1>");

    if (el.subtitle) {
        $header.append("<h2>" + el.subtitle + "</h2>");
    }

    $slide.append($header);

    if (el.content) {
        switch (el.content.type) {
            case "image":
                $body.append($('<img />').attr("src", el.content.value));

                break;
            case "table":
                var $table = $("<table />"),
                    thead,
                    tbody;

                thead = el.content.value.head
                    .reduce(function (prev, el, index, arr) {
                        return prev + "<th>" + el + "</th>";
                    });

                tbody = el.content.value.body
                    .map(function(el){
                        return el.reduce(function(prev, el, index, arr) {
                            return prev + "<td>" + el + "</td>"
                        })
                    })
                    .reduce(function(prev, el, index, arr) {
                        return prev + "<tr>" + el + "</tr>";
                    });

                $table
                    .append("<thead><tr>" + thead + "</tr></thead>")
                    .append("<tbody>" + tbody + "</tbody>")
                    .appendTo($body);

                break;

            case "list":
                var $list = $("<ol />"),
                    str;

                $list.append(el.content.value
                    .map(function(el) {
                        return "<li>" + el + "</li>";
                    })
                    .reduce(function(prev, el, index, arr) {
                        return prev + el;
                    }))
                    .appendTo($body);

                break;
        }
        $slide.append($body);
    }

    this.append($slide);
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
    $.get('data.json', function(data){
        PRZNT.init(data.slides);
    });


});
