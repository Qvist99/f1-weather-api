import { describe, it, expect, beforeEach } from 'vitest'
import { getWeather, setWeather, resetWeather } from '../store/weatherStore.js'


describe('weatherStore', () => {
    beforeEach(() => {
        // Reset store between tests
        resetWeather()
    })

    it('returns null when no weather has been set', () => {
        expect(getWeather()).toBeNull()
    })

    it('returns weather data after setWeather is called', () => {
        const mockWeather = {
            airTemp: 22.5,
            trackTemp: 35.1,
            humidity: 60.0,
            pressure: 1013.2,
            windSpeed: 4.2,
            windDirection: 180,
            rainfall: false,
            timestamp: '2026-06-05T12:00:00.000Z'
        }

        setWeather(mockWeather)
        expect(getWeather()).toEqual(mockWeather)
    })

    it('overwrites previous weather data', () => {
        const first = { airTemp: 20.0, trackTemp: 30.0, humidity: 50.0, pressure: 1010.0, windSpeed: 2.0, windDirection: 90, rainfall: false, timestamp: '2026-06-05T12:00:00.000Z' }
        const second = { airTemp: 25.0, trackTemp: 38.0, humidity: 55.0, pressure: 1012.0, windSpeed: 3.5, windDirection: 120, rainfall: true, timestamp: '2026-06-05T13:00:00.000Z' }

        setWeather(first)
        setWeather(second)
        expect(getWeather()).toEqual(second)
    })
})
