# Branch Protection Guidance

Use this configuration for `main` in GitHub repository settings.

## Recommended Rules for `main`

- Require a pull request before merging
- Require approvals: 1 minimum
- Dismiss stale approvals when new commits are pushed
- Require conversation resolution before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict who can push to matching branches (optional for solo workflow)
- Do not allow force pushes
- Do not allow deletions

## Suggested Required Checks

If CI is configured, require checks such as:

- `build`
- `lint`

## Setup Path

1. Open repository Settings.
2. Go to Branches.
3. Add branch protection rule for `main`.
4. Enable the rules above.
5. Save changes.
