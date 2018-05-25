const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
var SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, winSize;
const step = 40;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600 });
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
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.on("resize", () => {
    winSize = win.getSize();
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
        console.log(data);
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
  let i = 400;
  let rev = false;
  // Simulate mouse move
  setInterval(function() {
    // Get window size
    console.log("Window Size -->", winSize);
    console.log("Mouse X index -->", i);
    win.webContents.sendInputEvent({
      type: "mouseMove",
      x: i,
      y: Math.floor(winSize[1] / 2)
    });
    if (i >= winSize[0]) {
      rev = true;
    } else if (i <= 0) {
      rev = false;
    }
    i = rev ? i - step : i + step;
  }, 100);
});
