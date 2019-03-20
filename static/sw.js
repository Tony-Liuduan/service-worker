
var cacheStorageKey = 'v1';
var cacheList = [
    // 注册成功后要立即缓存的资源列表
    '/index.css',
    '/app.js',
    '/mock.js',
    '/gallery/star-wars-logo.jpg',
    '/gallery/bountyHunters.jpg',
    '/gallery/myLittleVader.jpg',
    '/gallery/snowTroopers.jpg'
]
// console.log(this === self) // true 



// 当浏览器解析完 SW 文件时触发 install 事件
this.addEventListener('install', function (e) {
    console.log('addEventListener install')
    // install 事件中一般会将 cacheList 中要换存的内容通过 addAll 方法，请求一遍放入 caches 中
    // 我们使用了 caches.open() 方法来创建了一个叫做 v1 的新的缓存，将会是我们的站点资源缓存的第一个版本。
    // waitUntil 确保Service Worker 不会在 waitUntil() 里面的代码执行完毕之前安装完成
    // caches 一个 service worker 上的全局对象，它使我们可以存储网络响应发来的资源，并且根据它们的请求来生成key
    e.waitUntil(
        caches.open(cacheStorageKey)
            .then(function (cache) {
                return cache.addAll(cacheList)
            })
    );
});


// 激活时触发 activate 事件，当安装成功完成之后， service worker 就会激活
// 当之前版本还在运行的时候，一般被用来做些会破坏它的事情，比如摆脱旧版的缓存。在避免占满太多磁盘空间清理一些不再需要的数据的时候也是非常有用的，每个浏览器都对 service worker 可以用的缓存空间有个硬性的限制。浏览器尽力管理磁盘空间，但它可能会删除整个域的缓存。浏览器通常会删除域下面的所有的数据。
this.addEventListener('activate', function (e) {
    console.log('addEventListener activate')
    // 传给 waitUntil() 的 promise 会阻塞其他的事件，直到它完成。所以你可以确保你的清理操作会在你的的第一次 fetch 事件之前会完成。
    // active 事件中通常做一些过期资源释放的工作，匹配到就从 caches 中删除

    e.waitUntil(
        caches.keys().then(function (keyList) {
            console.log(keyList);
            return Promise.all(keyList.map(function (key) {
                if (key === cacheStorageKey) {
                    return caches.delete(key);
                } else {
                    return Promise.resolve();
                }
            }));
        })
    );
});



this.addEventListener('fetch', function (e) {
    console.log(e.request);
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
                // 如果没有匹配资源呢？如果我们不提供任何错误处理，promise 就会 reject，同时也会出现一个网络错误。
                // 如果 promise reject了， catch() 函数会执行默认的网络请求，意味着在网络可用的时候可以直接像服务器请求资源。
                console.log(response)
                return response || fetch(e.request).then(function (response) {
                    // 把请求到的资源保存到缓存中，以便将来离线时所用
                    // caches.open('v1') 来抓取我们的缓存，它也返回了一个 promise
                    return caches.open('v1').then(function (cache) {
                        // 这个 promise 成功的时候， cache.put() 被用来把这些资源加入缓存中
                        // 资源是从  e.request 抓取的，它的响应会被  response.clone() 克隆一份然后被加入缓存
                        // 为什么要这样做？这是因为请求和响应流只能被读取一次。为了给浏览器返回响应以及把它缓存起来，我们不得不克隆一份。所以原始的会返回给浏览器，克隆的会发送到缓存中。它们都是读取了一次。
                        cache.put(e.request, response.clone());
                        return response;
                    });
                });
            }).catch(e => {
                // 当请求没有匹配到缓存中的任何资源的时候，以及网络不可用的时候，我们的请求依然会失败。让我们提供一个默认的回退方案以便不管发生了什么，用户至少能得到些东西
                console.log(e.message);
                return caches.match('/gallery/myLittleVader.jpg');
            })
    );
});
