# Xueying Wang — Portfolio Website

A fast, fully static personal portfolio website. No backend, no build step — just HTML, CSS, and vanilla JavaScript served directly from a CDN.

> Previously built on Spring Boot + Thymeleaf, the site was refactored to a pure static architecture because it has no server-side logic (no database, API, or authentication). See `ARCHITECTURE.md` for the full engineering rationale.

## Tech Stack

- HTML5
- CSS3 (modular stylesheets under `css/`)
- Vanilla JavaScript (`js/main.js`)
- Project content driven by static JSON (`data/projects.json`)

## Project Structure

```text
.
├── index.html          # Single-page portfolio
├── css/                # Modular stylesheets (base, layout, hero, projects, ...)
├── js/
│   └── main.js         # Theme toggle, animations, project rendering, interactions
├── images/             # Photos, logos, project diagrams
├── videos/             # Project demo videos
├── data/
│   └── projects.json   # Project cards content (single source of truth)
├── files/
│   └── resume.pdf      # Downloadable resume
├── ARCHITECTURE.md     # Engineering review & architecture decisions
└── README.md
```

## Run Locally

The site is fully static, so any static file server works. Pick one:

```bash
# Option A: Python (built-in)
python -m http.server 8000

# Option B: Node (npx, no install)
npx serve .
```

Then open `http://localhost:8000`.

> Tip: opening `index.html` directly via `file://` mostly works, but the project cards load `data/projects.json` via `fetch`, which some browsers block on `file://`. Using a local server (above) avoids that.

## Updating Content

- **Project cards**: edit `data/projects.json` (title, summary, tech tags, details, diagrams, demo video, GitHub link). The renderer in `js/main.js` mounts them into the `#work-projects` container in `index.html`.
- **Resume**: replace `files/resume.pdf`.
- **About / Experience / Education**: edit the corresponding sections directly in `index.html`.
- If content looks stale during local development, hard-refresh with `Ctrl + F5`.

## Deployment

The site is deployed as a static site (recommended: Vercel or Cloudflare Pages — both free, always-on, instant load, no cold start).

Vercel:
1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Framework Preset: **Other**; Build Command: empty; Output Directory: `.` (root).
4. Deploy, then attach the custom domain `xueyingwang.co.uk` (update DNS at your registrar to point to Vercel).

## License

No license file is currently present. Add an explicit license if you plan to open-source this project.
