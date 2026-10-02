# Green Ports India Map

An interactive map of India's ports, their trade routes and their progress on green shipping. One Next.js app serves three parts:

- **Public map** (`/`): a Leaflet map of India's hub ports and their partner ports abroad, the trade routes between them, and each port's facts, green port KPIs and initiatives.
- **Admin portal** (`/portal`): sign in to manage ports, KPIs and their target links, green initiatives and portal users.
- **API** (`/api/*`): Route Handlers backed by PostgreSQL through Drizzle ORM, used by both.

## Getting started

You need Node.js 24+ (the `db:*` scripts run TypeScript files directly with Node) and a PostgreSQL database.

```bash
npm install
cp .env.example .env                        # then fill in the values, see below
npm run db:migrate                          # create the tables
npm run db:seed                             # load the ports, KPIs and initiatives
npm run db:create-user -- you@example.com   # prints the account's password once
npm run dev                                 # http://localhost:3000
```

Sign in at http://localhost:3000/portal with that email and password. There is no public sign-up: signed-in users add more accounts from the portal's Users page.

## Scripts

| Script                              | Description                                                         |
| ----------------------------------- | ------------------------------------------------------------------- |
| `npm run dev`                       | Start the dev server                                                |
| `npm run build`                     | Production build                                                    |
| `npm run start`                     | Serve the production build                                          |
| `npm run lint`                      | ESLint                                                              |
| `npm run typecheck`                 | Generate route types, then run `tsc`                                |
| `npm run db:generate`               | Generate a migration after changing `src/server/db/schema.ts`       |
| `npm run db:migrate`                | Apply pending migrations                                            |
| `npm run db:studio`                 | Open Drizzle Studio to browse the database                          |
| `npm run db:seed`                   | Seed ports, KPIs and green initiatives (safe to re-run)             |
| `npm run db:create-user -- <email>` | Create a portal account and print its generated password            |

Re-running `db:seed` resets the seeded ports and KPIs to the values in `src/server/db/seed/` and adds any missing initiatives. Ports and KPIs created in the portal are left alone.

## Environment variables

Set these in `.env` (start from [`.env.example`](.env.example)). The app, drizzle-kit and the `db:*` scripts all read it.

| Variable                                      | Notes                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                                | PostgreSQL connection string, e.g. `postgres://user:password@localhost:5432/india_trade_network` |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | Secrets that sign the portal's session cookies. Use two different long random strings            |

To generate a secret:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

## Map tiles

Both base maps come from Esri and need no API key:

- **Street**: Esri's World Street Map, labelled in English everywhere. [`@india-boundary-corrector/leaflet-layer`](https://github.com/ramSeraph/india_boundary_corrector) redraws its borders to match India's official boundaries.
- **Satellite**: Esri's World Imagery.

The boundary corrections are served from `public/map/india_boundary_corrections.pmtiles` rather than a CDN, so a blocked CDN can't bring back the wrong borders. The file comes from `@india-boundary-corrector/data`, a dependency of the leaflet layer. After updating the layer, copy it again:

```bash
cp node_modules/@india-boundary-corrector/data/india_boundary_corrections.pmtiles public/map/
```

## Project structure

```
public/
  flags/                Country flags, matched by country name
  map/                  India boundary corrections (see Map tiles)
  ports/                Placeholder port pictures, assigned by port id
src/
  app/
    (map)/              Root layout and page for the public map (/)
    portal/             Root layout for the admin portal (/portal)
      (auth)/           Sign-in page
      (dashboard)/      Signed-in pages: ports, KPIs, users
    api/                Route Handlers: auth, port, kpi
  components/
    map/                Map UI: base map, port pins and panels, port details, loading screen
    portal/             Portal UI: forms, header, sidebar, auth guards
    ui/                 shadcn/ui primitives
  lib/
    error-codes.ts      API error codes shared by server and clients
    map/                Map API client, types and route geometry helpers
    portal/             Redux store, RTK Query slices, routes, types
    schemas/            Zod schemas for ports, KPIs and initiatives, shared by the API and portal forms
  server/               Server-only code
    db/                 Drizzle schema, migrations, pooled client, seed data, create-user script
    services/           Data access for users, ports, KPIs and initiatives
    http.ts             Route wrapper: rate limiting, cross-site checks, JSON errors
    session.ts          JWT access and refresh cookies
```

The map and the portal use separate [root layouts](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups), so each keeps its own fonts, global styles and client state.

## API

Every endpoint returns JSON. Errors look like `{ success: false, message, errorCode }`; the codes live in `src/lib/error-codes.ts`. Endpoints marked 🔒 need a valid session cookie. Without one they return `errorCode: 10001`, which tells the portal to refresh the session and retry.

| Method | Path                                                                       | Auth |
| ------ | -------------------------------------------------------------------------- | ---- |
| POST   | `/api/auth/login`, `/api/auth/logout`                                      |      |
| POST   | `/api/auth/register`                                                       | 🔒   |
| GET    | `/api/auth/refresh`                                                        |      |
| GET    | `/api/port/all-ports`, `/api/port/single-port/:id`                         |      |
| POST   | `/api/port/create-port`, `/api/port/update-port/:id`                       | 🔒   |
| DELETE | `/api/port/delete-port/:id`                                                | 🔒   |
| GET    | `/api/kpi/all-kpis`, `/api/kpi/single-kpi/:id`                             |      |
| POST   | `/api/kpi/create-kpi`, `/api/kpi/update-kpi/:id`                           | 🔒   |
| DELETE | `/api/kpi/delete-kpi/:id`                                                  | 🔒   |
| GET    | `/api/kpi/initiatives?portId=&kpiId=`, `/api/kpi/port-initiatives/:portId` |      |
| POST   | `/api/kpi/initiatives/:kpiId/:portId`, `/api/kpi/update-initiative/:id`    | 🔒   |
| DELETE | `/api/kpi/delete-initiative/:id`                                           | 🔒   |

## Security

- The API is rate limited per IP: 250 requests per 10 minutes, or 10 per 15 minutes for `/api/auth/login`. Counts are kept in memory, so they reset on restart and aren't shared between server instances. The client IP is the last `X-Forwarded-For` entry, which suits running the app directly or behind one reverse proxy.
- Cross-site POST and DELETE requests from browsers are rejected with a 403. Session cookies are httpOnly and SameSite=Lax; access tokens last an hour and refresh tokens 15 days.
- Logging out revokes the user's sessions on every device (via `users.session_version`).
- API responses carry helmet's default security headers (see `next.config.ts`). Portal pages can't be framed by other sites; the public map can, so it can be embedded.

## Running in production

```bash
npm ci
npm run build
npm run db:migrate
npm run start   # port 3000, or set PORT
```

In production the session cookies are marked Secure, so serve the portal over HTTPS (or on localhost) or sign-in won't stick.
