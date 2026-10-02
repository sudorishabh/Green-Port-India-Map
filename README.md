# Green Ports India Map

An interactive map of India's ports, their trade routes and green shipping progress, built as a single Next.js app containing:

- **Trade route map** (`/`): the public Leaflet map of Indian ports, their trade routes, KPIs and green initiatives. Street tiles come from Esri's World Street Map, labelled in English and redrawn with India's official boundaries by [`@india-boundary-corrector/leaflet-layer`](https://github.com/ramSeraph/india_boundary_corrector); satellite imagery comes from Esri too. Neither needs a key.
- **Admin portal** (`/portal`): sign in to manage ports, KPIs, target links and initiatives.
- **API** (`/api/*`): Route Handlers backed by PostgreSQL (Drizzle ORM), replacing the old Express server.

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

| Script                | Description                                        |
| --------------------- | -------------------------------------------------- |
| `npm run dev`         | Start the dev server                               |
| `npm run build`       | Production build                                   |
| `npm run start`       | Serve the production build                         |
| `npm run lint`        | ESLint                                             |
| `npm run typecheck`   | Generate route types, then run `tsc`               |
| `npm run db:generate` | Generate a migration from `src/server/db/schema.ts` |
| `npm run db:migrate`  | Apply pending migrations                           |
| `npm run db:studio`   | Open Drizzle Studio                                |
| `npm run db:seed`     | Seed ports, KPIs and green initiatives (re-runnable) |
| `npm run db:create-user -- <email>` | Create a portal account and print its generated password |

## Environment variables

Set these in `.env` (start from [`.env.example`](.env.example)). The app, drizzle-kit and the `db:*` scripts all read it.

| Variable                                      | Notes                                                                                                      |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                | PostgreSQL connection string, e.g. `postgres://user:password@localhost:5432/india_trade_network`           |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | Secrets that sign the portal's session cookies. Use two different long random strings                      |

To generate a secret:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

## Project structure

```
public/
  ports/                Placeholder port pictures, assigned by port id
  flags/                Country flags, matched by country name
  map/                  India boundary corrections (PMTiles), copied from
                        @india-boundary-corrector/data; recopy after updating it
src/
  app/
    (map)/              Root layout + page for the public map (/)
    portal/             Root layout for the admin portal (/portal)
      (auth)/           sign-in
      (dashboard)/      Protected pages: ports, kpis, users
    api/                Route Handlers: auth, port, kpi
  components/
    map/                Map UI (markers, port modal, KPI panels)
    portal/             Portal UI (forms, header, sidebar, auth guards)
    ui/                 shadcn/ui primitives
  lib/
    error-codes.ts      API error codes shared by server and clients
    map/                Map API client, types and geometry helpers
    portal/             Redux store, RTK Query slices, routes, types
  server/               Server-only code
    db/                 Drizzle schema, migrations and pooled client
    services/           Data access for users, ports, KPIs, initiatives
    http.ts             Route wrapper: rate limiting + JSON errors
    session.ts          JWT access/refresh cookies
```

The map and the portal use separate [root layouts](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups), so each keeps its own fonts, global styles and client state.

## API

Every endpoint returns JSON. Errors look like `{ success: false, message, errorCode }`; the codes live in `src/lib/error-codes.ts`. Endpoints marked 🔒 need a valid session cookie. Without one they return `errorCode: 10001`, which tells the portal to refresh the session and retry.

| Method | Path                                            |    |
| ------ | ----------------------------------------------- | -- |
| POST   | `/api/auth/login`, `/api/auth/logout`           |    |
| POST   | `/api/auth/register`                            | 🔒 |
| GET    | `/api/auth/refresh`                             |    |
| GET    | `/api/port/all-ports`, `/api/port/single-port/:id` |    |
| POST   | `/api/port/create-port`, `/api/port/update-port/:id` | 🔒 |
| DELETE | `/api/port/delete-port/:id`                     | 🔒 |
| GET    | `/api/kpi/all-kpis`, `/api/kpi/single-kpi/:id`  |    |
| POST   | `/api/kpi/create-kpi`, `/api/kpi/update-kpi/:id` | 🔒 |
| DELETE | `/api/kpi/delete-kpi/:id`                       | 🔒 |
| GET    | `/api/kpi/initiatives?portId=&kpiId=`, `/api/kpi/port-initiatives/:portId` |    |
| POST   | `/api/kpi/initiatives/:kpiId/:portId`, `/api/kpi/update-initiative/:id` | 🔒 |
| DELETE | `/api/kpi/delete-initiative/:id`                | 🔒 |

API responses carry helmet-equivalent security headers (`next.config.ts`) and are rate limited to 250 requests per 10 minutes per IP, or 10 per 15 minutes for `/api/auth/login` (in memory, per server instance). Portal pages can't be framed by other sites; the public map can. Browsers' cross-site POST and DELETE requests are rejected with a 403. Logging out revokes the user's sessions on every device (via `users.session_version`).
