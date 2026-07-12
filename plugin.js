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
    return loadJson(DATA_URL)
        .then(function (catalog) {
            var items = catalog.items || [];

            items.sort(function (a, b) {
                return (b.priority || 0) - (a.priority || 0);
            });

            return Promise.all(
                items.map(function (entry) {
                    return searchTmdb(entry.title).then(function (card) {
                        if (!card) return null;

                        card.media_type = 'tv';
                        card.method = 'tv';
                        card.source = 'tmdb';

                        card.title = card.name || entry.title;
                        card.name = card.name || entry.title;

                        card.original_title =
                            card.original_name ||
                            card.name ||
                            entry.title;

                        card.original_name =
                            card.original_name ||
                            card.name ||
                            entry.title;

                        card.online_service = entry.service || '';
                        card.service = entry.service || '';
                        card.priority = entry.priority || 0;

                        /*
                         * Подзаголовок может отображаться не во всех
                         * версиях и темах Lampa, но данные сохраняем.
                         */
                        card.subtitle = entry.service
                            ? 'Сейчас на ' + entry.service
                            : 'Сейчас выходит';

                        return card;
                    });
                })
            );
        })
        .then(function (cards) {
            return cards.filter(function (card) {
                return card && card.id;
            });
        });
}

            return Promise.all(
                items.map(function (entry) {
                    return searchTmdb(entry.title).then(function (card) {
                        if (!card) return null;

                        card.media_type = 'tv';
card.method = 'tv';
card.source = 'tmdb';

card.title = card.name || entry.title;
card.name = card.name || entry.title;

card.original_title =
    card.original_name ||
    card.name ||
    entry.title;

card.original_name =
    card.original_name ||
    card.name ||
    entry.title;
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

        return comp;
    }

    function openManualTop() {
    Lampa.Activity.push({
        title: 'Сейчас в онлайн-кинотеатрах',
        component: COMPONENT_NAME,
        page: 1
    });
}

function openTmdbCategory(title, url) {
    Lampa.Activity.push({
        title: title,
        component: 'category_full',
        source: 'tmdb',
        url: url,
        page: 1
    });
}

function openNewSeries() {
    var now = new Date();
    var from = new Date();

    from.setDate(now.getDate() - 90);

    function dateString(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    }

    openTmdbCategory(
        'Новые российские сериалы',
        'discover/tv' +
            '?with_origin_country=RU' +
            '&with_original_language=ru' +
            '&air_date.gte=' + dateString(from) +
            '&air_date.lte=' + dateString(now) +
            '&sort_by=popularity.desc'
    );
}

function openNewMovies() {
    var now = new Date();
    var from = new Date();

    from.setFullYear(now.getFullYear() - 1);

    function dateString(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    }

    openTmdbCategory(
        'Новые российские фильмы',
        'discover/movie' +
            '?with_origin_country=RU' +
            '&with_original_language=ru' +
            '&primary_release_date.gte=' + dateString(from) +
            '&primary_release_date.lte=' + dateString(now) +
            '&sort_by=primary_release_date.desc'
    );
}

function openPopularSeries() {
    openTmdbCategory(
        'Популярные российские сериалы',
        'discover/tv' +
            '?with_origin_country=RU' +
            '&with_original_language=ru' +
            '&vote_count.gte=20' +
            '&sort_by=popularity.desc'
    );
}

function openPopularMovies() {
    openTmdbCategory(
        'Популярные российские фильмы',
        'discover/movie' +
            '?with_origin_country=RU' +
            '&with_original_language=ru' +
            '&vote_count.gte=20' +
            '&sort_by=popularity.desc'
    );
}

function openSovietMovies() {
    openTmdbCategory(
        'Советское кино',
        'discover/movie' +
            '?with_origin_country=SU' +
            '&primary_release_date.gte=1922-01-01' +
            '&primary_release_date.lte=1991-12-31' +
            '&sort_by=vote_average.desc' +
            '&vote_count.gte=10'
    );
}

function RussianSections(object) {
    var scroll = new Lampa.Scroll({
        mask: true,
        over: true,
        step: 250
    });

    var html = $('<div class="russian-sections"></div>');

    var sections = [
        {
            title: '🔥 Сейчас в онлайн-кинотеатрах',
            action: openManualTop
        },
        {
            title: '📺 Новые сериалы',
            action: openNewSeries
        },
        {
            title: '🎬 Новые фильмы',
            action: openNewMovies
        },
        {
            title: '⭐ Популярные сериалы',
            action: openPopularSeries
        },
        {
            title: '⭐ Популярные фильмы',
            action: openPopularMovies
        },
        {
            title: 'Советское кино',
            action: openSovietMovies
        }
    ];

    sections.forEach(function (section) {
        var item = $(
            '<div class="settings-param selector russian-section">' +
                '<div class="settings-param__name">' +
                    section.title +
                '</div>' +
                '<div class="settings-param__value">›</div>' +
            '</div>'
        );

        item.on('hover:enter', section.action);
        html.append(item);
    });

    this.create = function () {
        scroll.render().append(html);

        setTimeout(function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(
                        scroll.render().find('.selector')
                    );

                    Lampa.Controller.collectionFocus(
                        false,
                        scroll.render()
                    );
                },

                up: function () {
                    Navigator.move('up');
                },

                down: function () {
                    Navigator.move('down');
                },

                right: function () {
                    Navigator.move('right');
                },

                left: function () {
                    Navigator.move('left');
                },

                back: function () {
                    Lampa.Activity.backward();
                }
            });

            Lampa.Controller.toggle('content');
        }, 100);

        return this.render();
    };

    this.render = function () {
        return scroll.render();
    };

    this.start = function () {
        Lampa.Controller.toggle('content');
    };

    this.pause = function () {};

    this.stop = function () {};

    this.destroy = function () {
        scroll.destroy();
        html.remove();
    };
}

function openCatalog() {
    Lampa.Activity.push({
        title: 'Русское кино',
        component: 'russian_sections',
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

    Lampa.Component.add(
        'russian_sections',
        RussianSections
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
    Lampa.Template.add(
    'russian_catalog_style',
    '<style>' +
        '.russian-sections{' +
            'padding:1.5em;' +
            'max-width:60em;' +
        '}' +

        '.russian-section{' +
            'display:flex;' +
            'align-items:center;' +
            'justify-content:space-between;' +
            'padding:1.1em 1.3em;' +
            'margin-bottom:.7em;' +
            'border-radius:.6em;' +
            'background:rgba(255,255,255,.08);' +
            'font-size:1.25em;' +
        '}' +

        '.russian-section.focus{' +
            'background:#fff;' +
            'color:#000;' +
        '}' +

        '.russian-section .settings-param__value{' +
            'font-size:1.5em;' +
            'opacity:.65;' +
        '}' +
    '</style>'
);

$('body').append(
    Lampa.Template.get('russian_catalog_style', {})
);
})();
