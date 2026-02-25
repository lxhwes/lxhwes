# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

This is the `lxhwes/lxhwes` GitHub profile repository — the `README.md` on `main` displays at `github.com/lxhwes`. The repo hosts multiple creative profile variants, each on its own branch.

## Branch Structure

Each profile variant lives on a dedicated branch:

| Branch | Style |
|--------|-------|
| `profile/terminal-session` | Live terminal / dev workflow |
| `profile/api-docs` | Developer-as-API-service |
| `profile/code-playground` | Algorithms and patterns |
| `profile/system-architecture` | Infrastructure diagrams |
| `profile/rpg-rogue` | Dynamic RPG stats via GitHub Actions |
| `profile/git-log` | Career as git commit history |
| `profile/debug-session` | Skills as a debugging session |

The `main` branch README is an index that links to all variants.

## Key Files

- `README.md` — Profile index (live on GitHub); links to all variant branches
- `rogue.md` — Research/planning notes for the RPG profile variant (scratch doc, not published)

## RPG Variant Notes

The `profile/rpg-rogue` branch uses a GitHub Actions workflow (`.github/workflows/update-readme.yml`) with a Python script that:
- Authenticates via `GITHUB_TOKEN`
- Fetches contribution stats through the GitHub API (PyGitHub)
- Calculates RPG attributes (Level, XP, Strength from PRs, etc.)
- Commits an updated `README.md` on a daily schedule

XP formula: `10 × commits + 20 × issues_closed + 50 × prs_merged`; Level = `XP // 1000`.
