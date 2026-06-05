import { describe, it, expect } from 'vitest'
import { findCurrentOrNextSession } from '../services/sessionScheduler.js'
import type { Race } from '../services/sessionScheduler.js'

const mockSession = (offsetStartMinutes: number, offsetEndMinutes: number, name = 'Practice 1') => ({
    date_start: new Date(Date.now() + offsetStartMinutes * 60 * 1000).toISOString(),
    date_end: new Date(Date.now() + offsetEndMinutes * 60 * 1000).toISOString(),
    is_cancelled: false,
    session_name: name as 'Practice 1',
    session_type: 'Practice' as const,
    session_key: '123'
})

const mockRace = (sessions: ReturnType<typeof mockSession>[]): Race => ({
    meeting_key: 1,
    race_name: 'Test GP',
    date_start: sessions[0].date_start,
    date_end: sessions[sessions.length - 1].date_end,
    sessions
})



describe('findCurrentOrNextSession', () => {
    it('returns null when all sessions are cancelled', () => {
        const race = mockRace([{ ...mockSession(60, 120), is_cancelled: true }])
        expect(findCurrentOrNextSession(race)).toBeNull()
    })

    it('returns active session when current time is within session window', () => {
        const race = mockRace([mockSession(-30, 60)])
        const result = findCurrentOrNextSession(race)
        expect(result).not.toBeNull()
        expect(result?.session_name).toBe('Practice 1')
    })

    it('returns next upcoming session when no session is active', () => {
        const race = mockRace([
            mockSession(120, 180, 'Practice 1'),
            mockSession(240, 300, 'Practice 2'),
        ])
        const result = findCurrentOrNextSession(race)
        expect(result?.session_name).toBe('Practice 1')
    })

    it('returns null when all sessions are in the past', () => {
        const race = mockRace([mockSession(-120, -60)])
        expect(findCurrentOrNextSession(race)).toBeNull()
    })

    it('picks the earliest upcoming session when multiple are in the future', () => {
        const race = mockRace([
            mockSession(240, 300, 'Practice 2'),
            mockSession(120, 180, 'Practice 1'),
        ])
        const result = findCurrentOrNextSession(race)
        expect(result?.session_name).toBe('Practice 1')
    })
})
