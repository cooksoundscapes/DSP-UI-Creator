const {contextBridge, ipcRenderer} = require('electron')
const {UDPPort} = require('osc')
const dgram = require('dgram');

const oscPort = new UDPPort({
    localAddress: 'localhost',
    localPort: 4445
})
oscPort.open()

oscPort.on('ready', () => {
    ipcRenderer.send('oscSink', "Listening OSC messages on port 4445")
})

const audio_port = 5678

const audio_server = dgram.createSocket('udp4');
audio_server.bind(audio_port)

audio_server.on('listening', () => {
    console.log(`listening on localhost:${audio_port}`)
})

contextBridge.exposeInMainWorld('electron', {
    //switch to the invoke method
    manageFiles: request => new Promise( (resolve, reject) => {
        ipcRenderer.on('responseFS', (event, arg) => {
            if (arg instanceof Error) reject(arg);
            else resolve(arg);
        });
        ipcRenderer.send('requestFS', request);
    }),
    receiveOSC: callback => {
        oscPort.removeAllListeners('message')
        oscPort.on('message', (msg, timetag, address) => callback({msg, timetag, address}))
    },
    sendOSC: (path, val, address) => {
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
    },
    listenToAudio: callback => {
        audio_server.on('message', (msg,info) => callback(msg,info))
    },
    removeAudioListeners: () => audio_server.removeAllListeners()
})