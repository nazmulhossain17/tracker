import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  startTracking: () => ipcRenderer.invoke('start-tracking'),
  stopTracking: () => ipcRenderer.invoke('stop-tracking'),
  getTrackingStatus: () => ipcRenderer.invoke('get-tracking-status'),
  onScreenshotTaken: (callback: (data: { filename: string; filepath: string }) => void) => {
    ipcRenderer.on('screenshot-taken', (_event, data) => callback(data))
  },
})
