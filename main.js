const electron = require('electron');
const { app, BrowserWindow } = require('electron')
let win;

var subpy;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000, 
    height: 600,
    backgroundColor: '#043564',
    icon: `file://${__dirname}/dist/assets/logo.png`,
    resizable: false
  })


    win.loadURL(`file://${__dirname}/dist/index.html`)
    //win.loadURL('http://localhost:5000');
    //win.webContents.openDevTools();
    win.on('closed', function() {
      win = null;
      subpy.kill('SIGINT');
    });
  // win.webContents.openDevTools()

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  })
}

// Create window on electron intialization
app.on('ready', function() {
    // call python?
  subpy = require('child_process').spawn('python', ['./python/init.py']);
  //var subpy = require('child_process').spawn('./dist/hello.exe');
  var rq = require('request-promise');
  var mainAddr = 'http://127.0.0.1:5000';
  createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
})