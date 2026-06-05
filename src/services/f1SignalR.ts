import Websocket from 'ws';
import { setWeather, getWeather } from '../store/weatherStore.js';
import { mapWeatherData } from '../utils/mapWeatherData.js';

interface NegotiationMessage {
    negotiateVersion: number;
    connectionId: string;
    connectionToken: string;
    availableTransports: Array<{
        transport: string;
        transferFormats: string[];
    }>;
}


let socket: Websocket | null = null;
let intentionallyClosed = false
let retryCount = 0;
const MAX_RETRIES = 4;

export async function startSignalR() {
    intentionallyClosed = false;
    const negotiationUrl = 'https://livetiming.formula1.com/signalrcore/negotiate?negotiateVersion=1';


    const response = await fetch(negotiationUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const cookies = response.headers.get('set-cookie');

    if (cookies) {
        console.log('Received cookies:', cookies);
    } else {
        console.warn('No cookies received in negotiation response');
    }
    const negotiationData: NegotiationMessage = await response.json();

    console.log("negotiation data:", negotiationData);

    const wsUrl = `wss://livetiming.formula1.com/signalrcore?id=${negotiationData.connectionToken}&transport=WebSockets&negotiateVersion=1`;

    console.log("Connecting to WebSocket at:", wsUrl);

    socket = new Websocket(wsUrl, [], {
        headers: {
            'User-Agent': 'BestHTTP',
            'Accept-Encoding': 'gzip, identity',
            'Connection': 'keep-alive, Upgrade',
            ...(cookies ? { 'Cookie': cookies } : {})
        }
    })

    socket.on('open', () => {
        retryCount = 0;
        console.log('WebSocket connected');

        const activeSocket = socket;
        if (!activeSocket) return;

        const handshake = JSON.stringify({ protocol: 'json', version: 1 }) + '\x1e';
        activeSocket.send(handshake);
        console.log('Handshake sent');

        const subscription = JSON.stringify({
            arguments: [['WeatherData']],
            invocationId: '0',
            target: 'Subscribe',
            type: 1
        }) + '\x1e';
        activeSocket.send(subscription);
        console.log('Subscribed to WeatherData');

    });

    socket.on('message', (data) => {
        const raw = data.toString();

        const clean = raw.replace(/\x1e/g, '').trim();
        if (!clean) return;

        try {
            const message = JSON.parse(clean);

            if (message.type === 1 && message.target === 'feed' && message.arguments) {
                const [topic, data] = message.arguments;
                if (topic === 'WeatherData') {
                    const weather = data;
                    setWeather(mapWeatherData(weather));
                    console.log('Weather updated (live):', getWeather());
                }
            }

            if (message.type === 3 && message.result?.WeatherData) {
                const weather = message.result.WeatherData;

                setWeather(mapWeatherData(weather));
                console.log('Weather updated:', getWeather());

            }


        } catch (err) {
            console.error('Error parsing message:', err);
        }

    });

    socket.on('error', (err) => {
        console.error('WebSocket error:', err.message);
    });

    socket.on('close', (code, reason) => {
        console.log('WebSocket closed:', code, reason.toString())
        socket = null;
        if (!intentionallyClosed) {
            if (retryCount >= MAX_RETRIES) {
                console.log(`Max retries (${MAX_RETRIES}) reached, giving up until next session`)
                retryCount = 0
                return
            }
            const delay = Math.min(5000 * Math.pow(2, retryCount), 5 * 60 * 1000)
            retryCount++
            console.log(`Reconnecting in ${Math.round(delay / 1000)} seconds (attempt ${retryCount})`)
            setTimeout(() => startSignalR(), delay)
        } else {
            retryCount = 0
            intentionallyClosed = false
        }
    });
}

export function stopSignalR() {
    intentionallyClosed = true
    if (socket) {
        console.log('Closing SignalR connection')
        socket.close()
        socket = null
    }
}
