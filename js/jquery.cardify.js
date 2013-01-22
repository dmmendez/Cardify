// jquery.cardify.js

(function ($) {

    $.cardify = function (element, options) {

        var defaults = {
            'numLines'   : 14,
            'chars'      : 70,
            'className'  : 'threebyfive',
            'pageBreak'  : 1,
            'masthead'   : '%p of %n'
        }

        var cardify = this;

        cardify.settings = {};
        cardify.currentCard = undefined;        

        var $element = $(element),
             element = element,
            $container = $('<div />'),
            $elements = $element.contents().filter(function () {
                            var validNodes = ['p','ul','ol','h1','h2','h3','h4'];
                            return this.nodeType == 3 || validNodes.indexOf(this.nodeName.toLowerCase()) > -1;
                        });

        cardify.init = function () {
            cardify.lineCount = 0;
            cardify.settings = $.extend({}, defaults, options);
            cardify.cardCount = 0;

            $container.addClass(cardify.settings['className']);
            $element.after($container);

            createCard();

            $elements.each(parseElements);

            $container.children().each(addMasthead);

            $container
                .children(':nth-child(' + cardify.settings.pageBreak + 'n+1)')
                .addClass('page-break')
                .first().removeClass('page-break');
        };

        cardify.refresh = function (newopts) {
            cardify.settings = {};
            options = newopts;
            $container.empty().removeClass();
            cardify.init();
        }

        function addMasthead(i) {
            var $masthead = $('<div class="masthead" />');        
            var mastheadTemplate = cardify.settings.masthead;

            if ( typeof mastheadTemplate == "object" ) {
                if ( mastheadTemplate[i] ) {
                    mastheadTemplate = mastheadTemplate[i];
                } else {
                    mastheadTemplate = mastheadTemplate[mastheadTemplate.length - 1];
                }
            }

            mastheadTemplate = mastheadTemplate.replace("%p", i+1);
            mastheadTemplate = mastheadTemplate.replace("%n", cardify.cardCount);

            $masthead.html(mastheadTemplate);
            $(this).append($masthead);
        }

        function increaseLineCount() {

            if (cardify.lineCount % cardify.settings.numLines == (cardify.settings.numLines - 1))
                createCard();

            cardify.lineCount++;
        }

        function parseElements(i) {

            var nodeName = this.nodeName.toLowerCase();

            var parseLines = function (text, pre, post) {
                var lines = wordwrap(text);
                pre = pre || '';
                post = post || '';

                var formatLine = function (l) {
                    cardify.currentCard.append(pre + this + post + '<br />');
                    increaseLineCount();
                };

                if ( lines && lines != null)
                    $.each(lines, formatLine);
            };

            switch (nodeName) {

                case "ul":
                    $(this).find('li').each(function () {
                        parseLines($(this).text())
                    });
                    cardify.currentCard.append('<br />');
                    increaseLineCount();        
                    break;

                case "#text":
                    parseLines(this.nodeValue);
                    break;

                case "p":
                case "div":
                    parseLines($(this).text())
                    cardify.currentCard.append('<br />');
                    increaseLineCount();        
                    break;

                case "h4":
                case "h3":
                case "h2":
                case "h1":
                    parseLines($(this).text(), '<strong>', '</strong>');
                    cardify.currentCard.append('<br />');
                    increaseLineCount();        
                    break;

            }
        };


        function createCard() {
            var $card = $('<div class="cardify-card" />');
            cardify.currentCard = $card;
            $container.append($card);
            cardify.cardCount++;
        }

        function wordwrap(str, width, cut) {
            width = width || cardify.settings.chars || 75;
            cut = cut || false;

            if (!str) { return str; }

            var regex = '.{1,' + width + '}(\\s|$)' + (cut ? '|.{' + width + '}|.+$' : '|\\S+?(\\s|$)');

            return str.match(RegExp(regex, 'g'));
        }

        cardify.init();

    }

    $.fn.cardify = function (options) {

        return this.each(function () {
            if (undefined == $(this).data('cardify')) {
                var cardify = new $.cardify(this, options);
                $(this).data('cardify', cardify);
            }
        });

    }



})(jQuery);

