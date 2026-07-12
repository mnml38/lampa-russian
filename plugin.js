(function () {
    'use strict';

    var PLUGIN_NAME = 'russian_catalog';

    if (window[PLUGIN_NAME + '_ready']) return;
    window[PLUGIN_NAME + '_ready'] = true;

    function openCategory(title, url) {
        Lampa.Activity.push({
            title: title,
            component: 'category_full',
            source: 'tmdb',
            url: url,
            page: 1
        });
    }

   function formatDate(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');

    return year + '-' + month + '-' + day;
}

function openCatalog() {
    var now = new Date();
    var from = new Date();

    from.setDate(now.getDate() - 60);

    var url =
        'discover/tv' +
        '?with_origin_country=RU' +
        '&with_original_language=ru' +
        '&air_date.gte=' + formatDate(from) +
        '&air_date.lte=' + formatDate(now) +
        '&vote_count.gte=5' +
        '&sort_by=popularity.desc';

    openCategory('Сейчас выходят', url);
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
        addMenuButton();

        setTimeout(addMenuButton, 1000);
        setTimeout(addMenuButton, 3000);

        console.log('[Russian Catalog] started');
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
