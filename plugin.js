(function () {
    'use strict';

    var PLUGIN_NAME = 'russian_catalog';
    var COMPONENT_NAME = 'russian_online_top';
    var DATA_URL =
        'https://mnml38.github.io/lampa-russian/data/online-now.json';

    if (window[PLUGIN_NAME + '_ready']) return;
    window[PLUGIN_NAME + '_ready'] = true;

    function loadJson(url) {
        return new Promise(function (resolve, reject) {
            var network = new Lampa.Reguest();

            network.silent(
                url + '?v=' + Date.now(),
                function (data) {
                    resolve(data || {});
                },
                function (error) {
                    reject(error);
                }
            );
        });
    }

    function searchTmdb(title) {
        return new Promise(function (resolve) {
            Lampa.Api.sources.tmdb.get(
                'search/tv',
                {
                    query: title,
                    language: 'ru-RU',
                    page: 1
                },
                function (data) {
                    var results = data && data.results
                        ? data.results
                        : [];

                    resolve(results[0] || null);
                },
                function () {
                    resolve(null);
                }
            );
        });
    }

    function loadCards() {
        return loadJson(DATA_URL).then(function (catalog) {
            var items = catalog.items || [];

            return Promise.all(
                items.map(function (entry) {
                    return searchTmdb(entry.title).then(function (card) {
                        if (!card) return null;

                        card.media_type = 'tv';
                        card.title = card.name || entry.title;
                        card.name = card.name || entry.title;
                        card.service = entry.service || '';
                        card.online_service = entry.service || '';

                        return card;
                    });
                })
            );
        }).then(function (cards) {
            return cards.filter(function (card) {
                return card && card.id;
            });
        });
    }

    function ManualTopComponent(object) {
        var comp = new Lampa.InteractionCategory(object);

        comp.create = function () {
            var self = this;

            this.activity.loader(true);

            loadCards()
                .then(function (cards) {
                    console.log(
                        '[Russian Catalog] loaded cards:',
                        cards
                    );

                    if (!cards.length) {
                        self.empty(
                            'Не удалось найти сериалы в TMDB'
                        );
                        self.activity.loader(false);
                        return;
                    }

                    self.build({
                        results: cards,
                        page: 1,
                        total_pages: 1,
                        total_results: cards.length
                    });

                    self.activity.loader(false);
                    self.activity.toggle();
                })
                .catch(function (error) {
                    console.log(
                        '[Russian Catalog] load error:',
                        error
                    );

                    self.empty(
                        'Не удалось загрузить ручную подборку'
                    );

                    self.activity.loader(false);
                });

            return this.render();
        };

        comp.cardRender = function (object, element, card) {
            var originalEnter = card.onEnter;

            card.onEnter = function () {
                if (originalEnter) {
                    originalEnter();
                } else {
                    Lampa.Activity.push({
                        url: '',
                        component: 'full',
                        id: element.id,
                        method: 'tv',
                        card: element,
                        movie: element,
                        source: 'tmdb'
                    });
                }
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
        Lampa.Component.add(
            COMPONENT_NAME,
            ManualTopComponent
        );

        addMenuButton();

        setTimeout(addMenuButton, 1000);
        setTimeout(addMenuButton, 3000);

        console.log(
            '[Russian Catalog] manual top started'
        );
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
