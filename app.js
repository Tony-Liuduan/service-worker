const Koa = require('koa');
const staticServer = require('koa-static');
const path = require('path');
const cors = require('@koa/cors');


process.on('uncaughtException', (err) => {
    console.log('uncaughtException: ', err);
    throw err;
});

process.on('unhandledRejection', function (err) {
    console.log('unhandledRejection', err);
});


const app = new Koa();

app.use(cors());

// err handler middleware
app.use(async function (ctx, next) {
    try {
        await next();
    } catch (err) {
        console.log('err handler middleware', err);
    }
});

// handle favicon
app.use(async function filterFavicon(ctx, next) {
    let isFavicon = /\/favicon\.ico$/.test(ctx.path);

    // in case favicon, break middleware chain
    if (isFavicon) {
        ctx.body = '';
        return;
    }

    await next();
});


// 静态资源目录
app.use(staticServer(path.join(__dirname, 'static')));


app.use(async function router(ctx, next) {
    let isApiTest = /api\/test/.test(ctx.path);

    if (isApiTest) {
        const response = { errCode: 0 };
        const date = new Date();
        const hour = date.getHours();
        const minutes = date.getMinutes();
        const second = date.getSeconds();
        const time = `${hour}:${minutes}:${second}`;
        console.log('请求成功！参数:', ctx.path, '返回值:', response, '时间:', time)
        ctx.body = response;
        return;
    }

    await next();
});


app.listen('9999');
