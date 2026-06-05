import { Hono } from 'hono'
import weather from './routes/weather.js'
import { authMiddleware } from './middleware/auth.js'

export const app = new Hono()

app.get('/health', (c) => {
    return c.json({ status: 'ok' })
})

app.use('/weather/*', authMiddleware)
app.route('/weather', weather)