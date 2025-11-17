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
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function takeScreenshot() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `screenshot-${timestamp}.png`
    const filepath = path.join(screenshotsDir, filename)

    const img = await screenshot()
    fs.writeFileSync(filepath, img)

    console.log(`Screenshot saved: ${filename}`)
    
    if (mainWindow) {
      mainWindow.webContents.send('screenshot-taken', { filename, filepath })
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

ipcMain.handle('start-tracking', () => {
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
