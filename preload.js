const { contextBridge, ipcRenderer } = require('electron');
const Store = require('electron-store');

const store = new Store();

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});

contextBridge.exposeInMainWorld('electron', {
    setSettings: settings => {
        store.set('settings', settings);
        console.log(store.get('unicorn'));
    },
    getSettings: () => {
      ipcRenderer.send(store.get('settings'));
    },
});
