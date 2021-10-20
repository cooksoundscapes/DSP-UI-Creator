const { app, BrowserWindow } = require('electron');
const path = require('path')

function createWindow() {
    const window = new BrowserWindow({
        width: 1024,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })    
    window.loadURL('http://localhost:1234')
    window.once('ready-to-show', () => {
        window.show()
    })
    window.maximize()
}

app.whenReady().then( () => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})