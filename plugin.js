(function () {
    'use strict';

    if (window.russian_catalog_plugin_ready) return;
    window.russian_catalog_plugin_ready = true;

    function openRussianMovies() {
        Lampa.Activity.push({
            title: 'Русское кино',
            component: 'category_full',
            source: 'tmdb',
            url:
                'discover/movie' +
                '?with_origin_country=RU' +
                '&with_original_language=ru' +
                '&without_genres=16' +
                '&sort_by=popularity.desc',
            page: 1
        });
    }

    function addMenuButton() {
        if ($('.menu__item.russian-catalog-menu').length) return;

        var button = $(`
            <li class="menu__item selector russian-catalog-menu">
                <div class="menu__ico">
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1
                            0-2-.9-2-2V6c0-1.1.9-2 2-2m0 2v12h16V6H4m2
                            2h3v3H6V8m5 0h3v3h-3V8m5 0h2v3h-2V8m-10
                            5h3v3H6v-3m5 0h3v3h-3v-3m5 0h2v3h-2v-3z"/>
                    </svg>
                </div>

                <div class="menu__text">Русское кино</div>
            </li>
        `);

        button.on('hover:enter', function () {
            openRussianMovies();
        });

        $('.menu .menu__list').eq(0).append(button);

        console.log('[Russian Catalog] loaded');
    }

    function startPlugin() {
        addMenuButton();

        /*
         * Меню иногда перерисовывается после запуска приложения,
         * поэтому повторно проверяем наличие кнопки.
         */
        setTimeout(addMenuButton, 1000);
        setTimeout(addMenuButton, 3000);
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') startPlugin();
        });
    }
})();
