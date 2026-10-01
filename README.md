# India Trade Network

A single Next.js app containing:

- **Trade route map** (`/`): the public Google Maps view of Indian ports, their trade routes, KPIs and green initiatives.
- **Admin portal** (`/portal`): sign in to manage ports, KPIs, target links and initiatives.
- **API** (`/api/*`): Route Handlers backed by PostgreSQL (Drizzle ORM) and S3, replacing the old Express server.

## Getting started

Requires Node.js 24+.

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev            # http://localhost:3000
```

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

## Environment variables

See [`.env.example`](.env.example).

| Variable                                               | Used by | Notes                                                               |
| ------------------------------------------------------ | ------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_GOOGLE_MAP_API`, `NEXT_PUBLIC_MAP_ID`     | Map     | Exposed to the browser                                              |
| `DATABASE_URL`                                         | API     | PostgreSQL connection string                                        |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`          | API     | JWT signing secrets for the portal session cookies                  |
| `APP_AWS_REGION`, `APP_AWS_S3_BUCKET_NAME`             | API     | Bucket holding port images and flags                                |
| `APP_AWS_ACCESS_KEY_ID`, `APP_AWS_SECRET_ACCESS_KEY`   | API     | Optional: omit both to use the default AWS credential chain (IAM role) |

## Project structure

```
src/
  app/
    (map)/              Root layout + page for the public map (/)
    portal/             Root layout for the admin portal (/portal)
      (auth)/           sign-in, sign-up
      (dashboard)/      Protected pages: ports, kpis
    api/                Route Handlers: auth, port, kpi, s3
  components/
    map/                Map UI (markers, port modal, KPI panels)
    portal/             Portal UI (forms, header, sidebar, auth guards)
    ui/                 shadcn/ui primitives
  hooks/                Client hooks (S3 uploads)
  lib/
    error-codes.ts      API error codes shared by server and clients
    map/                Map API client, types and geometry helpers
    portal/             Redux store, RTK Query slices, routes, types
  server/               Server-only code
    db/                 Drizzle schema, migrations and pooled client
    services/           Data access for users, ports, KPIs, initiatives
    http.ts             Route wrapper: rate limiting + JSON errors
    session.ts          JWT access/refresh cookies
    s3.ts               Signed S3 URLs
```

The map and the portal use separate [root layouts](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups), so each keeps its own fonts, global styles and client state.

## API

Every endpoint returns JSON. Errors look like `{ success: false, message, errorCode }`; the codes live in `src/lib/error-codes.ts`. Endpoints marked 🔒 need a valid session cookie. Without one they return `errorCode: 10001`, which tells the portal to refresh the session and retry.

| Method | Path                                            |    |
| ------ | ----------------------------------------------- | -- |
| POST   | `/api/auth/register`, `/api/auth/login`         |    |
| GET    | `/api/auth/refresh`, `/api/auth/logout`         |    |
| GET    | `/api/port/all-ports`, `/api/port/single-port/:id` |    |
| POST   | `/api/port/create-port`, `/api/port/update-port/:id` | 🔒 |
| DELETE | `/api/port/delete-port/:id`                     | 🔒 |
| GET    | `/api/kpi/all-kpis`, `/api/kpi/single-kpi/:id`  |    |
| POST   | `/api/kpi/create-kpi`, `/api/kpi/update-kpi/:id` | 🔒 |
| DELETE | `/api/kpi/delete-kpi/:id`                       | 🔒 |
| GET    | `/api/kpi/initiatives?portId=&kpiId=`, `/api/kpi/port-initiatives/:portId` |    |
| POST   | `/api/kpi/initiatives/:kpiId/:portId`, `/api/kpi/update-initiative/:id` | 🔒 |
| DELETE | `/api/kpi/delete-initiative/:id`                | 🔒 |
| GET    | `/api/s3/file-url?fileName=&fileType=`          |    |
| POST   | `/api/s3/upload-url`                            | 🔒 |
| DELETE | `/api/s3/delete`                                | 🔒 |

API responses carry helmet-equivalent security headers (`next.config.ts`) and are rate limited to 250 requests per 10 minutes per IP (in memory, per server instance).
