var cacheStorageKey = 'v3';
var cacheList = [
    // 注册成功后要立即缓存的资源列表
    '/index.html',
    '/index.css',
    '/app.js',
    '/gallery/star-wars-logo.jpg',
    '/gallery/bountyHunters.jpg',
    '/gallery/myLittleVader.jpg',
    '/gallery/snowTroopers.jpg',
    'https://mermaid-js.github.io/mermaid/img/header.png'
]
console.log(this === self) // true 


this.addEventListener('error', function (e) {
    console.log('addEventListener error', e);
});


// 当浏览器解析完 SW 文件时触发 install 事件
this.addEventListener('install', function (e) {
    console.log('addEventListener install');
    // install 事件中一般会将 cacheList 中要换存的内容通过 addAll 方法，请求一遍放入 caches 中
    // 我们使用了 caches.open() 方法来创建了一个叫做 v1 的新的缓存，将会是我们的站点资源缓存的第一个版本。
    // waitUntil 确保Service Worker 不会在 waitUntil() 里面的代码执行完毕之前安装完成
    // caches 一个 service worker 上的全局对象，它使我们可以存储网络响应发来的资源，并且根据它们的请求来生成key
    e.waitUntil(
        caches
            .open(cacheStorageKey)
            .then(cache => {
                return cache.addAll(cacheList);
            })
            .catch(e => {
                console.log(e);
            })
    );
});


// 激活时触发 activate 事件，当安装成功完成之后， service worker 就会激活
// 当之前版本还在运行的时候，一般被用来做些会破坏它的事情，比如摆脱旧版的缓存。在避免占满太多磁盘空间清理一些不再需要的数据的时候也是非常有用的，每个浏览器都对 service worker 可以用的缓存空间有个硬性的限制。浏览器尽力管理磁盘空间，但它可能会删除整个域的缓存。浏览器通常会删除域下面的所有的数据。
this.addEventListener('activate', function (e) {
    console.log('addEventListener activate ~~~~~!@')
    // 传给 waitUntil() 的 promise 会阻塞其他的事件，直到它完成。所以你可以确保你的清理操作会在你的的第一次 fetch 事件之前会完成。
    // active 事件中通常做一些过期资源释放的工作，匹配到就从 caches 中删除

    // e.waitUntil(
    //     caches.keys().then(function (keyList) {
    //         console.log(keyList);
    //         return Promise.all(keyList.map(function (key) {
    //             if (key === cacheStorageKey) {
    //                 return caches.delete(key);
    //             } else {
    //                 return Promise.resolve();
    //             }
    //         }));
    //     })
    // );

    e.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    console.log(cacheName)
                    if ([cacheStorageKey].indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});



this.addEventListener('fetch', function (e) {
    // console.log(e.request);
    // 在此编写缓存策略
    e.respondWith(
        // 可以通过匹配缓存中的资源返回
        // caches.match(e.request)
        // 也可以从远端拉取
        // fetch(e.request.url),
        // 也可以自己造
        // new Response('自己造')
        // 也可以通过吧 fetch 拿到的响应通过 caches.put 方法放进 caches

        caches
            .match(e.request)
            .then(function (response) {
                console.log(response, e.request, cacheStorageKey);
                if (response) {
                    return response;
                }

                // IMPORTANT:Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                var fetchRequest = e.request.clone();

                return fetch(fetchRequest).then(
                    function (response) {
                        // Check if we received a valid response
                        // 确保响应类型为 basic，亦即由自身发起的请求。 这意味着，对第三方资产的请求也不会添加到缓存
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT:Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.

                        // 该响应是数据流， 因此主体只能使用一次。 
                        // 由于我们想要返回能被浏览器使用的响应，并将其传递到缓存以供使用，
                        // 因此需要克隆一份副本。我们将一份发送给浏览器，另一份则保留在缓存。
                        var responseToCache = response.clone();

                        caches.open(cacheStorageKey)
                            .then(function (cache) {
                                cache.put(e.request, responseToCache);
                            });

                        return response;
                    }
                );
            }).catch(e => {
                // 当请求没有匹配到缓存中的任何资源的时候，以及网络不可用的时候，我们的请求依然会失败。让我们提供一个默认的回退方案以便不管发生了什么，用户至少能得到些东西
                console.log(e.message);
                return caches.match('/gallery/myLittleVader.jpg');
            })
    );
});
