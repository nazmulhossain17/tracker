import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Square, Images, X, Download } from 'lucide-react'

interface Screenshot {
  filename: string
  mtime: number
  size: number
  url: string
}

function App() {
  const [isTracking, setIsTracking] = useState(false)
  const [screenshotCount, setScreenshotCount] = useState(0)
  const [lastScreenshot, setLastScreenshot] = useState<string>('')
  const [isDesktop, setIsDesktop] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const inElectron = !!window.electronAPI || /\bElectron\b/i.test(navigator.userAgent)
    setIsDesktop(inElectron)

    if (inElectron && window.electronAPI) {
      window.electronAPI.getTrackingStatus().then(({ isTracking }) => {
        setIsTracking(isTracking)
      })

      window.electronAPI.onScreenshotTaken((data) => {
        setScreenshotCount((prev) => prev + 1)
        setLastScreenshot(data.filename)
      })
    }
  }, [])

  const handleStartTracking = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.startTracking()
      if (result.success) {
        setIsTracking(true)
        setScreenshotCount(0)
      }
    }
  }

  const handleStopTracking = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.stopTracking()
      if (result.success) {
        setIsTracking(false)
      }
    }
  }

  const fetchScreenshots = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/screenshots')
      const data = await response.json()
      setScreenshots(data)
    } catch (error) {
      console.error('Failed to fetch screenshots:', error)
      setScreenshots([])
    } finally {
      setLoading(false)
    }
  }

  const handleShowGallery = () => {
    setShowGallery(true)
    fetchScreenshots()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1" />
            <div className="flex justify-center flex-1">
              <div className="p-4 bg-slate-900 rounded-full">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              {!isDesktop && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowGallery}
                  className="text-xs"
                >
                  <Images className="mr-1 h-4 w-4" />
                  Gallery
                </Button>
              )}
            </div>
          </div>
          <CardTitle className="text-3xl">Screenshot Tracker</CardTitle>
          <CardDescription>
            Automatically capture screenshots every 30 seconds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isDesktop ? (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="p-4 bg-slate-100 rounded-full">
                <Camera className="w-8 h-8 text-slate-400" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-slate-700">
                  Desktop App Required
                </p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Screenshot tracking is only available in the desktop application.
                  Please download and install the desktop app to use this feature.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
                  </span>
                </div>

                {isTracking ? (
                  <Button
                    onClick={handleStopTracking}
                    variant="destructive"
                    size="lg"
                    className="w-full"
                  >
                    <Square className="mr-2 h-5 w-5" />
                    Stop Tracker
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartTracking}
                    size="lg"
                    className="w-full"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Start Tracker
                  </Button>
                )}
              </div>

              {isTracking && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Screenshots Captured:</span>
                      <span className="font-semibold">{screenshotCount}</span>
                    </div>
                    {lastScreenshot && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Last Screenshot:</span>
                        <span className="font-mono text-xs text-slate-500 truncate max-w-xs">
                          {lastScreenshot}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  Screenshots are saved in the screenshots folder
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showGallery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Screenshot Gallery</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGallery(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                View all captured screenshots
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <p className="text-slate-500">Loading screenshots...</p>
                </div>
              ) : screenshots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <Camera className="w-12 h-12 text-slate-300" />
                  <p className="text-slate-500">No screenshots yet</p>
                  <p className="text-xs text-slate-400">
                    Screenshots will appear here once captured
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {screenshots.map((screenshot) => (
                    <div
                      key={screenshot.filename}
                      className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-video bg-slate-100 relative">
                        <img
                          src={screenshot.url}
                          alt={screenshot.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3 space-y-2">
                        <p className="text-xs font-mono text-slate-600 truncate">
                          {screenshot.filename}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(screenshot.mtime).toLocaleString()}
                        </p>
                        <a
                          href={screenshot.url}
                          download={screenshot.filename}
                          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default App
