const {contextBridge, ipcRenderer} = require('electron')
const {UDPPort} = require('osc')

let oscPort = new UDPPort({
    localAddress: 'localhost',
    localPort: 4445
})
oscPort.open()

contextBridge.exposeInMainWorld('electron', {
    manageFiles: request => new Promise( (resolve, reject) => {
        ipcRenderer.on('responseFS', (event, arg) => {
            if (arg instanceof Error) reject(arg);
            else resolve(arg);
        });
        ipcRenderer.send('requestFS', request);
    }),
    sendOSC: (path, val, address ) => {
        let args;
        if (Array.isArray(val)) {
            args = val.map( item => ({
                type: typeof(item) == 'number' ? 'f' : 's',
                value: item
            }))
        } else {
            args = [{
                type: typeof(val) == 'number' ? 'f' : 's',
                value: val
            }]
        }
        oscPort.send({
            address: path,
            args: args
        }, address[0], address[1])
    },
    changeReceivePort: (addr, newPort) => {
        oscPort = new UDPPort({
            localAddress: addr,
            localPort: newPort
        })
        oscPort.open()
    }
})