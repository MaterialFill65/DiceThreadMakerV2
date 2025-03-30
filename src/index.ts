import { App } from "./app";

// アプリケーションの初期化
const appElement = document.querySelector<HTMLDivElement>('#screen');
if (appElement) {
    new App(appElement);
}