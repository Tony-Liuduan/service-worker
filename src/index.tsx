import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import App from './app';
import 'antd/dist/antd.css';
import './db.js';

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        if (!navigator.serviceWorker.controller) {
            try {
                navigator.serviceWorker.register('serviceworker.js')
            } catch (err) {
                throw Error(err)
            }
        }

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            alert('controllerchange');
            window.location.reload()
        })
    })

    navigator.serviceWorker.ready.then((registration) => {
        // document.getElementById('submit').addEventListener('click', () => {
        //     alert('send message');
        //     // 在断网的时候，点击按钮，服务器不会收到请求。当设备恢复网络的时候，服务器会马上收到请求
        //     registration.sync.register('send-messages');
        // });
        document.getElementById('submit').addEventListener('click', async () => {
            const content = 'testIndexedDB';
            await ((window as any).db as any).set(content)
            registration.sync.register(`send-messages`)
        })
    });
}

ReactDOM.render(
    <ConfigProvider locale={zhCN}>
        <BrowserRouter basename='/'>
            <Switch>
                <Route component={App} />
            </Switch>
        </BrowserRouter>
    </ConfigProvider>,
    document.getElementById('root'),
);
