# web-frontend

One React + Vite app (`admin/`) serving all three admin/staff roles on a single
origin, told apart by URL path rather than by port:

| Portal                     | URL                         |
|------------------------------|-------------------------------|
| Super admin                | `http://localhost:3000/super-admin/login` |
| Hospital admin              | `http://localhost:3000/hospital-admin/login` |
| Staff (doctor + triage)     | `http://localhost:3000/staff/login` |

Visiting `http://localhost:3000/` shows a landing page linking to all three.

```bash
cd web-frontend/admin
npm install
npm run dev
```

Each role's login stores its session under its own namespaced `localStorage` keys
(`superadmin_*` / `hospitaladmin_*` / `staff_*`) so, even though they now share one
origin, logging into one role never clobbers another's session — you can be logged
into more than one role in the same browser at once if you want to.

Internally `admin/src/` keeps one folder per role (`super-admin/`, `hospital-admin/`,
`staff/`), each with its own `api/client.js` (own login endpoint), `components/
ProtectedRoute.jsx`, and `pages/*.jsx` — copied rather than shared, because the auth
details genuinely differ per role. Only the small presentational bits
(`components/ui.jsx`, `index.css`) are shared across all three.

Talks to the backend at `VITE_API_BASE_URL` (`admin/.env`, default
`http://localhost:8000`). Demo credentials for every role are documented in
`docs/credentials.md` (gitignored, ask a teammate if it's missing locally) — note the
URLs there predate this merge and still show the old per-port logins; the accounts
themselves are unchanged, just reachable at the paths in the table above now.
