import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Square } from 'lucide-react'

function App() {
  const [isTracking, setIsTracking] = useState(false)
  const [screenshotCount, setScreenshotCount] = useState(0)
  const [lastScreenshot, setLastScreenshot] = useState<string>('')
  const [isDesktop, setIsDesktop] = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-slate-900 rounded-full">
              <Camera className="w-8 h-8 text-white" />
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
    </div>
  )
}

export default App
