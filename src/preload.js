// Preload Script (preload.js)
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  submitOrder: (args) => ipcRenderer.invoke("submitOrder", args),
});
