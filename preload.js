const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  validateUrl: (url) => ipcRenderer.invoke("validate-url", url),

  getVideoTitle: (url) => ipcRenderer.invoke("get-video-title", url),

  downloadMp3: (url, outputPath) =>
    ipcRenderer.invoke("download-mp3", url, outputPath),

  getDownloadsFolder: () => ipcRenderer.invoke("get-downloads-folder"),

  openFile: (filePath) => ipcRenderer.invoke("open-file", filePath),

  onProgress: (callback) =>
    ipcRenderer.on("download-progress", (_, data) => callback(data)),
});
