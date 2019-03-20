const Koa = require('koa');
const staticServer = require('koa-static');
const path = require('path');


process.on('uncaughtException', (err) => {
    console.log('uncaughtException: ', err);
    throw err;
});

process.on('unhandledRejection', function (err) {
    console.log('unhandledRejection', err);
});


const app = new Koa();

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



app.listen('9999');
