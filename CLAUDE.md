# LOCKET

## Repository layout

| Path | What it is |
| --- | --- |
| `backend/` | LOCKET API and services — our code |
| `frontend/` | LOCKET web client — our code |
| `deer-flow/` | Clone of [bytedance/deer-flow](https://github.com/bytedance/deer-flow) — **upstream, not ours** |

`deer-flow/` is a reference checkout of a third-party project. Treat it as
read-only: do not edit files there, and do not add LOCKET guidance to its
`CLAUDE.md` or `AGENTS.md`. Local edits become drift against upstream and
conflict on the next `git pull`. Changes meant for that project go through a
pull request to the upstream repo instead.

## gstack

Use the `/browse` skill from gstack for **all** web browsing.

**Never** use `mcp__claude-in-chrome__*` tools.

### Available skills

`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`,
`/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`,
`/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`,
`/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`,
`/setup-gbrain`, `/retro`, `/investigate`, `/document-release`,
`/document-generate`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`,
`/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`,
`/learn`

### Install

These skills are per-developer, not vendored into this repo. If the commands
above are not available, install gstack once:

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack \
  && cd ~/.claude/skills/gstack && ./setup
```

Update later with `/gstack-upgrade`.
