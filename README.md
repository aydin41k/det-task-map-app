# DoE Coding Task

## Requirements
- Present a street-view map and allow the user to select a loca!on.
- Capture that loca!on address into a database.
- Add capability to view all past selected loca!on addresses.

Technical requirements:
- Database: SQLite
- Front end: VueJS, VueX
- Backend: Node.js (Express.js)

## Solution

The server provides endpoints to:
- Reverse-geocode a latitude/longitude into a human-readable address (via OpenStreetMap Nominatim)
- Save a clicked location of a user
- Fetch saved click history of a user

### Requirements

- Node.js (recommended: **18+**)
- npm

### Install

Install server dependencies:

```bash
cd server
npm install
```

### Run

Start the API server:

```bash
cd server
npm start
```

By default it runs on `http://localhost:3000`.

#### Configuration

- **PORT**: set `PORT` to change the listen port (defaults to `3000`)

Example:

```bash
cd server
PORT=4000 npm start
```

### API

All routes are under the `/api` prefix.

#### Reverse geocode

`GET /api/geocode?lat=<number>&lng=<number>`

Example:

```bash
curl "http://localhost:3000/api/geocode?lat=-33.8688&lng=151.2093"
```

Response:

```json
{ "address": "..." }
```

#### Save a location

`POST /api/location`

Body:

```json
{
  "session_uuid": "your-session-id",
  "lat": -33.8688,
  "lng": 151.2093,
  "address": "Some human readable address"
}
```

Example:

```bash
curl -X POST "http://localhost:3000/api/location" \
  -H "Content-Type: application/json" \
  -d '{"session_uuid":"abc-123","lat":-33.8688,"lng":151.2093,"address":"Sydney NSW, Australia"}'
```

#### Fetch history

`GET /api/history/:session_uuid`

Example:

```bash
curl "http://localhost:3000/api/history/abc-123"
```

Response (example):

```json
[
  {
    "id": 1,
    "address": "Sydney NSW, Australia",
    "date": "2025-01-01T00:00:00.000Z",
    "lat": -33.8688,
    "lng": 151.2093
  }
]
```

### Data storage

The server uses **SQLite** stored at `server/database.sqlite`.

- Tables are automatically created/updated on server start (via Sequelize `sync()`).
- If you delete `server/database.sqlite`, the server will recreate it on next run (you’ll lose saved history).
