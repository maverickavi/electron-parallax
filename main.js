const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
var SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
var port = new SerialPort('/dev/cu.SLAB_USBtoUART', {
  baudRate: 9600
}); 

const parser = new Readline(); 
port.pipe(parser); 
parser.on('data', console.log);
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({ width: 800, height: 600 })

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// Switches the port into "flowing mode"
// port.on('data', function (data) {
//     console.log('Data:', data.toJSON());
// });
   
  // Read data that is available but keep the stream from entering "flowing mode"
// port.on('readable', function () {
//     var data = port.read(8);
//     console.log(data ? data.toString() : '');
// });
