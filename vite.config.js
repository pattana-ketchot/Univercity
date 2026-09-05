import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

// Runs api/*.js Vercel Functions inside the Vite dev server, so `npm run dev`
// can hit /api routes without needing `vercel dev` locally. Not used in
// production — Vercel runs api/*.js directly as functions there.
function vercelApiDevMiddleware() {
  return {
    name: 'vercel-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()

        try {
          const routeName = req.url.split('?')[0].replace('/api/', '')
          const filePath = path.join(process.cwd(), 'api', `${routeName}.js`)
          // Cache-busting query so edits to api/*.js are picked up without restarting Vite
          const mod = await import(`${pathToFileURL(filePath).href}?t=${Date.now()}`)

          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const body = chunks.length ? Buffer.concat(chunks) : undefined

          const request = new Request(new URL(req.url, `http://${req.headers.host}`), {
            method: req.method,
            headers: req.headers,
            body,
          })

          const response = await mod.default.fetch(request)

          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))

          if (response.body) {
            const reader = response.body.getReader()
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              res.write(value)
            }
          }
          res.end()
        } catch (err) {
          console.error('[api dev middleware]', err)
          res.statusCode = 500
          res.end(String(err))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load all env vars (not just VITE_-prefixed) into process.env so api/*.js
  // functions can read them the same way they do on Vercel.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), vercelApiDevMiddleware()],
  }
})
