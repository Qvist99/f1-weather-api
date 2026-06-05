# F1 Weather API

A simple API that provides live weather data from Formula 1 sessions.

## Disclaimer

This is an unofficial project and is not affiliated with or endorsed by
Formula 1.

All Formula 1 data, including weather and timing information, is the property of
Formula One World Championship Limited and its respective rights holders. This
project does not claim ownership of any Formula 1 data and simply exposes
weather information obtained from Formula 1's live timing feeds.

## Setup

Create a `.env` file in the project root:

```env
API_SECRET=
PORT=

SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
```

## Supabase

This API reads upcoming Formula 1 race and session information from a Supabase
database.

The schedule data is used to determine when a race weekend is approaching so the
API can connect to Formula 1's live timing feed only when necessary.

This avoids maintaining a constant connection to the SignalR feed 24/7 and
reduces unnecessary resource usage.
