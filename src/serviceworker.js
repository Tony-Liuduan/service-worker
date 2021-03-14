import './db';

const VERSION = self.__VERSION__;
const cacheKey = 'cache-' + VERSION;
const CACHE_LIST = self.__WEBPACK_INJECT_CACHE_LIST__;

console.log(cacheKey, CACHE_LIST);

self.addEventListener('install', function (event) {
    console.log('install event');
    event.waitUntil(
        caches.open(cacheKey)
            .then((_cache) => _cache.addAll(CACHE_LIST))
            // self.skipWaiting方法让当前新版本的Service Worker跳过等待 ??
            .then(self.skipWaiting())
    );
});

self.addEventListener('activate', function (event) {
    console.log('activate event');
    event.waitUntil(
        caches.keys()
            .then((keys) => (
                Promise.all(
                    keys.filter((key) => key !== cacheKey)
                        .map((key) => caches.delete(key))
                )
            )).then(() => {
                // TODO: self.clients.claim方法可以让当前的Service Worker立刻掌控页面，实现页面的及时更新 ??
                self.clients.claim()
            })
    )
});

self.addEventListener('fetch', function (event) {
    console.log('fetch event', event.request);
    if (
        CACHE_LIST.find((cache) => {
            return event.request.url.endsWith(cache)
        })
    ) {
        event.respondWith(
            caches.match((event.request)).then((cachedResponse) => (
                cachedResponse || fetch(event.request)
            ))
        )
    }
});

function sendMessages() {
    return fetch('http://localhost:9999/api/test').then((response) => {
        return response.json()
    }).then((data) => {
        console.log(data.errCode === 0)
        return data.errCode === 0 ? Promise.resolve() : Promise.reject()
    })
}

// self.addEventListener('sync', (event) => {
//     console.log('sync', event);
//     // 拿到我们刚才发送的标识
//     if (event.tag === 'send-messages') {
//         event.waitUntil(
//             sendMessages().catch(() => {
//                 console.log('lastChance', event.lastChance);
//                 // 当event.lastChance属性为true时，将会放弃尝试
//                 // 在chrome浏览器中测试，online 下请求失败时, 一共会发送三次，第一次到第二次的间隔为5分钟，第二次到第三次的间隔为10分钟。
//                 if (event.lastChance) {
//                     console.log('不会再次尝试请求了')
//                 }
//                 return Promise.reject('fail');
//             })
//         )
//     }
// })

self.addEventListener('sync', (event) => {
    if (event.tag === 'send-messages') {
        event.waitUntil(
            self.db.getAll().then((contents) => {
                console.log(contents);
                return Promise.all(
                    contents.map(({ content }) => {
                        return sendMessages(content)
                    })
                )
            }).then(() => {
                return self.db.clear()
            })
        )
    }
})
