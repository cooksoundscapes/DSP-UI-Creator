const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')

ipcMain.on('testCH', (event, arg) => {
  console.log(arg) // prints "ping"
  //event.reply('asynchronous-reply', 'pong')
})

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