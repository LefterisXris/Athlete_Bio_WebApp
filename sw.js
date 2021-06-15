self.addEventListener('install', function (event) {
    console.log('The service worker is being installed...');
    event.waitUntil(
        caches.open('athlete-bio').then(function(cache) {
            return cache.addAll([
                '/index.html',
                '/setup.html',
                '/manifest.json',
                /* Javascript */
                '/js/main.js',
                '/js/setup.js',
                /* CSS */
                '/css/main.css',
                '/css/setup.css',
                'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
                /* Fonts */
                '/fonts/LICENSE.txt',
                '/fonts/OpenSansCondensed-Bold.ttf',
                '/fonts/OpenSansCondensed-Light.ttf',
                '/fonts/OpenSansCondensed-LightItalic.ttf',
                /* Images */
                '/img/tennis.ico',
                '/img/setup.ico',
                '/img/flag-greece.png',
                '/img/stefanos-tsitsipas-logo.png',
                '/img/stefanos-tsitsipas-transparent.png',
                '/img/vs-matches.png',
                '/img/sports.png',
                '/img/sports-wide.png',
                '/img/tournaments/estoril-2020.svg',
                '/img/tournaments/london-2020.svg',
                '/img/tournaments/marseille-2019.svg',
                '/img/tournaments/marseille-2020.svg',
                '/img/tournaments/monte-carlo-2021.svg',
                '/img/tournaments/stockholm-2018.svg'
            ]);
        })
    );
});

self.addEventListener('fetch', function (event) {
    console.log('The service worker is serving the asset.');
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || caches.match('/index.html');
        })
    );
});