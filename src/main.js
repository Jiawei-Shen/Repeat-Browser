// import './App.scss';
// import './global.css';
import App from './App.svelte';

// const app = new App({target: document.body});
// window.app = app;

// const app = new App({
//     target: document.getElementById("app"),
//     hydrate: true
// });

const app = new App({
    target: document.body,
});
window.app = app;

export default app;