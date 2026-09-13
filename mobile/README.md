# mobile

Patient-facing slot-booking app (Expo / React Native). A separate Expo project from
the kiosk app (`frontend/`) — same reasoning as why the three admin apps under
`web-frontend/` are separate rather than one big app: this runs on a random patient's
own phone, not shared hospital hardware.

```bash
npm install
npm start        # or: npm run web
```

By default this opens on the same port Expo always defaults to (`8081`) — if
`frontend/` is already running there, start this one on a different port instead:
`npx expo start --web --port 8090`.

## What it does

Four screens, in order: search for a hospital by name → pick a free 30-minute arrival
slot → identify yourself (ABHA ID + name + mobile) → confirmation, with a prominent
"arrive 10 minutes early" notice. Booking only reserves a place in line — the patient
still completes the exact same registration at the hospital kiosk on arrival.

## Backend contract

Talks only to public, unauthenticated endpoints (`EXPO_PUBLIC_API_BASE_URL` in
`.env`, default `http://localhost:8000`):

- `GET /api/hospitals/?q=<search>` — hospital search (shared with the doctor/triage
  login page's hospital dropdown).
- `GET /api/mobile/hospitals/<id>/slots/?date=YYYY-MM-DD` — a day's 30-minute slots,
  each marked available/taken.
- `POST /api/mobile/bookings/` — books a slot; the database's
  `unique(hospital, slot_date, slot_time)` constraint rejects a double-booking race
  with a `409`, which the app surfaces as "that slot was just taken, pick another."

**This app never sends the kiosk's `X-Kiosk-Key`.** That header is a shared secret for
hardware you control (`frontend/`); this app runs on hardware you don't, so every
endpoint it calls is intentionally public by design — see
`backend/apps/mobile/permissions.py`'s docstring before "fixing" this by adding it.
