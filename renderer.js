const { ipcRenderer } = require('electron');

// Initialize parallax
var scene = document.getElementById('scene');
var parallax = new Parallax(scene);
ipcRenderer.send('parallax_initialized');

