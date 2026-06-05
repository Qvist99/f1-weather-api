import "dotenv/config"
import { serve } from '@hono/node-server'
import { startScheduler } from './services/sessionScheduler.js'
import { app } from './app.js'

startScheduler();

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
