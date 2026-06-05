import { describe, it, expect } from 'vitest'
import { mapWeatherData } from '../utils/mapWeatherData.js'

const mockRaw = {
    AirTemp: '22.5',
    TrackTemp: '35.1',
    Humidity: '60.0',
    Pressure: '1013.2',
    WindSpeed: '4.2',
    WindDirection: '180',
    Rainfall: '0',
    _kf: true
}

describe('mapWeatherData', () => {
    it('parses string numbers to floats', () => {
        const result = mapWeatherData(mockRaw)
        expect(result.airTemp).toBe(22.5)
        expect(result.trackTemp).toBe(35.1)
        expect(result.humidity).toBe(60.0)
        expect(result.pressure).toBe(1013.2)
        expect(result.windSpeed).toBe(4.2)
    })

    it('parses windDirection as integer', () => {
        const result = mapWeatherData(mockRaw)
        expect(result.windDirection).toBe(180)
        expect(Number.isInteger(result.windDirection)).toBe(true)
    })

    it('maps Rainfall "0" to false', () => {
        const result = mapWeatherData(mockRaw)
        expect(result.rainfall).toBe(false)
    })

    it('maps Rainfall "1" to true', () => {
        const result = mapWeatherData({ ...mockRaw, Rainfall: '1' })
        expect(result.rainfall).toBe(true)
    })

    it('generates a valid ISO timestamp', () => {
        const result = mapWeatherData(mockRaw)
        expect(() => new Date(result.timestamp)).not.toThrow()
        expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
})
