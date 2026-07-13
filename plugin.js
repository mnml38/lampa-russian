(function () {
    'use strict';

    var PLUGIN_NAME = 'russian_catalog';
    var VERSION = '1.0.0';

    var SECTIONS_COMPONENT = 'russian_sections';
    var ONLINE_COMPONENT = 'russian_online_top';
    var MY_TORRENTS_COMPONENT = 'russian_my_torrents';

    var ONLINE_DATA_URL =
        'https://mnml38.github.io/lampa-russian/data/online-now.json';

    /*
     * ВАЖНО:
     * Файл должен находиться в репозитории по адресу:
     *
     * torrents/chikatilo.torrent
     */
    var MY_TORRENTS = [
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

    function openNewSeries() {
        showMessage('Раздел «Новые сериалы» скоро будет добавлен');
    }

    function openNewMovies() {
        showMessage('Раздел «Новые фильмы» скоро будет добавлен');
    }

    function openPopularSeries() {
        showMessage('Раздел «Популярные сериалы» скоро будет добавлен');
    }

    function openPopularMovies() {
        showMessage('Раздел «Популярные фильмы» скоро будет добавлен');
    }

    function openSovietMovies() {
        showMessage('Раздел «Советское кино» скоро будет добавлен');
    }

    /*
     * Открытие собственного torrent-файла.
     *
     * В разных версиях и сборках Lampa торрент-компонент
     * может называться по-разному, поэтому здесь несколько
     * способов запуска.
     */
function openTorrent(item) {
    var torrentUrl = item.torrent;
    var server = 'http://185.139.68.151:8090';

    if (!torrentUrl) {
        Lampa.Noty.show('Не указана ссылка на торрент');
        return;
    }

    server = server.replace(/\/+$/, '');

    Lampa.Noty.show('Загружаю список серий');

    fetch(server + '/torrents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'add',
            link: torrentUrl,
            save_to_db: true
        })
    })
        .then(function (response) {
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
        server +
        '/stream/' +
        encodeURIComponent(fileName.split('/').pop()) +
        '?link=' +
        encodeURIComponent(hash) +
        '&index=' +
        encodeURIComponent(fileIndex) +
        '&play';

    console.log('[Русское кино] Запуск:', streamUrl);

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
                icon: '🏴',
                title: 'Мои торренты',
                action: openMyTorrents
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
                    Lampa.Controller.collectionSet(
                        scroll.render().find('.selector')
                    );

                    Lampa.Controller.collectionFocus(
                        scroll.render().find('.selector').first(),
                        scroll.render()
                    );
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
     * Компонент «Мои торренты».
     */
    function MyTorrentsComponent(object) {
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

        this.create = function () {
            MY_TORRENTS.forEach(function (item) {
                var row = $(
                    '<div class="russian-catalog-row selector">' +
                        '<div class="russian-catalog-row__icon">▶</div>' +
                        '<div>' +
                            '<div class="russian-catalog-row__name">' +
                                item.title +
                            '</div>' +
                            '<div class="russian-torrent-card__quality">' +
                                item.description +
                                ' · ' +
                                item.quality +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );

                row.on('hover:enter', function () {
                    openTorrent(item);
                });

                list.append(row);
            });

            scroll.append(html);
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(
                        scroll.render().find('.selector')
                    );

                    Lampa.Controller.collectionFocus(
                        scroll.render().find('.selector').first(),
                        scroll.render()
                    );
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
                    Lampa.Controller.collectionSet(
                        scroll.render().find('.selector')
                    );

                    Lampa.Controller.collectionFocus(
                        scroll.render().find('.selector').first(),
                        scroll.render()
                    );
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
