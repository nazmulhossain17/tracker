import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  register: (name: string, employeeId: string, department: string, password: string) =>
    ipcRenderer.invoke('auth-register', { name, employeeId, department, password }),
  login: (employeeId: string, password: string) =>
    ipcRenderer.invoke('auth-login', { employeeId, password }),
  logout: () => ipcRenderer.invoke('auth-logout'),
  getAuthToken: () => ipcRenderer.invoke('get-auth-token'),
  startTracking: () => ipcRenderer.invoke('start-tracking'),
  stopTracking: () => ipcRenderer.invoke('stop-tracking'),
  getTrackingStatus: () => ipcRenderer.invoke('get-tracking-status'),
  onScreenshotTaken: (callback: (data: { filename: string; filepath: string }) => void) => {
    ipcRenderer.on('screenshot-taken', (_event, data) => callback(data))
  },
})
