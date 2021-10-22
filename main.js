const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
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

ipcMain.on('requestFS', (event, req) => {
    if (req == 'load') {
        const loadOptions = {
            title: 'Choose JSON File',
            properties: ['openFile',]
        }
        dialog.showOpenDialog(loadOptions).then( files => {
            const {filePaths} = files;
            fs.readFile(filePaths[0], 'utf-8', (err, content) => {
                if (err) event.reply('responseFS', err);
                else event.reply('responseFS', content)
            })
        })
    } else {
        dialog.showSaveDialog({title: 'Name & save your project'}).then( pathObj => {
            const {filePath} = pathObj;
            fs.writeFile(filePath+'.json', req, err => {
                if (err) event.reply('responseFS', err)
                else event.reply('responseFS', 'file saved successfully.') 
            })
        })
    }
})