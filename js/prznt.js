(function() {
    var root = this;
    var $ = root.jQuery;

    /**
     * Конструктор движка презентации
     *
     * @param {String} data Адрес ресурса, отдающего json с контентом презентации
     * @param {{
     *      slides: {String},
     *      currentPage: {String},
     *      counter: {String},
     *      tocObj: {}
     *  }} [options] Дополнительные параметры
     * @constructor
     * @return Prznt
     */
    root.Prznt = function(data, options) {
        var currentSlide = 0,
            count = 0,
            $slides = (options && options.slides) ? $(options.slides) : $('.slides'),
            $currentPage = (options && options.currentPage) ? $(options.currentPage) : $('.pager').find('.current'),
            $counter = (options && options.counter) ? $(options.counter) : $('.pager').find('.total'),
            toc = (options && options.tocObj) ? options.tocObj : {
                box: $('.toc-box'),
                list: $('.toc'),
                closer: $('.toc-box').find('.closer')
            },
            init,
            next,
            prev,
            go,
            generateToc,
            toggleTOC;

        /**
         * Инициализация презентации
         *
         * Вызов без параметров вызывает запрос за объектом со слайдами и передачу его в init() для построение html
         * @param {*} [res] Объект, содержащий слайды презентации
         * @return {*}
         */
        init = function(res) {
            var self = this;

            if (typeof res === 'undefined') {
                $.get(data, function(res){
                    self.init(res.slides);
                });
            } else {
                count = res.length;
                $counter.text(count);

                res.forEach(parseSlide, $slides);
                res.forEach(generateToc);

                go();
            }

            return self;
        };

        /**
         * Построение оглавления на основе списка слайдов
         *
         * @param el
         * @param index
         * @param arr
         */
        generateToc = function (el, index, arr) {
            $("<li></li>")
                .text(el.title)
                .on('click', function (e) {
                    currentSlide = index;
                    go();
                    toggleTOC();
                    return false;
                })
                .appendTo(toc.list);
        };

        /**
         * Переключение видимости оглавления
         *
         * @return {boolean}
         */
        toggleTOC = function() {
            toc.box.toggleClass('toc-box-hidden');
            return false;
        };

        /**
         * Переход к следующему слайду
         */
        next = function() {
            if (currentSlide === (count - 1)) {
                return;
            }

            currentSlide ++;
            go();
        };

        /**
         * Переход к предыдущему слайду
         */
        prev = function() {
            if (currentSlide === 0) {
                return;
            }

            currentSlide --;
            go();
        };

        /**
         * Обновление счётчика и хеша страницы
         */
        go = function() {
            root.location = location.pathname + '#' + $slides.children().eq(currentSlide).attr('id');

            $currentPage.text(currentSlide + 1);
        };

        toc.closer.on('click', toggleTOC);

        this.init = init;
        this.next = next;
        this.prev = prev;
        this.toggleTOC = toggleTOC;
    };

    /**
     * Преобразование обекта слайда в html-дерево
     *
     * @param {Object} el
     * @param {Number} index
     * @param {Array} [arr]
     */
    function parseSlide(el, index, arr) {
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
                    var $list = $("<ol />");

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
    }
}).call(window);
