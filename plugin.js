(function () {
    'use strict';

    var PLUGIN_NAME = 'russian_catalog';
    var VERSION = '1.6.2';

    var SECTIONS_COMPONENT = 'russian_sections';
    var ONLINE_COMPONENT = 'russian_online_top';
    var MY_TORRENTS_COMPONENT = 'russian_my_torrents';
    var TORRENT_SETTINGS_KEY = 'russian_torrent_server';
    var TORRENT_USERNAME_KEY = 'russian_torrent_username';
    var TORRENT_PASSWORD_KEY = 'russian_torrent_password';

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
            console.log('[Русский раздел]', message);
        }
    }

    function navigate(direction) {
        try {
            if (typeof Navigator !== 'undefined' && Navigator.canmove(direction)) {
                Navigator.move(direction);
                return true;
            }
        } catch (error) {}

        return false;
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
            'display:block;' +
            '}' +

            '.russian-shelf {' +
            'margin:0 0 1.6em;' +
            '}' +

            '.russian-shelf__title {' +
            'font-size:1.35em;' +
            'font-weight:600;' +
            'margin:0 0 .65em;' +
            '}' +

            '.russian-shelf__items {' +
            'display:flex;' +
            'gap:.75em;' +
            'overflow-x:hidden;' +
            'padding:.35em .2em .75em;' +
            '}' +

            '.russian-release-card {' +
            'position:relative;' +
            'flex:0 0 calc((100vw - 10em) / 6);' +
            'width:calc((100vw - 10em) / 6);' +
            'min-width:0;' +
            'transition:transform .18s;' +
            '}' +

            '.russian-release-card.focus {' +
            'transform:scale(1.045);' +
            '}' +

            '.russian-release-card__poster {' +
            'display:block;' +
            'width:100%;' +
            'height:calc((100vw - 10em) / 4);' +
            'object-fit:cover;' +
            'border-radius:.45em;' +
            'background:rgba(255,255,255,.1);' +
            '}' +

            '.russian-release-card.focus .russian-release-card__poster {' +
            'outline:.18em solid #fff;' +
            '}' +

            '.russian-release-card__title {' +
            'font-size:.9em;' +
            'font-weight:500;' +
            'line-height:1.25;' +
            'margin-top:.45em;' +
            'max-height:2.5em;' +
            'overflow:hidden;' +
            '}' +

            '.russian-release-card__meta {' +
            'font-size:.78em;' +
            'opacity:.72;' +
            'margin-top:.25em;' +
            '}' +

            '.russian-release-card--message {' +
            'display:flex;' +
            'align-items:center;' +
            'justify-content:center;' +
            'height:calc((100vw - 10em) / 4);' +
            'padding:0 .75em;' +
            'border-radius:.45em;' +
            'background:rgba(255,255,255,.08);' +
            'text-align:center;' +
            'font-size:.9em;' +
            '}' +

            '.russian-action-card {' +
            'box-sizing:border-box;' +
            'max-width:calc((100vw - 10em) / 3);' +
            'display:flex;' +
            'align-items:center;' +
            'gap:.7em;' +
            'flex:0 0 15em;' +
            'padding:1.1em;' +
            'border-radius:.55em;' +
            'background:rgba(255,255,255,.08);' +
            '}' +

            '.russian-action-card.focus {' +
            'background:#fff;' +
            'color:#000;' +
            '}' +

            '.russian-action-card__icon {' +
            'font-size:1.5em;' +
            '}' +

            '.russian-action-card__title {' +
            'font-size:1em;' +
            'font-weight:500;' +
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
        openActivity(SECTIONS_COMPONENT, 'Русский раздел');
    }

    function openOnlineNow() {
        openActivity(ONLINE_COMPONENT, 'Сейчас в онлайн-кинотеатрах');
    }

    function openMyTorrents() {
        openActivity(MY_TORRENTS_COMPONENT, 'Мои торренты');
    }

    function formatDate(date) {
        var month = String(date.getMonth() + 1);
        var day = String(date.getDate());

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return date.getFullYear() + '-' + month + '-' + day;
    }

    function dateYearsAgo(years) {
        var date = new Date();
        date.setFullYear(date.getFullYear() - years);
        return formatDate(date);
    }

    function openTmdbCatalog(url, title) {
        openActivity('category_full', title, {
            url: url,
            source: 'tmdb',
            card_type: true,
            page: 1
        });
    }

    function russianCatalogUrl(kind) {
        var today = formatDate(new Date());
        var from = dateYearsAgo(2);
        var url = kind === 'new_series' || kind === 'popular_series'
            ? 'discover/tv'
            : 'discover/movie';
        var query = {
            with_original_language: 'ru'
        };

        if (kind === 'new_series') {
            query.sort_by = 'first_air_date.desc';
            query['first_air_date.gte'] = from;
            query['first_air_date.lte'] = today;
        } else if (kind === 'new_movies') {
            query.sort_by = 'primary_release_date.desc';
            query['primary_release_date.gte'] = from;
            query['primary_release_date.lte'] = today;
        } else if (kind === 'popular_series' || kind === 'popular_movies') {
            query.sort_by = 'popularity.desc';
            query['vote_count.gte'] = 10;
        } else if (kind === 'soviet_movies') {
            query.sort_by = 'vote_count.desc';
            query['primary_release_date.gte'] = '1920-01-01';
            query['primary_release_date.lte'] = '1991-12-31';
        }

        var request = url + '?' + Object.keys(query).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
        }).join('&');

        return request;
    }

    function openRussianCatalog(kind, title) {
        openTmdbCatalog(russianCatalogUrl(kind), title);
    }

    function openNewSeries() {
        openRussianCatalog('new_series', 'Новые российские сериалы');
    }

    function openNewMovies() {
        openRussianCatalog('new_movies', 'Новые российские фильмы');
    }

    function openPopularSeries() {
        openRussianCatalog('popular_series', 'Популярные российские сериалы');
    }

    function openPopularMovies() {
        openRussianCatalog('popular_movies', 'Популярные российские фильмы');
    }

    function openSovietMovies() {
        openRussianCatalog('soviet_movies', 'Советское кино');
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
            console.warn('[Русский раздел] Не удалось прочитать адрес TorrServer', error);
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
            console.warn('[Русский раздел] Не удалось прочитать данные TorrServer', error);
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
            console.error('[Русский раздел]', error);

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

    console.log('[Русский раздел] Запуск серии');

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
        var requests = [];

        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });

        var html = $(
            '<div class="russian-catalog-section">' +
                '<div class="russian-catalog-section__title">' +
                    'Русский раздел' +
                '</div>' +
                '<div class="russian-catalog-list"></div>' +
            '</div>'
        );

        var list = html.find('.russian-catalog-list');

        var shelves = [
            {
                kind: 'new_series',
                type: 'tv',
                title: 'Новые российские сериалы',
                action: openNewSeries
            },
            {
                kind: 'new_movies',
                type: 'movie',
                title: 'Новые российские фильмы',
                action: openNewMovies
            },
            {
                kind: 'popular_series',
                type: 'tv',
                title: 'Популярные российские сериалы',
                action: openPopularSeries
            },
            {
                kind: 'popular_movies',
                type: 'movie',
                title: 'Популярные российские фильмы',
                action: openPopularMovies
            },
            {
                kind: 'soviet_movies',
                type: 'movie',
                title: 'Советское кино',
                action: openSovietMovies
            }
        ];

        function isActivePage() {
            try {
                var active = Lampa.Activity.active();
                return active && active.component === SECTIONS_COMPONENT;
            } catch (error) {
                return false;
            }
        }

        function syncNavigation(row, restoreFocus) {
            if (!isActivePage()) return;

            var rendered = scroll.render();
            Lampa.Controller.collectionSet(rendered);

            if (restoreFocus) {
                var first = row.find('.selector').first();
                if (first.length) Lampa.Controller.collectionFocus(first, rendered);
            }
        }

        function focusCard(card) {
            if (!card || !card.length) return false;

            Lampa.Controller.collectionFocus(card, scroll.render());
            scroll.update(card, true);
            scrollCardIntoView(card, card.closest('.russian-shelf__items'));

            return true;
        }

        function moveHorizontal(direction) {
            var current = html.find('.focus').first();
            var row = current.closest('.russian-shelf__items');
            var cards = row.find('.selector');
            var index = cards.index(current);
            var next = cards.eq(index + (direction === 'right' ? 1 : -1));

            if (focusCard(next)) return;
            if (direction === 'left') Lampa.Controller.toggle('menu');
        }

        function moveVertical(direction) {
            var current = html.find('.focus').first();
            var currentShelf = current.closest('.russian-shelf');
            var rows = list.children('.russian-shelf');
            var index = rows.index(currentShelf);
            var nextShelf = rows.eq(index + (direction === 'down' ? 1 : -1));

            if (!nextShelf.length) {
                if (direction === 'up') Lampa.Controller.toggle('head');
                return;
            }

            var currentRowCards = current.closest('.russian-shelf__items').find('.selector');
            var currentCardIndex = Math.max(0, currentRowCards.index(current));
            var nextCards = nextShelf.find('.russian-shelf__items .selector');
            var nextCard = nextCards.eq(Math.min(currentCardIndex, nextCards.length - 1));

            focusCard(nextCard);
        }

        function makeMessageCard(message) {
            var card = $('<div class="russian-release-card russian-release-card--message selector"></div>');
            card.text(message);
            return card;
        }

        function scrollCardIntoView(card, row) {
            var viewport = row[0];
            var element = card[0];

            if (!viewport || !element || !element.getBoundingClientRect) return;

            var viewportBox = viewport.getBoundingClientRect();
            var cardBox = element.getBoundingClientRect();

            if (cardBox.left < viewportBox.left) {
                viewport.scrollLeft -= viewportBox.left - cardBox.left;
            } else if (cardBox.right > viewportBox.right) {
                viewport.scrollLeft += cardBox.right - viewportBox.right;
            }
        }

        function openTmdbItem(item, type) {
            var title = item.title || item.name || 'Без названия';
            var card = {};

            Object.keys(item).forEach(function (key) {
                card[key] = item[key];
            });

            card.title = title;
            card.original_title = item.original_title || item.original_name || title;
            card.type = type;
            card.media_type = type;
            card.source = 'tmdb';

            Lampa.Activity.push({
                url: '',
                title: title,
                component: 'full',
                source: 'tmdb',
                method: type,
                id: item.id,
                card: card
            });
        }

        function makeReleaseCard(item, shelf, row) {
            var title = item.title || item.name || 'Без названия';
            var date = item.release_date || item.first_air_date || '';
            var year = date ? date.slice(0, 4) : '';
            var rating = Number(item.vote_average || 0);
            var meta = [year, rating ? '★ ' + rating.toFixed(1) : '']
                .filter(Boolean)
                .join(' · ');
            var card = $('<div class="russian-release-card selector"></div>');
            var poster = item.poster_path
                ? $('<img class="russian-release-card__poster" alt="">')
                : $('<div class="russian-release-card__poster"></div>');

            if (item.poster_path) {
                var posterUrl = Lampa.TMDB && Lampa.TMDB.image
                    ? Lampa.TMDB.image('t/p/w342' + item.poster_path)
                    : 'https://image.tmdb.org/t/p/w342' + item.poster_path;

                poster.attr('src', posterUrl);
                poster.attr('alt', title);
            }

            card.append(poster);
            card.append($('<div class="russian-release-card__title"></div>').text(title));
            if (meta) {
                card.append($('<div class="russian-release-card__meta"></div>').text(meta));
            }

            card.on('hover:focus', function () {
                scroll.update(card, true);
                scrollCardIntoView(card, row);
            });

            card.on('hover:enter', function () {
                openTmdbItem(item, shelf.type);
            });

            return card;
        }

        function makeMoreCard(shelf, row) {
            var card = $('<div class="russian-release-card russian-release-card--message selector"></div>');
            card.text('Все результаты');

            card.on('hover:focus', function () {
                scroll.update(card, true);
                scrollCardIntoView(card, row);
            });
            card.on('hover:enter', shelf.action);

            return card;
        }

        function renderShelf(shelf) {
            var section = $('<div class="russian-shelf"></div>');
            var row = $('<div class="russian-shelf__items"></div>');

            section.append(
                $('<div class="russian-shelf__title"></div>').text(shelf.title)
            );
            section.append(row);
            list.append(section);
            row.append(makeMessageCard('Загружаем…'));

            shelf.row = row;
            return section;
        }

        function loadShelf(shelf) {
            if (!Lampa.TMDB || !Lampa.TMDB.api || !Lampa.TMDB.key) {
                shelf.row.empty().append(makeMessageCard('Источник TMDB недоступен'));
                return;
            }

            var request = new Lampa.Reguest();
            requests.push(request);

            var language = Lampa.Storage && Lampa.Storage.field
                ? Lampa.Storage.field('tmdb_lang') || 'ru-RU'
                : 'ru-RU';
            var url = Lampa.TMDB.api(russianCatalogUrl(shelf.kind));
            var separator = url.indexOf('?') >= 0 ? '&' : '?';
            url += separator + 'api_key=' + encodeURIComponent(Lampa.TMDB.key());
            url += '&language=' + encodeURIComponent(language);
            url += '&page=1';

            function renderResults(data) {
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                    } catch (error) {
                        data = {};
                    }
                }

                var results = data && Array.isArray(data.results)
                    ? data.results.filter(function (item) {
                        return item && item.id;
                    })
                    : [];
                var hadFocus = shelf.row.find('.focus').length > 0;

                shelf.row.empty();

                if (!results.length) {
                    shelf.row.append(makeMessageCard('Нет карточек для показа'));
                } else {
                    results.forEach(function (item) {
                        shelf.row.append(makeReleaseCard(item, shelf, shelf.row));
                    });
                    shelf.row.append(makeMoreCard(shelf, shelf.row));
                }

                syncNavigation(shelf.row, hadFocus);
            }

            request.timeout(15000);
            request.silent(
                url,
                renderResults,
                function () {
                    var hadFocus = shelf.row.find('.focus').length > 0;
                    shelf.row.empty().append(
                        makeMessageCard('Не удалось загрузить подборку TMDB')
                    );
                    syncNavigation(shelf.row, hadFocus);
                }
            );
        }

        function renderActions() {
            var section = $('<div class="russian-shelf"></div>');
            var row = $('<div class="russian-shelf__items"></div>');
            var actions = [
                { icon: '🔥', title: 'Сейчас в онлайн-кинотеатрах', action: openOnlineNow },
                { icon: '🏴', title: 'Мои торренты', action: openMyTorrents },
                { icon: '⚙️', title: 'Настроить TorrServer', action: configureTorrentServer }
            ];

            section.append(
                $('<div class="russian-shelf__title"></div>').text('Дополнительно')
            );

            actions.forEach(function (item) {
                var card = $('<div class="russian-action-card selector"></div>');
                card.append($('<div class="russian-action-card__icon"></div>').text(item.icon));
                card.append($('<div class="russian-action-card__title"></div>').text(item.title));
                card.on('hover:enter', item.action);
                card.on('hover:focus', function () {
                    scroll.update(card, true);
                    scrollCardIntoView(card, row);
                });
                row.append(card);
            });

            section.append(row);
            list.append(section);
        }

        this.create = function () {
            shelves.forEach(renderShelf);
            renderActions();
            scroll.append(html);
            shelves.forEach(loadShelf);
            return this.render();
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
                    moveVertical('up');
                },

                down: function () {
                    moveVertical('down');
                },

                right: function () {
                    moveHorizontal('right');
                },

                left: function () {
                    moveHorizontal('left');
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
            requests.forEach(function (request) {
                request.clear();
            });
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
                    if (!navigate('up')) Lampa.Controller.toggle('head');
                },

                down: function () {
                    navigate('down');
                },

                right: function () {
                    navigate('right');
                },

                left: function () {
                    if (!navigate('left')) Lampa.Controller.toggle('menu');
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
                    if (!navigate('up')) Lampa.Controller.toggle('head');
                },

                down: function () {
                    navigate('down');
                },

                right: function () {
                    navigate('right');
                },

                left: function () {
                    if (!navigate('left')) Lampa.Controller.toggle('menu');
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
                '<div class="menu__text">Русский раздел</div>' +
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
            '[Русский раздел] plugin.js запущен, версия ' + VERSION
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
