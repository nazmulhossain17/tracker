import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['screenshot-desktop', 'electron', 'path', 'fs', 'url'],
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
      },
    ]),
    renderer(),
    {
      name: 'screenshot-api',
      configureServer(server) {
        const screenshotsDir = path.resolve(process.cwd(), 'screenshots')

        server.middlewares.use('/api/screenshots', async (req, res) => {
          if (req.method !== 'GET') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          try {
            if (!fs.existsSync(screenshotsDir)) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify([]))
              return
            }

            const files = fs.readdirSync(screenshotsDir)
            const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
            
            const screenshots = files
              .filter(file => imageExtensions.some(ext => file.toLowerCase().endsWith(ext)))
              .map(filename => {
                const filepath = path.join(screenshotsDir, filename)
                const stats = fs.statSync(filepath)
                return {
                  filename,
                  mtime: stats.mtime.getTime(),
                  size: stats.size,
                  url: `/screenshots/${filename}`
                }
              })
              .sort((a, b) => b.mtime - a.mtime)

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(screenshots))
          } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to list screenshots' }))
          }
        })

        server.middlewares.use('/screenshots', (req, res) => {
          if (req.method !== 'GET') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          const filename = req.url?.substring(1) || ''
          
          if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            res.statusCode = 400
            res.end('Invalid filename')
            return
          }

          const filepath = path.join(screenshotsDir, filename)
          
          if (!filepath.startsWith(screenshotsDir)) {
            res.statusCode = 403
            res.end('Forbidden')
            return
          }

          if (!fs.existsSync(filepath)) {
            res.statusCode = 404
            res.end('Not Found')
            return
          }

          const ext = path.extname(filename).toLowerCase()
          const contentTypes: Record<string, string> = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
          }

          res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream')
          fs.createReadStream(filepath).pipe(res)
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
