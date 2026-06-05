import { describe, it, expect, beforeEach, vi } from 'vitest'
import { app } from '../app.js'

vi.mock('../services/sessionScheduler.js', () => ({
    startScheduler: vi.fn()
}))

vi.mock('../store/weatherStore.js', () => ({
    getWeather: vi.fn()
}))

import { getWeather } from '../store/weatherStore.js'

const validHeaders = {
    'X-API-Key': 'some-long-random-string'
}

describe('GET /health', () => {
    it('returns ok status', async () => {
        const res = await app.request('/health')
        const body = await res.json()
        expect(res.status).toBe(200)
        expect(body).toEqual({ status: 'ok' })
    })
})

describe('GET /weather', () => {
    beforeEach(() => {
        vi.mocked(getWeather).mockReset()
    })

    it('returns 403 without headers', async () => {
        const res = await app.request('/weather')
        expect(res.status).toBe(403)
    })

    it('returns 403 with wrong API key', async () => {
        const res = await app.request('/weather', {
            headers: { 'X-API-Key': 'wrong-key' }
        })
        expect(res.status).toBe(403)
    })


    it('returns data: null when store is empty', async () => {
        vi.mocked(getWeather).mockReturnValue(null)
        const res = await app.request('/weather', { headers: validHeaders })
        const body = await res.json()
        expect(res.status).toBe(200)
        expect(body).toEqual({ data: null })
    })

    it('returns weather data when store has data', async () => {
        const mockWeather = {
            airTemp: 22.5, trackTemp: 35.1, humidity: 60.0,
            pressure: 1013.2, windSpeed: 4.2, windDirection: 180,
            rainfall: false, timestamp: '2026-06-05T12:00:00.000Z'
        }
        vi.mocked(getWeather).mockReturnValue(mockWeather)
        const res = await app.request('/weather', { headers: validHeaders })
        const body = await res.json()
        expect(res.status).toBe(200)
        expect(body).toEqual({ data: mockWeather })
    })
})
