# Frontend Requirements

Create a React page for the conflict search.

## Required UI

The page must include:

- bbox input
- station code filter
- utility type filter
- radius input
- search button
- loading state
- error state
- summary cards
- ticket table/list
- risk badge for `HIGH`, `MEDIUM`, and `LOW`

---

## Required Table Fields

Show these fields for each ticket:

- ticket number
- status
- priority
- station code
- utility type
- longitude
- latitude
- inside service area
- nearest emergency ticket number
- distance to nearest emergency
- risk level

---

## Bonus Map

Bonus if you add a Leaflet/OpenStreetMap map.

Map bonus requirements:

- show ticket markers
- color or label markers by risk level
- allow map bounds to update bbox

---

## Important

Do not hardcode the result data in React.

The frontend must call your backend endpoint:

```txt
GET /api/tickets/conflicts
```
