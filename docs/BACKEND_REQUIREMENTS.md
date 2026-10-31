# Backend Requirements

Create this endpoint:

```txt
GET /api/tickets/conflicts
```

## Query Params

| Param | Required | Description |
|---|---|---|
| bbox | Yes | `minLng,minLat,maxLng,maxLat` |
| stationCode | No | Filter by station code, e.g. `HLTNW02` |
| utilityType | No | Filter by utility type, e.g. `WATER` |
| radiusMeters | No | Emergency conflict radius. Default: `250` |


---

## Implementation Flexibility

The provided database schema and seed data are recommended. You may change the schema, table names, relationships, or seed structure if you prefer a different implementation.

The important requirement is the final API behavior and response output. Your endpoint must still return the required fields, filters, risk calculation, and summary counts.

---

## Backend Rules

1. Validate `bbox`.
2. Validate `radiusMeters`.
3. Return only tickets inside the bbox.
4. Join `station_codes`.
5. Check whether each ticket is inside its matching service area polygon.
6. Find the nearest other `EMERGENCY` ticket within `radiusMeters`.
7. Return a `riskLevel` for each ticket.
8. Return summary counts.
9. Use safe parameterized SQL or a safe ORM query builder.
10. Do not filter everything only in React.

---

## Risk Rules

### HIGH

A ticket is `HIGH` risk if:

- its own priority is `EMERGENCY`, OR
- there is another `EMERGENCY` ticket within `radiusMeters`

### MEDIUM

A ticket is `MEDIUM` risk if:

- it is outside its assigned service area, OR
- its status is `PRE_COMPLETED` and `due_at` is in the past

### LOW

A ticket is `LOW` risk if it does not match any `HIGH` or `MEDIUM` rule.

Important: `HIGH` takes priority over `MEDIUM`.

---

## Expected Response Shape

```json
{
  "tickets": [
    {
      "id": 1,
      "ticketNo": "20261318930",
      "status": "PRE_COMPLETED",
      "priority": "STANDARD",
      "stationCode": "HLTNW02",
      "utilityType": "WATER",
      "longitude": -79.8711,
      "latitude": 43.2557,
      "insideServiceArea": true,
      "nearestEmergencyTicketNo": "2026133783",
      "distanceToNearestEmergencyMeters": 80,
      "riskLevel": "HIGH"
    }
  ],
  "summary": {
    "total": 9,
    "highRisk": 3,
    "mediumRisk": 4,
    "lowRisk": 2,
    "outsideServiceArea": 2,
    "byUtilityType": {
      "WATER": 4,
      "GAS": 2,
      "SANITARY": 1,
      "TELECOM": 2
    }
  }
}
```

---

## Useful PostGIS Functions

You may use these functions, or equivalent PostGIS logic.

### Bbox filtering

```sql
ST_Intersects(
  t.geom,
  ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326)
)
```

### Service area check

```sql
ST_Covers(sa.geom, t.geom)
```

or:

```sql
ST_Within(t.geom, sa.geom)
```

### Nearby emergency radius check

```sql
ST_DWithin(
  t.geom::geography,
  e.geom::geography,
  :radiusMeters
)
```

### Distance in meters

```sql
ST_Distance(
  t.geom::geography,
  e.geom::geography
)
```
