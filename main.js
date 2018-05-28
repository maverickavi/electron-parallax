const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
var SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, winSize;
let step = 0;
let isParallaxed = false;

let diff, prevValue, presValue, i;
prevValue = 0;
diff = 0;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 300 });
  winSize = win.getSize();

  // and load the index.html of the app.
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  // Open the DevTools.
//   win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.on("resize", () => {
    winSize = win.getSize();
    i = Math.floor(winSize[0] / 2);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

ipcMain.on("port_selected", (e, data) => {
  // Try to open the selected port
  try {
    var port = new SerialPort(data, {
      baudRate: 9600
    });
    const parser = new Readline();
    port.pipe(parser);
    // Throw error to the UI
    port.on("error", err => {
      e.sender.send("error", err.toString());
    });
    port.on("open", () => {
        e.sender.send("port_open");
    });
    // Move
    parser.on("data", data => {
        // Do your processing here.
        // console.log(data);
        if(isParallaxed) {
            // DO stuff
            let x;
            step = Math.floor(winSize[0] / 300);
            diff = (Math.floor(data * step) - i);
            // if(diff > 0) {
            //     x = i + step;
            // } else {
            //     x = i - step;
            // }
            x = i + (diff * 1.5);
            win.webContents.sendInputEvent({ type: 'mouseMove', x: x, y: Math.floor(winSize[1] / 2) });
        }
    });
  } catch (err) {
    e.sender.send("error", err.toString());
  }
});

ipcMain.on("app_start", e => {
  SerialPort.list()
    .then(ports => {
      e.sender.send("ports_data", ports);
    })
    .catch(err => {
      e.sender.send("error", err.toString());
    });
});

ipcMain.on("parallax_initialized", () => {
    i = Math.floor(winSize[0] / 2);    
    isParallaxed = true;
});
