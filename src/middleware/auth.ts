import { createMiddleware } from 'hono/factory'

export const authMiddleware = createMiddleware(async (c, next) => {
    const apiKey = c.req.header('X-API-Key')
    const expectedKey = process.env.API_SECRET

    if (!expectedKey || apiKey !== expectedKey) {
        return c.json({ error: 'Forbidden' }, 403)
    }

    await next()
})
