const { app, BrowserWindow, ipcMain } = require('electron');
const Positioner = require('electron-positioner');
const electron  = require('electron');
const path = require('path');
const createWindow = () => {
    const mainWindow = new BrowserWindow({
        frame: false,
        transparent: true,
        height: 250,
        width: 300,
        alwaysOnTop: true,
        webPreferences : {
            preload: path.join(__dirname, "preload.js")
        }
    });
    const positioner = new Positioner(mainWindow);
    positioner.move('bottomRight');
    mainWindow.loadFile('src/index.html');
    // mainWindow.loadURL(`file://${__dirname}/index.html`);
};

app.on('ready', _ => {
    createWindow();
    let lastIdleTime = Date();
    setInterval(() => {
        // If user is active for last 10 minutes, 
        // open window.
        const idleState = electron.powerMonitor.getSystemIdleState(10);
        console.log(idleState);
    }, 
    10000);
});

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

ipcMain.on('exitButton-clicked', () => {
    console.log('exit received');
    app.quit();
});

