(function () {
    'use strict';

    var PLUGIN_NAME = 'russian_catalog';
    var COMPONENT_NAME = 'russian_online_top';
    var DATA_URL =
        'https://mnml38.github.io/lampa-russian/data/online-now.json';

    if (window[PLUGIN_NAME + '_ready']) return;
    window[PLUGIN_NAME + '_ready'] = true;

    function loadJson(url, success, error) {
        var network = new Lampa.Reguest();

        network.timeout(15000);

        network.silent(
            url + '?v=' + Date.now(),
            function (data) {
                success(data || {});
            },
            function () {
                error();
            }
        );
    }

    function openStandardCard(item) {
        /*
         * Открываем стандартный поиск Lampa.
         * Первый результат обычно будет нужным сериалом,
         * а затем открывается обычная карточка Lampa.
         */
        Lampa.Activity.push({
            url: '',
            title: 'Поиск: ' + item.title,
            component: 'search',
            search: item.title,
            page: 1
        });
    }

    function ManualTopComponent(object) {
        var comp = new Lampa.InteractionCategory(object);

        comp.create = function () {
            return comp.render();
        };

        comp.initialize = function () {
            comp.loading(true);

            loadJson(
                DATA_URL,
                function (catalog) {
                    var sourceItems = catalog.items || [];

                    if (!sourceItems.length) {
                        comp.loading(false);
                        comp.empty('Список пока не заполнен');
                        return;
                    }

                    var cards = sourceItems.map(function (item) {
                        return {
                            id: item.id,
                            tmdb_id: item.id,
                            title: item.title,
                            name: item.title,
                            original_title: item.title,
                            original_name: item.title,
                            media_type: 'tv',
                            service: item.service || '',
                            subtitle: item.service
                                ? 'Сейчас на ' + item.service
                                : 'Сейчас выходит'
                        };
                    });

                    comp.loading(false);

                    comp.build({
                        results: cards,
                        collection: true,
                        total_pages: 1
                    });
                },
                function () {
                    comp.loading(false);
                    comp.empty('Не удалось загрузить подборку');
                }
            );
        };

        comp.cardRender = function (object, element, card) {
            card.onEnter = function () {
                openStandardCard(element);
            };
        };

        return comp;
    }

    function openCatalog() {
        Lampa.Activity.push({
            title: 'Сейчас в онлайн-кинотеатрах',
            component: COMPONENT_NAME,
            page: 1
        });
    }

    function addMenuButton() {
        if ($('.russian-catalog-menu').length) return;

        var button = $(
            '<li class="menu__item selector russian-catalog-menu">' +
                '<div class="menu__ico">' +
                    '<svg viewBox="0 0 24 24">' +
                        '<path fill="currentColor" d="' +
                            'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4' +
                            'c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2m0 2v12h16V6H4' +
                            'm2 2h3v3H6V8m5 0h3v3h-3V8m5 0h2v3h-2V8' +
                            'm-10 5h3v3H6v-3m5 0h3v3h-3v-3m5 0h2v3h-2v-3z' +
                        '"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu__text">Русское кино</div>' +
            '</li>'
        );

        button.on('hover:enter', openCatalog);

        $('.menu .menu__list').eq(0).append(button);
    }

    function startPlugin() {
        Lampa.Component.add(COMPONENT_NAME, ManualTopComponent);

        addMenuButton();

        setTimeout(addMenuButton, 1000);
        setTimeout(addMenuButton, 3000);

        console.log('[Russian Catalog] manual top started');
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }
})();
