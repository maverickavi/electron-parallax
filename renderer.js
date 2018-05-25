const { ipcRenderer } = require("electron");

// Listen to the error events from the main and renderer threads
ipcRenderer.on("error", function(e, data) {
  // Log the info
  console.log("Error message ->", data);
  document.querySelector("#error").classList.remove("is-hidden");
  document.querySelector("#error-body").innerHTML = data;
});

// Listen to the ports data event and populate the COM select picker
ipcRenderer.on("ports_data", function(e, data) {
  let portValues;
  // Log the info
  console.log("Port Data ->", data);
  if (data && data.length) {
    data.forEach(p => {
      portValues += `<option value="${p.comName}">${p.comName}</option>`;
    });
    document.querySelector("#error").classList.add("is-hidden");
    document.querySelector("#ports").innerHTML = `
            <select id="ports-list" name="ports">
                ${portValues}
            </select>
        `;
  }
});

ipcRenderer.on("port_open", function() {
  console.log("Port Opened!");
  // Initialize parallax
  document.querySelector(".serial-port").classList.add("is-hidden");
  document.querySelector(".container-parallax").classList.remove("is-hidden");
  var scene = document.getElementById("scene");
  var parallax = new Parallax(scene);
  ipcRenderer.send("parallax_initialized");
});

// Add submit even handler for port selection
document.querySelector("#port-select").addEventListener("submit", function(e) {
  e.preventDefault();
  e.stopPropagation();
  document.querySelector("#error").classList.add("is-hidden");
  ipcRenderer.send(
    "port_selected",
    document.querySelector("#ports-list").value
  );
});

// Notify the main thread to start the app
ipcRenderer.send("app_start");
