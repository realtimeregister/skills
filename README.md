# Realtime Register Agent Skills
[![skills.sh](https://img.shields.io/badge/skills.sh-install-green)](https://skills.sh/realtimeregister/skills)

This repository contains Agent Skills for working with Realtime Register.


## Install
```bash
npx skills add realtimeregister/skills
```
or, alternatively: `npx skills add realtimeregister/skills --skill {skill}`

## Available Skills
- [Working with the Realtime Register API](./skills/realtimeregister-api)

## Maintenance

Realtime Register API skill is maintained with reusable scripts:

```bash
bun run generate   # render references from YAML spec
bun run audit      # validate spec + fidelity fingerprints
bun run drift      # compare live docs with the checked-in spec
bun run verify     # typecheck, tests, static audit
```

Weekly drift checks run in GitHub Actions. If drift is detected, the workflow
opens or updates a `Fidelity drift verification` pull request on
`auto/fidelity-drift`.
