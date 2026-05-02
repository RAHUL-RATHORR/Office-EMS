const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getIdleTime: () => ipcRenderer.invoke('get-idle-time'),
  send: (channel, data) => {
    let validChannels = ['start-monitoring', 'stop-monitoring'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});
