export interface ElectronAPI {
  startTracking: () => Promise<{ success: boolean; message: string }>
  stopTracking: () => Promise<{ success: boolean; message: string }>
  getTrackingStatus: () => Promise<{ isTracking: boolean }>
  onScreenshotTaken: (callback: (data: { filename: string; filepath: string }) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
