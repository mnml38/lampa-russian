(function () {
    'use strict';

    var PLUGIN_NAME = 'russian_catalog';
    var VERSION = '1.4.2';

    var SECTIONS_COMPONENT = 'russian_sections';
    var ONLINE_COMPONENT = 'russian_online_top';
    var MY_TORRENTS_COMPONENT = 'russian_my_torrents';
    var KINOPOISK_COMPONENT = 'russian_kinopoisk_catalog';
    var KINOPOISK_API_KEY = 'russian_kinopoisk_api_key';
    var TORRENT_SETTINGS_KEY = 'russian_torrent_server';
    var TORRENT_USERNAME_KEY = 'russian_torrent_username';
    var TORRENT_PASSWORD_KEY = 'russian_torrent_password';

    var KINOPOISK_API_URL =
        'https://kinopoiskapiunofficial.tech/api/v2.2/films';

    var ONLINE_DATA_URL =
        'https://mnml38.github.io/lampa-russian/data/online-now.json';

    var TORRENTS_DATA_URL =
        'https://mnml38.github.io/lampa-russian/data/my-torrents.json';

    /*
     * Адрес TorrServer можно заменить здесь или переопределить
     * через Lampa.Storage с ключом russian_torrent_server.
     */
    var DEFAULT_TORRENT_SERVER = 'http://185.139.68.151:8090';

    /*
     * ВАЖНО:
     * Файл должен находиться в репозитории по адресу:
     *
     * torrents/chikatilo.torrent
     */
    var MY_TORRENTS_FALLBACK = [
        {
            title: 'След Чикатило',
            original_title: 'След Чикатило',
            year: '2026',
            quality: 'WEBRip 2160p HEVC SDR',
            description: 'Сезон 1. Серии 1–8 из 8',
            poster:
                'https://via.placeholder.com/500x750.png?text=%D0%A1%D0%BB%D0%B5%D0%B4+%D0%A7%D0%B8%D0%BA%D0%B0%D1%82%D0%B8%D0%BB%D0%BE',
            torrent:
                'https://mnml38.github.io/lampa-russian/torrents/chikatilo.torrent'
        }
    ];

    if (window[PLUGIN_NAME + '_ready']) return;

    window[PLUGIN_NAME + '_ready'] = true;

    function showMessage(message) {
        if (window.Lampa && Lampa.Noty) {
            Lampa.Noty.show(message);
        } else {
            console.log('[Русское кино]', message);
        }
    }

    function addStyles() {
        if (document.getElementById('russian-catalog-style')) return;

        var style = document.createElement('style');

        style.id = 'russian-catalog-style';

        style.textContent =
            '.menu__item.russian-catalog-menu-item .menu__ico {' +
            'display:flex;' +
            'align-items:center;' +
            'justify-content:center;' +
            'font-size:1.3em;' +
            '}' +

            '.russian-catalog-section {' +
            'padding:1.5em;' +
            '}' +

            '.russian-catalog-section__title {' +
            'font-size:1.7em;' +
            'font-weight:600;' +
            'margin-bottom:1em;' +
            '}' +

            '.russian-catalog-list {' +
            'display:flex;' +
            'flex-direction:column;' +
            'gap:.7em;' +
            '}' +

            '.russian-catalog-row {' +
            'display:flex;' +
            'align-items:center;' +
            'padding:1em 1.2em;' +
            'border-radius:.7em;' +
            'background:rgba(255,255,255,.08);' +
            'transition:background .2s,transform .2s;' +
            '}' +

            '.russian-catalog-row.focus {' +
            'background:#fff;' +
            'color:#000;' +
            'transform:scale(1.02);' +
            '}' +

            '.russian-catalog-row__icon {' +
            'width:2.2em;' +
            'font-size:1.5em;' +
            'text-align:center;' +
            'margin-right:.7em;' +
            '}' +

            '.russian-catalog-row__name {' +
            'font-size:1.15em;' +
            'font-weight:500;' +
            '}' +

            '.russian-torrent-card__quality {' +
            'font-size:.85em;' +
            'opacity:.75;' +
            'margin-top:.3em;' +
            '}' +

            '.russian-catalog-poster {' +
            'width:3.2em;' +
            'height:4.6em;' +
            'object-fit:cover;' +
            'border-radius:.25em;' +
            'margin-right:.9em;' +
            'flex:0 0 auto;' +
            'background:rgba(255,255,255,.08);' +
            '}' +

            '.russian-catalog-item-info {' +
            'min-width:0;' +
            '}';

        document.head.appendChild(style);
    }

    function openActivity(component, title, extra) {
        var activity = {
            url: '',
            title: title,
            component: component,
            page: 1
        };

        if (extra) {
            Object.keys(extra).forEach(function (key) {
                activity[key] = extra[key];
            });
        }

        Lampa.Activity.push(activity);
    }

    function openSections() {
        openActivity(SECTIONS_COMPONENT, 'Русское кино');
    }

    function openOnlineNow() {
        openActivity(ONLINE_COMPONENT, 'Сейчас в онлайн-кинотеатрах');
    }

    function openMyTorrents() {
        openActivity(MY_TORRENTS_COMPONENT, 'Мои торренты');
    }

    function openKinopoiskCatalog(kind, title, page) {
        if (!getKinopoiskApiKey()) {
            showMessage('Сначала укажите API-ключ Кинопоиска');
            configureKinopoiskApi();
            return;
        }

        openActivity(KINOPOISK_COMPONENT, title, {
            catalog_kind: kind,
            page: page || 1
        });
    }

    function openNewSeries() {
        openKinopoiskCatalog('new_series', 'Новые российские сериалы');
    }

    function openNewMovies() {
        openKinopoiskCatalog('new_movies', 'Новые российские фильмы');
    }

    function openPopularSeries() {
        openKinopoiskCatalog('popular_series', 'Популярные российские сериалы');
    }

    function openPopularMovies() {
        openKinopoiskCatalog('popular_movies', 'Популярные российские фильмы');
    }

    function openSovietMovies() {
        openKinopoiskCatalog('soviet_movies', 'Советское кино');
    }

    function getKinopoiskApiKey() {
        try {
            if (Lampa.Storage && Lampa.Storage.get) {
                return String(Lampa.Storage.get(KINOPOISK_API_KEY, '') || '').trim();
            }
        } catch (error) {
            console.warn('[Русское кино] Не удалось прочитать API-ключ Кинопоиска', error);
        }

        return '';
    }

    function configureKinopoiskApi() {
        editTorrentSetting({
            title: 'API-ключ Кинопоиска Unofficial',
            value: getKinopoiskApiKey(),
            password: true
        }, function (apiKey) {
            if (Lampa.Storage && Lampa.Storage.set) {
                Lampa.Storage.set(KINOPOISK_API_KEY, String(apiKey || '').trim());
            }

            showMessage(apiKey ? 'API-ключ сохранён на этом устройстве' : 'API-ключ удалён');
        });
    }

    function buildKinopoiskUrl(kind, page) {
        var currentYear = new Date().getFullYear();
        var query = {
            countries: 34,
            type: 'FILM',
            order: 'RATING',
            ratingFrom: 1,
            ratingTo: 10,
            page: page || 1
        };

        if (kind === 'new_series' || kind === 'popular_series') {
            query.type = 'TV_SERIES';
        }

        if (kind === 'new_series' || kind === 'new_movies') {
            query.order = 'YEAR';
            query.yearFrom = currentYear - 1;
            query.yearTo = currentYear;
        }

        if (kind === 'soviet_movies') {
            query.yearFrom = 1920;
            query.yearTo = 1991;
        }

        if (kind === 'popular_series' || kind === 'popular_movies') {
            query.order = 'NUM_VOTE';
            query.ratingFrom = 6;
        }

        return KINOPOISK_API_URL + '?' + Object.keys(query).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
        }).join('&');
    }

    function getTorrentServer() {
        var server = DEFAULT_TORRENT_SERVER;

        try {
            if (Lampa.Storage && Lampa.Storage.get) {
                server = Lampa.Storage.get(
                    TORRENT_SETTINGS_KEY,
                    DEFAULT_TORRENT_SERVER
                );
            }
        } catch (error) {
            console.warn('[Русское кино] Не удалось прочитать адрес TorrServer', error);
        }

        return String(server || DEFAULT_TORRENT_SERVER).replace(/\/+$/, '');
    }

    function getTorrentCredentials() {
        var credentials = { username: '', password: '' };

        try {
            if (Lampa.Storage && Lampa.Storage.get) {
                credentials.username = String(
                    Lampa.Storage.get(TORRENT_USERNAME_KEY, '') || ''
                );
                credentials.password = String(
                    Lampa.Storage.get(TORRENT_PASSWORD_KEY, '') || ''
                );
            }
        } catch (error) {
            console.warn('[Русское кино] Не удалось прочитать данные TorrServer', error);
        }

        return credentials;
    }

    function getTorrentHeaders() {
        var headers = { 'Content-Type': 'application/json' };
        var credentials = getTorrentCredentials();

        if (credentials.username || credentials.password) {
            headers.Authorization = 'Basic ' + btoa(
                credentials.username + ':' + credentials.password
            );
        }

        return headers;
    }

    function getStreamServer() {
        var server = getTorrentServer();
        var credentials = getTorrentCredentials();

        if (!credentials.username && !credentials.password) {
            return server;
        }

        return server.replace(
            /^(https?:\/\/)/i,
            '$1' + encodeURIComponent(credentials.username) + ':' +
                encodeURIComponent(credentials.password) + '@'
        );
    }

    function editTorrentSetting(params, callback) {
        if (!Lampa.Input || !Lampa.Input.edit) {
            showMessage('В этой версии Lampa нет окна настройки');
            return;
        }

        Lampa.Input.edit({
            title: params.title,
            value: params.value || '',
            free: true,
            nosave: true,
            nomic: true,
            password: Boolean(params.password)
        }, callback);
    }

    function configureTorrentServer() {
        var credentials = getTorrentCredentials();

        editTorrentSetting({
            title: 'Адрес TorrServer',
            value: getTorrentServer()
        }, function (server) {
            if (Lampa.Storage && Lampa.Storage.set && server) {
                Lampa.Storage.set(
                    TORRENT_SETTINGS_KEY,
                    String(server).replace(/\/+$/, '')
                );
            }

            editTorrentSetting({
                title: 'Логин TorrServer (если нужен)',
                value: credentials.username
            }, function (username) {
                if (Lampa.Storage && Lampa.Storage.set) {
                    Lampa.Storage.set(TORRENT_USERNAME_KEY, username || '');
                }

                editTorrentSetting({
                    title: 'Пароль TorrServer (если нужен)',
                    value: credentials.password,
                    password: true
                }, function (password) {
                    if (Lampa.Storage && Lampa.Storage.set) {
                        Lampa.Storage.set(TORRENT_PASSWORD_KEY, password || '');
                    }

                    showMessage('Настройки TorrServer сохранены');
                });
            });
        });
    }

    function getTorrentSources(item) {
        var sources = [];

        if (Array.isArray(item.torrents)) {
            sources = item.torrents.map(function (source, index) {
                if (typeof source === 'string') {
                    return {
                        title: 'Сезон ' + (index + 1),
                        link: source
                    };
                }

                return {
                    title: source.title || source.name || ('Сезон ' + (index + 1)),
                    link: source.link || source.torrent || source.url
                };
            });
        }

        if (item.torrent) {
            sources.unshift({
                title: item.torrent_title || 'Торрент',
                link: item.torrent
            });
        }

        return sources.filter(function (source) {
            return source.link;
        });
    }

    function openTorrentSource(item, source) {
        openTorrent(item, source && source.link);
    }

    function chooseTorrentSource(item) {
        var sources = getTorrentSources(item);

        if (!sources.length) {
            showMessage('Для этого сериала не указана торрент-ссылка');
            return;
        }

        if (sources.length === 1) {
            openTorrentSource(item, sources[0]);
            return;
        }

        Lampa.Select.show({
            title: item.title + ' — выбрать сезон',
            items: sources.map(function (source) {
                return { title: source.title, source: source };
            }),
            onSelect: function (selected) {
                openTorrentSource(item, selected.source);
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
            }
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function parseTorrentsData(data) {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (error) {
                return [];
            }
        }

        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.items)) return data.items;
        if (data && Array.isArray(data.torrents)) return data.torrents;

        return [];
    }

    /*
     * Открытие собственного torrent-файла.
     *
     * В разных версиях и сборках Lampa торрент-компонент
     * может называться по-разному, поэтому здесь несколько
     * способов запуска.
     */
    function openTorrent(item, torrentUrl) {
    var server = getTorrentServer();

    if (!torrentUrl) {
        Lampa.Noty.show('Не указана ссылка на торрент');
        return;
    }

    Lampa.Noty.show('Загружаю список серий');

    fetch(server + '/torrents', {
        method: 'POST',
        headers: getTorrentHeaders(),
        body: JSON.stringify({
            action: 'add',
            link: torrentUrl,
            save_to_db: true
        })
    })
        .then(function (response) {
            if (response.status === 401) {
                throw new Error(
                    'TorrServer требует авторизацию. Откройте «Настроить TorrServer».'
                );
            }

            if (!response.ok) {
                throw new Error('TorrServer HTTP ' + response.status);
            }

            return response.json();
        })
        .then(function (torrent) {
            var files =
                torrent.file_stats ||
                torrent.files ||
                [];

            files = files.filter(function (file) {
                var name = file.path || file.name || '';

                return /\.(mkv|mp4|avi|mov|m4v|ts|m2ts)$/i.test(name);
            });

            if (!files.length) {
                throw new Error('В торренте не найдены видеофайлы');
            }

            files.sort(function (a, b) {
                var nameA = a.path || a.name || '';
                var nameB = b.path || b.name || '';

                return nameA.localeCompare(nameB, undefined, {
                    numeric: true,
                    sensitivity: 'base'
                });
            });

            var selectItems = files.map(function (file, position) {
                var fileName = file.path || file.name || ('Серия ' + (position + 1));

                return {
                    title: cleanEpisodeName(fileName, position),
                    subtitle: formatFileSize(file.length || file.size || 0),
                    file: file,
                    position: position
                };
            });

            Lampa.Select.show({
                title: item.title + ' — выбрать серию',
                items: selectItems,
                onSelect: function (selected) {
                    playTorrentFile(
                        server,
                        torrent,
                        selected.file,
                        selected.position,
                        item
                    );
                },
                onBack: function () {
                    Lampa.Controller.toggle('content');
                }
            });
        })
        .catch(function (error) {
            console.error('[Русское кино]', error);

            Lampa.Noty.show(
                'Ошибка: ' + error.message
            );
        });
}
function cleanEpisodeName(fileName, position) {
    var name = fileName.split('/').pop();

    name = name.replace(/\.(mkv|mp4|avi|mov|m4v|ts|m2ts)$/i, '');

    var episode =
        name.match(/(?:s\d{1,2}[\s._-]*)?e(\d{1,3})/i) ||
        name.match(/(?:серия|series?)[\s._-]*(\d{1,3})/i);

    if (episode) {
        return 'Серия ' + parseInt(episode[1], 10);
    }

    return 'Серия ' + (position + 1);
}

function formatFileSize(bytes) {
    bytes = Number(bytes || 0);

    if (!bytes) return '';

    var gigabytes = bytes / 1024 / 1024 / 1024;

    if (gigabytes >= 1) {
        return gigabytes.toFixed(2) + ' ГБ';
    }

    return (bytes / 1024 / 1024).toFixed(0) + ' МБ';
}

function playTorrentFile(server, torrent, file, position, item) {
    var hash = torrent.hash;
    var fileName = file.path || file.name || '';
    var fileIndex =
        file.id !== undefined
            ? file.id
            : file.index !== undefined
                ? file.index
                : position;

    if (!hash) {
        Lampa.Noty.show('TorrServer не вернул хеш торрента');
        return;
    }

    var streamUrl =
        getStreamServer() +
        '/stream/' +
        encodeURIComponent(fileName.split('/').pop()) +
        '?link=' +
        encodeURIComponent(hash) +
        '&index=' +
        encodeURIComponent(fileIndex) +
        '&play';

    console.log('[Русское кино] Запуск серии');

    Lampa.Player.play({
        url: streamUrl,
        title: item.title + ' — серия ' + (position + 1),
        movie: {
            title: item.title,
            original_title: item.original_title || item.title,
            overview: item.description || '',
            release_date: item.year
                ? String(item.year) + '-01-01'
                : ''
        }
    });

    Lampa.Player.playlist(
        []
    );
}
    function RussianSectionsComponent(object) {
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });

        var html = $(
            '<div class="russian-catalog-section">' +
                '<div class="russian-catalog-section__title">' +
                    'Русское кино' +
                '</div>' +
                '<div class="russian-catalog-list"></div>' +
            '</div>'
        );

        var list = html.find('.russian-catalog-list');

        var sections = [
            {
                icon: '🔥',
                title: 'Сейчас в онлайн-кинотеатрах',
                action: openOnlineNow
            },
            {
                icon: '📺',
                title: 'Новые сериалы',
                action: openNewSeries
            },
            {
                icon: '🎬',
                title: 'Новые фильмы',
                action: openNewMovies
            },
            {
                icon: '⭐',
                title: 'Популярные сериалы',
                action: openPopularSeries
            },
            {
                icon: '🍿',
                title: 'Популярные фильмы',
                action: openPopularMovies
            },
            {
                icon: '📼',
                title: 'Советское кино',
                action: openSovietMovies
            },
            {
                icon: '🔑',
                title: 'Настроить API Кинопоиска',
                action: configureKinopoiskApi
            },
            {
                icon: '🏴',
                title: 'Мои торренты',
                action: openMyTorrents
            },
            {
                icon: '⚙️',
                title: 'Настроить TorrServer',
                action: configureTorrentServer
            }
        ];

        this.create = function () {
            sections.forEach(function (section) {
                var row = $(
                    '<div class="russian-catalog-row selector">' +
                        '<div class="russian-catalog-row__icon">' +
                            section.icon +
                        '</div>' +
                        '<div class="russian-catalog-row__name">' +
                            section.title +
                        '</div>' +
                    '</div>'
                );

                row.on('hover:enter', function () {
                    section.action();
                });

                list.append(row);
            });

            scroll.append(html);
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    var rendered = scroll.render();
                    var selectors = rendered.find('.selector');

                    Lampa.Controller.collectionSet(rendered);
                    Lampa.Controller.collectionFocus(selectors.first(), rendered);
                },

                up: function () {
                    Lampa.Controller.collectionFocus(
                        false,
                        scroll.render(),
                        'up'
                    );
                },

                down: function () {
                    Lampa.Controller.collectionFocus(
                        false,
                        scroll.render(),
                        'down'
                    );
                },

                right: function () {
                    Lampa.Controller.collectionFocus(
                        false,
                        scroll.render(),
                        'right'
                    );
                },

                left: function () {
                    Lampa.Controller.toggle('menu');
                },

                back: function () {
                    Lampa.Activity.backward();
                }
            });

            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};

        this.stop = function () {};

        this.render = function () {
            return scroll.render();
        };

        this.destroy = function () {
            scroll.destroy();
            html.remove();
        };
    }

    /*
     * Каталог российских фильмов и сериалов из Kinopoisk API Unofficial.
     * API отдаёт метаданные; карточку Lampa находим по названию и году в TMDB.
     */
    function KinopoiskCatalogComponent(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });

        var html = $(
            '<div class="russian-catalog-section">' +
                '<div class="russian-catalog-section__title">' +
                    escapeHtml(object.title || 'Каталог Кинопоиска') +
                '</div>' +
                '<div class="russian-catalog-list"></div>' +
            '</div>'
        );

        var list = html.find('.russian-catalog-list');
        var titleSearchNetwork = null;

        function openSearch(item) {
            var title = item.nameRu || item.nameEn || item.nameOriginal || 'Фильм';
            var type = item.type === 'TV_SERIES' ? 'tv' : 'movie';
            var year = parseInt(item.year, 10) || 0;
            var titles = [item.nameRu, item.nameEn, item.nameOriginal]
                .map(function (value) {
                    return String(value || '').trim();
                })
                .filter(function (value, index, values) {
                    return value && values.indexOf(value) === index;
                });
            var matches = [];
            var titleIndex = 0;
            var successfulRequests = 0;
            var hadRequestError = false;

            if (!Lampa.TMDB || !Lampa.TMDB.api) {
                showMessage('В этой версии Lampa недоступен поиск TMDB');
                return;
            }

            if (!titles.length) titles = [title];

            function normalize(value) {
                return String(value || '')
                    .toLowerCase()
                    .replace(/ё/g, 'е')
                    .replace(/[^a-zа-я0-9]+/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            }

            function scoreMatch(result) {
                var resultTitles = [
                    result.title,
                    result.name,
                    result.original_title,
                    result.original_name
                ].map(normalize).filter(Boolean);
                var score = 0;

                titles.forEach(function (candidate) {
                    var expected = normalize(candidate);

                    resultTitles.forEach(function (actual) {
                        if (actual === expected) score = Math.max(score, 100);
                        else if (actual.indexOf(expected) >= 0 || expected.indexOf(actual) >= 0) {
                            score = Math.max(score, 60);
                        }
                    });
                });

                var releaseDate = result.release_date || result.first_air_date || '';
                var resultYear = parseInt(String(releaseDate).slice(0, 4), 10) || 0;

                if (year && resultYear) {
                    score += resultYear === year
                        ? 30
                        : Math.max(-20, 10 - Math.abs(resultYear - year) * 3);
                }

                score += Math.log(Number(result.vote_count || 0) + 1) / 100;

                return score;
            }

            function openBestMatch() {
                if (!matches.length) {
                    showMessage(successfulRequests
                        ? 'В TMDB не найдено совпадение для «' + title + '»'
                        : hadRequestError
                            ? 'Не удалось выполнить поиск в TMDB. Проверьте источник TMDB в Lampa.'
                            : 'В TMDB не найдено совпадение для «' + title + '»'
                    );
                    return;
                }

                matches.sort(function (a, b) {
                    return scoreMatch(b) - scoreMatch(a);
                });

                var card = matches[0];
                card.source = 'tmdb';
                card.type = type;
                card.media_type = type;
                card.kinopoisk_id = item.kinopoiskId || item.filmId || '';
                card.title = card.title || card.name || title;
                card.original_title = card.original_title || card.original_name || '';

                Lampa.Activity.push({
                    url: type + '/' + card.id,
                    title: card.title,
                    component: 'full',
                    source: 'tmdb',
                    method: type,
                    id: card.id,
                    card: card
                });
            }

            function searchTitle(query, withYear, onComplete) {
                var url = 'search/' + type + '?query=' + encodeURIComponent(query);

                if (withYear && year) {
                    url += type === 'tv'
                        ? '&first_air_date_year=' + year
                        : '&year=' + year;
                }

                titleSearchNetwork.timeout(15000);

                try {
                    titleSearchNetwork.silent(
                        Lampa.TMDB.api(url),
                        function (data) {
                            if (typeof data === 'string') {
                                try {
                                    data = JSON.parse(data);
                                } catch (error) {
                                    data = {};
                                }
                            }

                            successfulRequests++;

                            var results = data && Array.isArray(data.results)
                                ? data.results
                                : [];

                            if (!results.length && withYear && year) {
                                searchTitle(query, false, onComplete);
                                return;
                            }

                            matches = matches.concat(results);
                            onComplete();
                        },
                        function () {
                            hadRequestError = true;
                            onComplete();
                        }
                    );
                } catch (error) {
                    hadRequestError = true;
                    onComplete();
                }
            }

            function searchNextTitle() {
                if (titleIndex >= titles.length) {
                    openBestMatch();
                    return;
                }

                var query = titles[titleIndex++];
                searchTitle(query, true, searchNextTitle);
            }

            if (titleSearchNetwork) titleSearchNetwork.clear();
            titleSearchNetwork = new Lampa.Reguest();
            showMessage('Ищу карточку в Lampa…');
            searchNextTitle();
        }

        function renderEmpty(message) {
            list.empty().append(
                '<div class="russian-catalog-row">' + escapeHtml(message) + '</div>'
            );
        }

        function renderItems(items) {
            list.empty();

            if (!items.length) {
                renderEmpty('По этому фильтру ничего не найдено');
                return;
            }

            items.forEach(function (item) {
                var title = item.nameRu || item.nameEn || item.nameOriginal || 'Без названия';
                var type = item.type === 'TV_SERIES' ? 'Сериал' : 'Фильм';
                var rating = Number(item.ratingKinopoisk || 0);
                var poster = item.posterUrlPreview || item.posterUrl || '';
                var meta = [
                    item.year,
                    type,
                    rating ? '★ ' + rating.toFixed(1) : ''
                ].filter(Boolean).map(escapeHtml).join(' · ');
                var posterHtml = poster
                    ? '<img class="russian-catalog-poster" src="' + escapeHtml(poster) + '" alt="">'
                    : '<div class="russian-catalog-poster"></div>';

                var row = $(
                    '<div class="russian-catalog-row selector">' +
                        posterHtml +
                        '<div class="russian-catalog-item-info">' +
                            '<div class="russian-catalog-row__name">' +
                                escapeHtml(title) +
                            '</div>' +
                            '<div class="russian-torrent-card__quality">' +
                                meta +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );

                row.on('hover:enter', function () {
                    openSearch(item);
                });

                list.append(row);
            });

            var next = $(
                '<div class="russian-catalog-row selector">' +
                    '<div class="russian-catalog-row__icon">＋</div>' +
                    '<div class="russian-catalog-row__name">Ещё результаты</div>' +
                '</div>'
            );

            next.on('hover:enter', function () {
                openKinopoiskCatalog(
                    object.catalog_kind,
                    object.title,
                    Number(object.page || 1) + 1
                );
            });

            list.append(next);
        }

        this.create = function () {
            scroll.append(html);

            if (this.activity && this.activity.loader) {
                this.activity.loader(true);
            }

            network.timeout(15000);
            network.silent(
                buildKinopoiskUrl(object.catalog_kind, object.page),
                function (data) {
                    if (this.activity && this.activity.loader) {
                        this.activity.loader(false);
                    }

                    if (typeof data === 'string') {
                        try {
                            data = JSON.parse(data);
                        } catch (error) {
                            data = {};
                        }
                    }

                    renderItems(
                        data && Array.isArray(data.items)
                            ? data.items
                            : data && Array.isArray(data.films)
                                ? data.films
                                : []
                    );
                }.bind(this),
                function (xhr) {
                    if (this.activity && this.activity.loader) {
                        this.activity.loader(false);
                    }

                    var status = Number(xhr && xhr.status || 0);
                    var message = status === 401 || status === 403
                        ? 'API-ключ не принят. Проверьте его в настройках плагина.'
                        : status === 402
                            ? 'Исчерпан лимит API-ключа.'
                            : status === 429
                                ? 'Слишком много запросов. Попробуйте позже.'
                                : 'Не удалось связаться с API. Проверьте сеть и доступ к сервису.';

                    renderEmpty(message);
                    showMessage(message);
                }.bind(this),
                null,
                {
                    headers: {
                        'X-API-KEY': getKinopoiskApiKey(),
                        Accept: 'application/json'
                    }
                }
            );
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    var rendered = scroll.render();
                    var selectors = rendered.find('.selector');

                    Lampa.Controller.collectionSet(rendered);
                    Lampa.Controller.collectionFocus(selectors.first(), rendered);
                },
                up: function () {
                    Lampa.Controller.collectionFocus(false, scroll.render(), 'up');
                },
                down: function () {
                    Lampa.Controller.collectionFocus(false, scroll.render(), 'down');
                },
                right: function () {
                    Lampa.Controller.collectionFocus(false, scroll.render(), 'right');
                },
                left: function () {
                    Lampa.Controller.toggle('menu');
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            });

            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () {
            return scroll.render();
        };
        this.destroy = function () {
            network.clear();
            if (titleSearchNetwork) titleSearchNetwork.clear();
            scroll.destroy();
            html.remove();
        };
    }

    /*
     * Компонент «Мои торренты».
     */
    function MyTorrentsComponent(object) {
        var network = new Lampa.Reguest();

        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });

        var html = $(
            '<div class="russian-catalog-section">' +
                '<div class="russian-catalog-section__title">' +
                    'Мои торренты' +
                '</div>' +
                '<div class="russian-catalog-list"></div>' +
            '</div>'
        );

        var list = html.find('.russian-catalog-list');

        function renderItems(items) {
            list.empty();

            if (!items.length) {
                list.append(
                    '<div class="russian-catalog-row">' +
                        'Добавьте сериалы в data/my-torrents.json' +
                    '</div>'
                );
                return;
            }

            items.forEach(function (item) {
                var title = escapeHtml(item.title || 'Без названия');
                var meta = [
                    item.description,
                    item.quality,
                    item.year
                ].filter(Boolean).map(escapeHtml).join(' · ');
                var sourcesCount = getTorrentSources(item).length;

                if (sourcesCount > 1) {
                    meta = (meta ? meta + ' · ' : '') + sourcesCount + ' сезона';
                }

                var row = $(
                    '<div class="russian-catalog-row selector">' +
                        '<div class="russian-catalog-row__icon">▶</div>' +
                        '<div>' +
                            '<div class="russian-catalog-row__name">' +
                                title +
                            '</div>' +
                            '<div class="russian-torrent-card__quality">' +
                                meta +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );

                row.on('hover:enter', function () {
                    chooseTorrentSource(item);
                });

                list.append(row);
            });
        }

        this.create = function () {
            scroll.append(html);

            if (this.activity && this.activity.loader) {
                this.activity.loader(true);
            }

            network.silent(
                TORRENTS_DATA_URL + '?v=' + Date.now(),
                function (data) {
                    if (this.activity && this.activity.loader) {
                        this.activity.loader(false);
                    }

                    var items = parseTorrentsData(data);
                    renderItems(items.length ? items : MY_TORRENTS_FALLBACK);
                }.bind(this),
                function () {
                    if (this.activity && this.activity.loader) {
                        this.activity.loader(false);
                    }

                    renderItems(MY_TORRENTS_FALLBACK);
                    showMessage('Не удалось загрузить data/my-torrents.json');
                }.bind(this)
            );
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    var rendered = scroll.render();
                    var selectors = rendered.find('.selector');

                    Lampa.Controller.collectionSet(rendered);
                    Lampa.Controller.collectionFocus(selectors.first(), rendered);
                },

                up: function () {
                    Lampa.Controller.collectionFocus(
                        false,
                        scroll.render(),
                        'up'
                    );
                },

                down: function () {
                    Lampa.Controller.collectionFocus(
                        false,
                        scroll.render(),
                        'down'
                    );
                },

                right: function () {
                    Lampa.Controller.collectionFocus(
                        false,
                        scroll.render(),
                        'right'
                    );
                },

                left: function () {
                    Lampa.Controller.toggle('menu');
                },

                back: function () {
                    Lampa.Activity.backward();
                }
            });

            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};

        this.stop = function () {};

        this.render = function () {
            return scroll.render();
        };

        this.destroy = function () {
            network.clear();
            scroll.destroy();
            html.remove();
        };
    }

    /*
     * Простой компонент списка онлайн-релизов.
     * Он читает data/online-now.json.
     */
    function OnlineNowComponent(object) {
        var network = new Lampa.Reguest();

        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });

        var html = $(
            '<div class="russian-catalog-section">' +
                '<div class="russian-catalog-section__title">' +
                    'Сейчас в онлайн-кинотеатрах' +
                '</div>' +
                '<div class="russian-catalog-list"></div>' +
            '</div>'
        );

        var list = html.find('.russian-catalog-list');

        function renderItems(items) {
            list.empty();

            if (!Array.isArray(items) || !items.length) {
                list.append(
                    '<div class="russian-catalog-row">' +
                        'Список пока пуст' +
                    '</div>'
                );

                return;
            }

            items
                .slice()
                .sort(function (a, b) {
                    return Number(b.priority || 0) - Number(a.priority || 0);
                })
                .forEach(function (item) {
                    var service = item.service
                        ? ' · ' + item.service
                        : '';

                    var row = $(
                        '<div class="russian-catalog-row selector">' +
                            '<div class="russian-catalog-row__icon">🎞</div>' +
                            '<div>' +
                                '<div class="russian-catalog-row__name">' +
                                    (item.title || 'Без названия') +
                                '</div>' +
                                '<div class="russian-torrent-card__quality">' +
                                    service.replace(/^ · /, '') +
                                '</div>' +
                            '</div>' +
                        '</div>'
                    );

                    row.on('hover:enter', function () {
                        /*
                         * Открываем обычный поиск Lampa по названию.
                         */
                        Lampa.Activity.push({
                            url: '',
                            title: item.title,
                            component: 'search',
                            query: item.title,
                            search: item.title,
                            page: 1
                        });
                    });

                    list.append(row);
                });
        }

        this.create = function () {
            if (this.activity && this.activity.loader) {
                this.activity.loader(true);
            }

            scroll.append(html);

            network.silent(
                ONLINE_DATA_URL + '?v=' + Date.now(),
                function (data) {
                    if (this.activity && this.activity.loader) {
                        this.activity.loader(false);
                    }

                    if (typeof data === 'string') {
                        try {
                            data = JSON.parse(data);
                        } catch (error) {
                            data = [];
                        }
                    }

                    renderItems(data);
                }.bind(this),
                function () {
                    if (this.activity && this.activity.loader) {
                        this.activity.loader(false);
                    }

                    renderItems([]);
                    showMessage('Не удалось загрузить online-now.json');
                }.bind(this)
            );
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    var rendered = scroll.render();
                    var selectors = rendered.find('.selector');

                    Lampa.Controller.collectionSet(rendered);
                    Lampa.Controller.collectionFocus(selectors.first(), rendered);
                },

                up: function () {
                    Lampa.Controller.collectionFocus(
                        false,
                        scroll.render(),
                        'up'
                    );
                },

                down: function () {
                    Lampa.Controller.collectionFocus(
                        false,
                        scroll.render(),
                        'down'
                    );
                },

                right: function () {
                    Lampa.Controller.collectionFocus(
                        false,
                        scroll.render(),
                        'right'
                    );
                },

                left: function () {
                    Lampa.Controller.toggle('menu');
                },

                back: function () {
                    Lampa.Activity.backward();
                }
            });

            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};

        this.stop = function () {};

        this.render = function () {
            return scroll.render();
        };

        this.destroy = function () {
            network.clear();
            scroll.destroy();
            html.remove();
        };
    }

    function addMenuButton() {
        var menu = $('.menu .menu__list').first();

        if (!menu.length) {
            menu = $('.menu__list').first();
        }

        if (!menu.length) return false;

        if (menu.find('.russian-catalog-menu-item').length) {
            return true;
        }

        var button = $(
            '<li class="menu__item selector russian-catalog-menu-item">' +
                '<div class="menu__ico">🇷🇺</div>' +
                '<div class="menu__text">Русское кино</div>' +
            '</li>'
        );

        button.on('hover:enter', function () {
            openSections();
        });

        menu.append(button);

        return true;
    }

    function registerComponents() {
        Lampa.Component.add(
            SECTIONS_COMPONENT,
            RussianSectionsComponent
        );

        Lampa.Component.add(
            ONLINE_COMPONENT,
            OnlineNowComponent
        );

        Lampa.Component.add(
            MY_TORRENTS_COMPONENT,
            MyTorrentsComponent
        );

        Lampa.Component.add(
            KINOPOISK_COMPONENT,
            KinopoiskCatalogComponent
        );
    }

    function startPlugin() {
        addStyles();
        registerComponents();

        if (!addMenuButton()) {
            var attempts = 0;

            var timer = setInterval(function () {
                attempts++;

                if (addMenuButton() || attempts >= 30) {
                    clearInterval(timer);
                }
            }, 500);
        }

        /*
         * Повторно добавляем кнопку после перерисовки интерфейса.
         */
        if (Lampa.Listener) {
            Lampa.Listener.follow('app', function (event) {
                if (
                    event.type === 'ready' ||
                    event.type === 'complite'
                ) {
                    setTimeout(addMenuButton, 300);
                }
            });
        }

        console.log(
            '[Русское кино] plugin.js запущен, версия ' + VERSION
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
