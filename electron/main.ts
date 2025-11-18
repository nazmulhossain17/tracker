import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import screenshot from 'screenshot-desktop'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let screenshotInterval: NodeJS.Timeout | null = null
let isTracking = false
let authToken: string | null = null
let currentUser: any = null

const API_BASE_URL = 'http://localhost:4000'
const screenshotsDir = path.join(process.cwd(), 'screenshots')

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function uploadScreenshotToBackend(imageBuffer: Buffer, filename: string) {
  if (!authToken) {
    console.error('No auth token available')
    return false
  }

  try {
    const FormData = (await import('form-data')).default
    const formData = new FormData()
    formData.append('file', imageBuffer, filename)

    const response = await fetch(`${API_BASE_URL}/api/activity/screenshot`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData as any,
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Screenshot uploaded successfully:', data)
      return true
    } else {
      const error = await response.text()
      console.error('Failed to upload screenshot:', error)
      return false
    }
  } catch (error) {
    console.error('Error uploading screenshot:', error)
    return false
  }
}

async function takeScreenshot() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `screenshot-${timestamp}.png`
    const filepath = path.join(screenshotsDir, filename)

    const img = await screenshot()
    fs.writeFileSync(filepath, img)

    console.log(`Screenshot saved locally: ${filename}`)
    
    const uploaded = await uploadScreenshotToBackend(img, filename)
    
    if (mainWindow) {
      mainWindow.webContents.send('screenshot-taken', { 
        filename, 
        filepath,
        uploaded 
      })
    }
  } catch (error) {
    console.error('Error taking screenshot:', error)
  }
}

function startTracking() {
  if (isTracking) return

  isTracking = true
  takeScreenshot()
  
  screenshotInterval = setInterval(() => {
    takeScreenshot()
  }, 30000)

  console.log('Tracking started')
}

function stopTracking() {
  if (!isTracking) return

  isTracking = false
  
  if (screenshotInterval) {
    clearInterval(screenshotInterval)
    screenshotInterval = null
  }

  console.log('Tracking stopped')
}

ipcMain.handle('auth-register', async (_event, { name, employeeId, department, password }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, employeeId, department, password }),
    })

    const data = await response.json()

    if (response.ok) {
      authToken = data.token
      currentUser = data.user
      return { success: true, token: data.token, user: data.user }
    } else {
      return { success: false, error: data.error || 'Registration failed' }
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Network error' }
  }
})

ipcMain.handle('auth-login', async (_event, { employeeId, password }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId, password }),
    })

    const data = await response.json()

    if (response.ok) {
      authToken = data.token
      currentUser = data.user
      return { success: true, token: data.token, user: data.user }
    } else {
      return { success: false, error: data.error || 'Login failed' }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Network error' }
  }
})

ipcMain.handle('auth-logout', () => {
  authToken = null
  currentUser = null
  stopTracking()
  return { success: true }
})

ipcMain.handle('get-auth-token', () => {
  return { token: authToken, user: currentUser }
})

ipcMain.handle('start-tracking', () => {
  if (!authToken) {
    return { success: false, message: 'Not authenticated' }
  }
  startTracking()
  return { success: true, message: 'Tracking started' }
})

ipcMain.handle('stop-tracking', () => {
  stopTracking()
  return { success: true, message: 'Tracking stopped' }
})

ipcMain.handle('get-tracking-status', () => {
  return { isTracking }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopTracking()
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', () => {
  stopTracking()
})
