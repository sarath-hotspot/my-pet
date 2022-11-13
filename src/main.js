const { app, BrowserWindow, ipcMain, Tray, Menu, crashReporter  } = require('electron');
const Positioner = require('electron-positioner');
const electron  = require('electron');
const path = require('path');
const { time } = require('console');
const AutoLaunch = require('auto-launch');
const log = require('electron-log');

let tray = null; 

const APP_NAME = "MyPet";

// We get timer notification for every THIS milli seconds(10 seconds).
const TIMER_PERIOD_MS = 10 * 1000; 

// We ask user to take rest if she is active for this period(10 minutes)
const ACTIVITY_PERIOD_MS = 10 * 60 * 1000;

let petWindow = undefined;
let timerState = {};

const createWindow = () => {
    petWindow = new BrowserWindow({
        frame: false,
        transparent: true,
        height: 250,
        width: 300,
        alwaysOnTop: true,
        webPreferences : {
            preload: path.join(__dirname, "preload.js")
        }
    });
    const positioner = new Positioner(petWindow);
    positioner.move('bottomRight');
    petWindow.loadFile('src/index.html');
};

const timerCallback = () => {
    if (timerState.lastIdleTime === undefined) {
        timerState.lastIdleTime = new Date();
    }
    if (timerState.disable === undefined)
    {
        timerState.disabled = false;
    }
    if (timerState.disable === true)
    {
        return;
    }

    let lastIdleTime = timerState.lastIdleTime;

    const currentIdleState = electron.powerMonitor.getSystemIdleState(TIMER_PERIOD_MS);
    log.info(`Timer callback: status=${currentIdleState}`);
    if (currentIdleState === 'idle') {
        timerState.lastIdleTime = new Date();
    }
    else if (currentIdleState == 'active') {
        let diffInSecs = new Date().getTime()  - lastIdleTime.getTime();
        if (diffInSecs > ACTIVITY_PERIOD_MS)
        {
            log.info("Trigger window");
            createWindow();
            timerState.disable = true;
        }
    }
};

const setupTray = () =>  {
    log.info("Setup tray");
    const iconPath = path.join(__dirname, "/images/icon.png");
    tray = new Tray(iconPath);
    log.info("setup tray done");
    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Quit', 
            type: 'normal', 
            click: () => { 
                app.quit();
            } 
        },
      ])
      tray.setToolTip('Your dog friend.')
      tray.setContextMenu(contextMenu)
};

const setupAutoLaunch = () => {
    let autoLaunch = new AutoLaunch({
        name: APP_NAME,
        path: app.getPath('exe'),
      });
      autoLaunch.isEnabled().then((isEnabled) => {
        if (!isEnabled) autoLaunch.enable();
      });
};

app.on('ready', _ => {
    setupAutoLaunch();
    setupTray();
    setInterval(() => {
        // If user is active for last 10 minutes, 
        // open window.
        timerCallback();
    }, 
    TIMER_PERIOD_MS);
});


app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        // app.quit();
    }
});

ipcMain.on('exitButton-clicked', () => {
    if (petWindow !== undefined)
    {
        petWindow.close();
        timerState.disable = false;
        timerState.lastIdleTime = new Date();
    }
    // app.quit();
});


crashReporter.start({
    uploadToServer: false
});