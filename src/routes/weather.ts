import { Hono } from 'hono'
import { getWeather } from '../store/weatherStore.js'

const router = new Hono()

router.get('/', (c) => {
    const weather = getWeather();

    if (!weather) {
        return c.json({ data: null })
    }

    return c.json({ data: weather })
})

export default router