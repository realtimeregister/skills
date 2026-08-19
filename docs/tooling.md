# Tooling

This repository keeps the Realtime Register skill maintainable with local
scripts.

## Commands

- `bun run generate` renders `skills/realtimeregister-api/references/*.md` from
  the YAML spec.
- `bun run audit` validates the spec and checks verified operation
  fingerprints.
- `bun run doctor` checks that every `docUrl` still resolves upstream.
- `bun run drift` compares the shipped spec with live Realtime Register docs.
- `bun run drift:fix` also applies safe method/path fixes in place.
- `bun run verify` runs typecheck, tests, and the static audit.

## Weekly Drift PRs

`.github/workflows/fidelity-drift.yml` runs every Monday at 03:17 UTC. When
drift is detected, it pushes `auto/fidelity-drift` and opens a PR titled
`Fidelity drift verification`, or updates that PR if it already exists.

The drift script only auto-fixes method/path differences. Required-field-count,
fetch, and parser drift are recorded in `fidelity-drift-report.json` for human
verification before updating the spec.
