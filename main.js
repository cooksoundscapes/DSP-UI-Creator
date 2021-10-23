const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.ELECTRON_DEVELOPMENT;
const homeFolder = app.getPath('home');

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
            defaultPath: homeFolder,
            properties: ['openFile'],
            filters: [
                {name:"JSON files", extensions:['json']}
            ]
        }
        dialog.showOpenDialog(loadOptions).then( files => {
            const {filePaths} = files;
            fs.readFile(filePaths[0], 'utf-8', (err, content) => {
                if (err) event.reply('responseFS', err);
                else event.reply('responseFS', [content, filePaths[0]])
            })
        }).catch( err => event.reply('responseFS', err))

    } else if (req == 'save-warning') {
        const warningOptions = {
            title: 'Save warning:',
            message: 'Save before close this project?',
            type: 'question',
            cancelId: 2,
            buttons: ['yes', 'no', 'cancel']
        }
        dialog.showMessageBox(warningOptions).then( choice => {
            const {response} = choice;
            event.reply('responseFS', response)
        }).catch( err => event.reply('responseFS', err))
        
    } else if (req.length == 2) {
        fs.writeFile(req[1]+'.json', req[0], err => {
            if (err) event.reply('responseFS', err)
            else event.reply('responseFS', req[1]) 
        })
    } else {
        const saveOptions = {
            title: 'Name & save your project',
            defaultPath: homeFolder
        };
        dialog.showSaveDialog(saveOptions).then( pathObj => {
            const {filePath} = pathObj;
            fs.writeFile(filePath+'.json', req, err => {
                if (err) event.reply('responseFS', err)
                else event.reply('responseFS', filePath) 
            })
        }).catch( err => event.reply('responseFS', err))
    }
})