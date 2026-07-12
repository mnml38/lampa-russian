(function () {
    'use strict';

    function startPlugin() {
        if (window.russian_catalog_plugin_ready) return;
        window.russian_catalog_plugin_ready = true;

        var button = $(`
            <li class="menu__item selector">
                <div class="menu__ico">
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor"
                              d="M4 6h16v12H4V6m2 2v8h12V8H6m2 1h3v3H8V9m5 0h3v3h-3V9m-5 4h3v2H8v-2m5 0h3v2h-3v-2z"/>
                    </svg>
                </div>
                <div class="menu__text">Русское кино</div>
            </li>
        `);

        button.on('hover:enter', function () {
            Lampa.Noty.show('Плагин «Русское кино» работает');
        });

        $('.menu .menu__list').eq(0).append(button);

        console.log('Russian catalog plugin started');
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') startPlugin();
        });
    }
})();
