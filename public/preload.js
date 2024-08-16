const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('dialogAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile')
})

contextBridge.exposeInMainWorld('gitAPI', {
  getGitStatus: (filePath) => ipcRenderer.invoke('getGitStatus', filePath)

})
contextBridge.exposeInMainWorld('getDiff', {
  getDiff :(hash1,hash2,filePath) => ipcRenderer.invoke('getDiff', hash1,hash2,filePath)

})
contextBridge.exposeInMainWorld('clipAPI', {
  getClipBoard: () => ipcRenderer.invoke('getClipBoard')
})
contextBridge.exposeInMainWorld('fileAPI', {
  getFileExists: (filePath) => ipcRenderer.invoke('getFileExists', filePath)
})
