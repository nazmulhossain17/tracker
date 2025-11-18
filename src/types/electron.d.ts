export interface ElectronAPI {
  register: (name: string, employeeId: string, department: string, password: string) => Promise<{ success: boolean; token?: string; user?: any; error?: string }>
  login: (employeeId: string, password: string) => Promise<{ success: boolean; token?: string; user?: any; error?: string }>
  logout: () => Promise<{ success: boolean }>
  getAuthToken: () => Promise<{ token: string | null; user: any | null }>
  startTracking: () => Promise<{ success: boolean; message: string }>
  stopTracking: () => Promise<{ success: boolean; message: string }>
  getTrackingStatus: () => Promise<{ isTracking: boolean }>
  onScreenshotTaken: (callback: (data: { filename: string; filepath: string; uploaded?: boolean }) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
