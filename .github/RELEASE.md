# Automated Release Workflow

This repository uses [semantic-release](https://semantic-release.gitbook.io/) to fully automate releases. There is no manual version bump, tag, or `npm publish` step — it all happens automatically when commits land on `main`.

## How It Works

Every push to `main` (i.e. every merged PR) triggers the `Release & Publish` workflow. It:

1. **Runs Tests**: lint, typecheck, unit tests, build — release is aborted if any fail
2. **Analyzes commits** since the last release using [Conventional Commits](https://www.conventionalcommits.org/)
3. **Determines the version bump** (or decides no release is needed)
4. **Updates `CHANGELOG.md`** and `package.json`
5. **Publishes to npm**
6. **Creates a git tag and GitHub Release** with generated release notes
7. **Commits the version bump** back to `main` (tagged `[skip ci]` so it doesn't retrigger the workflow)

If no commit since the last release warrants a version bump (e.g. only `chore:`/`docs:` commits), the workflow runs and exits without publishing anything — this is expected, not a failure.

## Commit Message Convention

The version bump is entirely determined by your commit messages, so they matter. Use [Conventional Commits](https://www.conventionalcommits.org/):

| Commit prefix | Release type | Example |
|---|---|---|
| `fix:` | Patch (`1.0.0` → `1.0.1`) | `fix: correct Authorization header casing` |
| `feat:` | Minor (`1.0.0` → `1.1.0`) | `feat: add batch counter retrieval` |
| `feat!:` or `fix!:` or a `BREAKING CHANGE:` footer | Major (`1.0.0` → `2.0.0`) | `feat!: drop v1 API support` |
| `chore:`, `docs:`, `style:`, `refactor:`, `test:`, `ci:` | No release | `chore(deps): bump rollup` |

A PR merged as a single squash commit needs that squash commit message to follow this convention — the workflow analyzes commits on `main`, not the individual commits inside a PR.

## Configuration

The release rules and plugin pipeline live in [`.releaserc.json`](../.releaserc.json):

- `@semantic-release/commit-analyzer` — determines the version bump from commit messages
- `@semantic-release/release-notes-generator` — generates release notes
- `@semantic-release/changelog` — updates `CHANGELOG.md`
- `@semantic-release/npm` — bumps `package.json` and publishes to npm
- `@semantic-release/github` — creates the GitHub Release
- `@semantic-release/git` — commits `package.json`/`package-lock.json`/`CHANGELOG.md` back to `main`

## Required Secrets

- `NPM_TOKEN` — an npm Automation or Granular Access token with publish rights to `counterapi`. Must be visible to this repo (check its repository access if it's an org-level secret).
- `GITHUB_TOKEN` — provided automatically by GitHub Actions; needs `contents: write` (to push the version-bump commit/tag) and `issues: write`/`pull-requests: write` (so `@semantic-release/github` can comment on related issues/PRs). The workflow requests these via `permissions:`.

## Triggering a Release Manually

You normally don't need to — just merge to `main`. If a run failed for a transient reason (network blip, npm registry hiccup) and you want to retry without an empty commit, use **Actions → Release & Publish → Run workflow** (`workflow_dispatch`).

## Troubleshooting

### No release happened after merging
Check the commit message on `main` — if it doesn't start with `fix:`, `feat:`, or contain a breaking-change marker, that's expected behavior, not a bug.

### `npm publish` fails with `404 Not Found`
This almost always means `NPM_TOKEN` isn't valid or isn't visible to this repo — for an org-level secret, check its repository access list in Organization Settings → Secrets and variables → Actions.

### Version already exists on npm
`npm` doesn't allow republishing an existing version. This usually means a previous run partially succeeded (e.g. tagged/committed but failed to publish). Check the latest published version with `npm view counterapi version` versus the latest git tag, and reconcile manually if they've drifted.

### Push to `main` is rejected
If `main` has branch protection requiring PRs, the `@semantic-release/git` step's direct push (using `GITHUB_TOKEN`) will be blocked unless GitHub Actions is allowed to bypass that rule for this repo.
