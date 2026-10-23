# Blind Screening

Two Vite + React + TypeScript + Tailwind frontends in one repo, sharing a single `package.json`, one `node_modules`, and one set of build/lint/TS/Tailwind configs.

| App | Folder | Dev URL |
| --- | --- | --- |
| Recruiter portal | `recruiter/` | http://localhost:5173 |
| Candidate portal | `candidate/` | http://localhost:5174 |

## Run

```bash
npm install        # once, from the repo root
npm run dev        # both apps at once (5173 + 5174)
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start both dev servers |
| `npm run dev:recruiter` / `dev:candidate` | Start one app |
| `npm run build` | Build both (output in `<app>/dist`) |
| `npm run build:recruiter` / `build:candidate` | Build one app |
| `npm run preview` | Preview both production builds |
| `npm run lint` | ESLint over the whole repo |
| `npm run typecheck` | `tsc` for both apps and the config files |

Ports are strict: if 5173/5174 are taken, Vite errors instead of silently moving, so the two apps never swap ports.

## Layout

```
package.json          # all dependencies + scripts
vite.base.ts          # shared Vite config (React, '@' alias, Tailwind, ports)
tailwind.preset.js    # shared theme (brand/accent colours, fonts)
tsconfig.base.json    # shared compiler options
eslint.config.js      # shared lint rules
recruiter/            # index.html, src/, vite.config.ts (port 5173), api-contract.md
candidate/            # index.html, src/, vite.config.ts (port 5174), api-contract.md
```

To change a port, edit the number in `recruiter/vite.config.ts` or `candidate/vite.config.ts`.

Both apps run on mock data today. The recruiter app reads `VITE_USE_MOCK` and `VITE_API_BASE_URL`; payloads for the future backend are in each app's `api-contract.md`. The apps use separate origins (different ports), so their `localStorage` sessions don't collide.
