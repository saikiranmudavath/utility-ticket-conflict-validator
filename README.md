# Utility Ticket Conflict & Service Area Validator

## Live Coding Test — 1 Hour

You are building a small full-stack GIS utility ticket validator.

You may use your own existing local setup, but the required stack is:

- React.js frontend
- NestJS backend with TypeScript
- PostgreSQL
- PostGIS extension enabled

This package contains:

- database schema
- seed data
- backend API requirements
- frontend requirements
- expected response shape
- submission checklist

You are responsible for installing and running your own project dependencies.


---

## Flexibility Note

The provided schema and seed data are recommended starting points for the live test. If you believe there is a better way to model the data, you may adjust the schema, table names, relationships, or seed structure.

However, your final solution must still produce the required API output shape and must support the required behavior:

- bbox-based ticket search
- station code and utility type filtering
- service area validation
- nearby emergency conflict detection
- HIGH / MEDIUM / LOW risk calculation
- summary counts

In short: you may change the internal implementation, but the final working output must match the requirements.

---

## Goal

Build a feature that finds utility tickets inside a map bounding box and evaluates risk based on:

1. whether the ticket is inside its assigned service area polygon
2. whether there is a nearby emergency ticket within a configurable radius
3. whether the ticket is overdue

---

## Required Backend Endpoint

Create this endpoint:

```txt
GET /api/tickets/conflicts
```

Query params:

```txt
bbox=minLng,minLat,maxLng,maxLat   required
stationCode                         optional
utilityType                         optional
radiusMeters                        optional, default 250
```

Example:

```txt
GET /api/tickets/conflicts?bbox=-80.00,43.20,-79.70,43.40&utilityType=WATER&radiusMeters=250
```

---

## Required Frontend

Create a React page with:

- bbox input
- station code filter
- utility type filter
- radius input
- search button
- summary cards
- ticket table
- risk badge for HIGH / MEDIUM / LOW
- loading and error states

Bonus:

- Leaflet/OpenStreetMap map
- markers colored by risk level
- map bounds update bbox

---

## Database Setup

Run the SQL files in this order:

```bash
psql -d YOUR_DATABASE_NAME -f database/01_schema.sql
psql -d YOUR_DATABASE_NAME -f database/02_seed.sql
```

Or copy/paste the SQL into your database client.

---

## Important GIS Rules

- Coordinates are stored as longitude first, latitude second.
- bbox format is `minLng,minLat,maxLng,maxLat`.
- Use SRID `4326`.
- Use PostGIS for spatial filtering.
- Do not fetch all tickets and filter only in React.

---

## Time Limit

You have 1 hour.

Prioritize correctness over styling.
