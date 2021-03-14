/* 
打开数据库
启动事务
打开对象存储
在对象存储中完成操作
*/


// 定义global对象 因为indexedDB的代码需要在浏览器和Service Worker两个环境下运行
const _global = typeof window === 'undefined' ? self : window

// 打开数据库
// 如果indexedDB已经存在，window.indexedDB.open方法不会重新创建，只会打开那个已经创建好的数据库。window.indexedDB.open方法的第二个个参数是数据库版本号。
// onupgradeneeded只会在数据库版本升级的时候执行，用来创建对象存储。
const openDataBase = function () {
    return new Promise((resolve, reject) => {
        const request = _global.indexedDB.open('conent-db', 1)
        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains('list')) {
                db.createObjectStore('list', {
                    keyPath: 'id',
                    autoIncrement: true
                })
            }
        }
        request.onerror = (err) => reject(err)
        request.onsuccess = (event) => resolve(event.target.result)
    })
}

// 启动事务
const openObjectStore = async function (storeName, mode) {
    const db = await openDataBase()
    return db.transaction(storeName, mode).objectStore(storeName)
}

_global.db = {
    set: async function (content) {
        // 打开数据存储
        const objectStore = await openObjectStore('list', 'readwrite')
        // 新增数据
        return objectStore.add({ content })
    },

    getAll: async function () {
        // 打开数据存储
        const objectStore = await openObjectStore('list')
        return new Promise((resolve) => {
            const data = []
            // 根据游标查询数据
            // 我们在创建数据库的时候使用autoIncrement设置自增主键，所以需要通过游标查询所有的数据
            objectStore.openCursor().onsuccess = function (event) {
                const cursor = event.target.result
                if (!cursor) {
                    return resolve(data)
                } else {
                    data.push(cursor.value)
                    cursor.continue()
                }
            }
        })
    },

    clear: async function (ids) {
        // 打开数据存储
        const objectStore = await openObjectStore('list', 'readwrite')
        // 清空对象
        return objectStore.clear()
    }
}
