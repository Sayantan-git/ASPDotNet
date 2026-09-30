# Deployment

## Static Learning Website

The site is a static React application with hash routes. It can run on GitHub Pages or another static file host. It does not need a Node.js server after building.

```powershell
npm ci
npm test
npm run lint
npm run build
npm run preview
```

Serve the generated `dist` directory over HTTP/HTTPS. Do not double-click its HTML file: browser module loading and asset behavior require a web server. The starter archive is generated from an allowlist of source-file types before each build and copied into the output.

The Vite base is `./`. Route state follows the hash, for example `/#/learn/async-and-await`, so a repository subpath does not require server rewrite rules. A refresh on a lesson requests the static document rather than a server-side `/learn/...` route.

## GitHub Actions

The included workflow:

1. Checks out source and installs Node 22 and .NET 10.
2. Restores frontend dependencies with `npm ci`.
3. Runs content/state tests, lint, formatting checks, and a production build.
4. Installs Chromium and runs production-browser tests.
5. Runs real API integration tests and the CLI smoke checks.
6. Uploads the static Pages artifact after verification.
7. Deploys only non-pull-request runs from the repository's default branch.

Set **Settings > Pages > Build and deployment > Source** to **GitHub Actions**. Pushes to `main` and `master`, pull requests, and manual runs are configured. If your default branch has another name, adjust the workflow's push branch list. Protected environments may require a human approval before deployment.

The workflow has read-only repository permissions during verification. The deployment job has the Pages and OIDC permissions needed by the official deployment action. No personal access token is required in the application source.

## Progress and Origin Changes

Browser storage is origin-specific. Development at `localhost`, a Pages site, and a custom domain have different saved progress. Export from the old site and restore into the new one. A restore replaces the current browser's progress only after validation and confirmation. Keep a backup before replacing it.

There is no service worker or offline-install guarantee. Fonts, icons, course content, diagrams, and the starter archive are local build assets, but the initial site load still needs a working host or a suitable browser cache. External documentation links need connectivity.

## ASP.NET Core Starter

The .NET API is a separate educational application under `examples/TaskFlow.Api`. GitHub Pages cannot host its process. See `examples/README.md` before running it, and keep it local until you implement the production milestones.

For a real server deployment, explicitly address:

- Trusted authentication, resource/tenant authorization, and negative tests.
- HTTPS, reverse-proxy trust, request limits, and safe error handling.
- A reviewed migrations-managed database plan, backup, and restoration.
- Persistent data paths and database permissions.
- Secure configuration and credentials, with no secrets in Git.
- Runtime and package servicing, telemetry privacy, and least privilege.
- Process supervision, health/readiness, shutdown, and recovery.

The local starter's `EnsureCreated` strategy is not a production migration system. Its health endpoint reports basic host availability, not complete database readiness.

## Release Check

Run the documented checks against the exact candidate source. Open the production preview on desktop and mobile, follow a deep link, open a diagram, answer a quiz, export a backup, and download the starter ZIP. Confirm the deployed URL and assets after the Pages action completes. Building locally is not evidence that a remote deployment has occurred.
