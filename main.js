const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path')
const isDev = process.env.ELECTRON_DEVELOPMENT;

function createWindow() {
    const window = new BrowserWindow({
        width: 1024,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    }) 
    isDev ? window.loadURL('http://localhost:8080') :
            window.loadFile('build/index.html') 
    window.once('ready-to-show', () => {
        window.show()
    })
    window.maximize()
}

!isDev ? Menu.setApplicationMenu(null) : null;

app.whenReady().then( () => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('askCookie', (event, arg) => {
    console.log(arg);
    event.reply('sendCookie', 'main process responding.. ok!')
})