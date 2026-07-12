(function () {
    'use strict';

    var PLUGIN_NAME = 'russian_catalog';
    var DATA_URL =
        'https://mnml38.github.io/lampa-russian/data/online-now.json';

    if (window[PLUGIN_NAME + '_ready']) return;
    window[PLUGIN_NAME + '_ready'] = true;

    function formatDate(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    }

    function dateDaysAgo(days) {
        var date = new Date();
        date.setDate(date.getDate() - days);
        return formatDate(date);
    }

    function today() {
        return formatDate(new Date());
    }

function requestTmdb(url, params) {
    return new Promise(function (resolve) {
        var query = [];

        params = params || {};

        Object.keys(params).forEach(function (key) {
            if (
                params[key] !== undefined &&
                params[key] !== null &&
                params[key] !== ''
            ) {
                query.push(
                    encodeURIComponent(key) +
                    '=' +
                    encodeURIComponent(params[key])
                );
            }
        });

        var fullUrl = url;

        if (query.length) {
            fullUrl += '?' + query.join('&');
        }

        console.log('[Russian Catalog] TMDB:', fullUrl);

        Lampa.Api.list(
            {
                source: 'tmdb',
                url: fullUrl
            },
            function (data) {
                resolve(data || {});
            },
            function (error) {
                console.log(
                    '[Russian Catalog] TMDB request failed:',
                    fullUrl,
                    error
                );

                resolve({});
            }
        );
    });
}

    function requestJson(url) {
        return new Promise(function (resolve) {
            var network = new Lampa.Reguest();

            network.silent(
                url + '?v=' + Date.now(),
                function (data) {
                    resolve(data || {});
                },
                function () {
                    resolve({});
                }
            );
        });
    }

    function normalizeCards(items, mediaType) {
        return (items || []).map(function (item) {
            item.media_type = item.media_type || mediaType;

            /*
             * Lampa обычно сама понимает фильм это или сериал,
             * но эти поля помогают корректно открывать карточку.
             */
            if (mediaType === 'tv') {
                item.name = item.name || item.title;
                item.title = item.title || item.name;
            }

            return item;
        });
    }

    function loadManualOnlineNow() {
        return requestJson(DATA_URL).then(function (catalog) {
            var ids = catalog.items || [];

            if (!ids.length) return [];

            var requests = ids.map(function (id) {
                return requestTmdb('tv/' + id, {
                    language: 'ru-RU'
                });
            });

            return Promise.all(requests).then(function (items) {
                return normalizeCards(
                    items.filter(function (item) {
                        return item && item.id;
                    }),
                    'tv'
                );
            });
        });
    }

    function loadCurrentSeries() {
        return requestTmdb('discover/tv', {
            language: 'ru-RU',
            with_origin_country: 'RU',
            with_original_language: 'ru',
            'air_date.gte': dateDaysAgo(60),
            'air_date.lte': today(),
            'vote_count.gte': 10,
            sort_by: 'popularity.desc',
            page: 1
        }).then(function (data) {
            return normalizeCards(data.results, 'tv').slice(0, 20);
        });
    }

    function loadPopularSeries() {
        return requestTmdb('discover/tv', {
            language: 'ru-RU',
            with_origin_country: 'RU',
            with_original_language: 'ru',
            'vote_count.gte': 30,
            sort_by: 'popularity.desc',
            page: 1
        }).then(function (data) {
            return normalizeCards(data.results, 'tv').slice(0, 20);
        });
    }

    function loadNewMovies() {
        return requestTmdb('discover/movie', {
            language: 'ru-RU',
            with_origin_country: 'RU',
            with_original_language: 'ru',
            'primary_release_date.gte': dateDaysAgo(365),
            'primary_release_date.lte': today(),
            'vote_count.gte': 5,
            sort_by: 'primary_release_date.desc',
            page: 1
        }).then(function (data) {
            return normalizeCards(data.results, 'movie').slice(0, 20);
        });
    }

    function loadPopularMovies() {
        return requestTmdb('discover/movie', {
            language: 'ru-RU',
            with_origin_country: 'RU',
            with_original_language: 'ru',
            'vote_count.gte': 30,
            sort_by: 'popularity.desc',
            page: 1
        }).then(function (data) {
            return normalizeCards(data.results, 'movie').slice(0, 20);
        });
    }

    function RussianCatalog(object) {
        var component = new Lampa.InteractionMain(object);

        component.create = function () {
            var self = this;

            this.activity.loader(true);

            Promise.all([
                loadManualOnlineNow(),
                loadCurrentSeries(),
                loadPopularSeries(),
                loadNewMovies(),
                loadPopularMovies()
            ])
                .then(function (result) {
                    var manual = result[0];
                    var current = result[1];
                    var popularSeries = result[2];
                    var newMovies = result[3];
                    var popularMovies = result[4];

                    /*
                     * Пока ручной список пустой, верхняя лента
                     * автоматически заполняется свежими сериалами.
                     */
                    var top = manual.length ? manual : current;

                    var rows = [
                        {
                            title: '🔥 Сейчас в онлайн-кинотеатрах',
                            results: top
                        },
                        {
                            title: 'Новые серии',
                            results: current
                        },
                        {
                            title: 'Популярные российские сериалы',
                            results: popularSeries
                        },
                        {
                            title: 'Новые российские фильмы',
                            results: newMovies
                        },
                        {
                            title: 'Популярные российские фильмы',
                            results: popularMovies
                        }
                    ];

                    rows = rows.filter(function (row) {
    return row.results && row.results.length;
});

console.log('[Russian Catalog] Rows:', rows);

if (rows.length) {
    self.build(rows);
} else {
    self.empty();
}

self.activity.loader(false);
self.activity.toggle();

            return this.render();
        };

        return component;
    }

function openCatalog() {
    Lampa.Activity.push({
        title: 'Русское кино',
        component: PLUGIN_NAME,
        page: 1
    });
}

    function addMenuButton() {
        if ($('.menu__item.' + PLUGIN_NAME + '_menu').length) return;

        var button = $(
            '<li class="menu__item selector ' + PLUGIN_NAME + '_menu">' +
                '<div class="menu__ico">' +
                    '<svg viewBox="0 0 24 24">' +
                        '<path fill="currentColor" ' +
                        'd="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4' +
                        'c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2m0 2v12h16V6H4' +
                        'm2 2h3v3H6V8m5 0h3v3h-3V8m5 0h2v3h-2V8m-10 5' +
                        'h3v3H6v-3m5 0h3v3h-3v-3m5 0h2v3h-2v-3z"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu__text">Русское кино</div>' +
            '</li>'
        );

        button.on('hover:enter', openCatalog);

        $('.menu .menu__list').eq(0).append(button);
    }

    function startPlugin() {
        Lampa.Component.add(PLUGIN_NAME, RussianCatalog);

        addMenuButton();

        setTimeout(addMenuButton, 1000);
        setTimeout(addMenuButton, 3000);

        console.log('[Russian Catalog] Plugin started');
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') startPlugin();
        });
    }
})();
