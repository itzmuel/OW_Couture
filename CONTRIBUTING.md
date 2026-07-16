# Contributing

## Workflow

1. Create a feature branch from `main`.
2. Keep changes focused and small.
3. Run checks before opening a PR.
4. Open a pull request with a clear summary.

## Branch Naming

Use one of these prefixes:

- `feature/<short-description>`
- `fix/<short-description>`
- `chore/<short-description>`
- `docs/<short-description>`

## Local Checks

Run these commands before submitting:

```bash
npm run build
npm run lint
```

## Pull Request Checklist

- [ ] Build passes locally (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Scope is limited to a single objective
- [ ] UI changes tested on desktop and mobile
- [ ] New routes/components documented in PR notes

## Commit Message Style

Use concise, imperative commit messages, for example:

- `Add admin consultation dashboard`
- `Fix scroll reveal replay behavior`
- `Update consultation routing`
