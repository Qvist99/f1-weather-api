import { createClient } from '@supabase/supabase-js'
import { startSignalR, stopSignalR } from './f1SignalR.js'

export interface Session {
    date_start: string
    date_end: string
    is_cancelled: boolean
    session_name: 'Practice 1' | 'Practice 2' | 'Practice 3' | 'Qualifying' | 'Sprint' | 'Race'
    session_type: 'Practice' | 'Qualifying' | 'Race'
    session_key: string
}

export interface Race {
    meeting_key: number
    race_name: string
    date_start: string
    date_end: string
    sessions: Session[]
}


let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
    if (!supabaseClient) {
        supabaseClient = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!
        )
    }
    return supabaseClient
}

async function getNextRace(): Promise<Race | null> {
    const now = new Date().toISOString()

    const { data, error } = await getSupabaseClient()
        .from('races')
        .select('meeting_key, race_name, date_start, date_end, sessions')
        .eq('is_cancelled', false)
        .gte('date_end', now)
        .order('date_start', { ascending: true })
        .limit(1)
        .single()

    if (error) {
        console.error('Failed to fetch next race:', error.message)
        return null
    }

    return data as Race
}

const BUFFER_MS = 30 * 60 * 1000 // 30 minutes

export function findCurrentOrNextSession(race: Race): Session | null {
    const now = Date.now()

    // First check if any session is currently active (with buffer)
    const activeSession = race.sessions.find(session => {
        if (session.is_cancelled) return false
        const start = new Date(session.date_start).getTime() - BUFFER_MS
        const end = new Date(session.date_end).getTime() + BUFFER_MS
        return now >= start && now <= end
    })

    if (activeSession) return activeSession

    // Otherwise find the next upcoming session
    const upcomingSession = race.sessions
        .filter(session => {
            if (session.is_cancelled) return false
            const start = new Date(session.date_start).getTime() - BUFFER_MS
            return start > now
        })
        .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())[0]

    return upcomingSession ?? null
}

let scheduledStart: NodeJS.Timeout | null = null
let scheduledStop: NodeJS.Timeout | null = null
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

async function scheduleSession(session: Session) {
    const now = Date.now()
    const sessionStart = new Date(session.date_start).getTime() - BUFFER_MS
    const sessionEnd = new Date(session.date_end).getTime() + BUFFER_MS

    // Clear any existing timers
    if (scheduledStart) clearTimeout(scheduledStart)
    if (scheduledStop) clearTimeout(scheduledStop)

    const msUntilStart = sessionStart - now
    const msUntilEnd = sessionEnd - now

    console.log(`Next session: ${session.session_name}`)
    console.log(`Starts in: ${Math.round(msUntilStart / 1000 / 60)} minutes`)
    console.log(`Ends in: ${Math.round(msUntilEnd / 1000 / 60)} minutes`)

    // If more than 24 hours away, re-query in 24 hours instead of one giant timer
    if (msUntilStart > TWENTY_FOUR_HOURS) {
        console.log('Next session is more than 24 hours away, checking again in 24 hours')
        scheduledStart = setTimeout(() => scheduleNextSession(), TWENTY_FOUR_HOURS)
        return
    }

    // If session hasn't started yet, schedule the connect
    if (msUntilStart > 0) {
        scheduledStart = setTimeout(() => {
            console.log(`Starting SignalR for ${session.session_name}`)
            startSignalR()
        }, msUntilStart)
    } else {
        // Session already active, connect immediately
        console.log(`Session ${session.session_name} already active, connecting now`)
        startSignalR()
    }

    // Schedule the disconnect
    scheduledStop = setTimeout(async () => {
        console.log(`Session ${session.session_name} ended, stopping SignalR`)
        stopSignalR()
        await scheduleNextSession()
    }, msUntilEnd)
}


async function scheduleNextSession() {
    const race = await getNextRace()

    if (!race) {
        console.log('No upcoming races found')
        return
    }

    const session = findCurrentOrNextSession(race)

    if (!session) {
        console.log('No upcoming sessions found')
        return
    }

    await scheduleSession(session)
}

export async function startScheduler() {
    console.log('Starting session scheduler')
    await scheduleNextSession()
}
