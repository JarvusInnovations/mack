# Changelog

## 1.3.0 (2026-11-07)

First release of the maintained fork, published as `@jarvus/mack`. Forked from [tryfabric/mack](https://github.com/tryfabric/mack) at commit [`5dc0226`](https://github.com/tryfabric/mack/commit/5dc0226) (September 2023), which is the upstream `1.2.1` release plus an escaping fix.

### Features

- Render markdown tables as native Slack `table` blocks, with column alignment preserved ([`437cce3`](https://github.com/JarvusInnovations/mack/commit/437cce3))
- Render markdown lists as native Slack `rich_text` blocks ([`49c6620`](https://github.com/JarvusInnovations/mack/commit/49c6620))

### Changed

- Task-list items (`- [x]` / `- [ ]`) render inside the native list with their state as a text prefix, `☑ ` / `☐ ` by default; `lists.checkboxPrefix` still overrides it, so upstream callers keep working.

### Fixes

- Decode escaped HTML entities in output text ([`dfd7b1a`](https://github.com/JarvusInnovations/mack/commit/dfd7b1a))
- Decode HTML entities inside code blocks ([`9439113`](https://github.com/JarvusInnovations/mack/commit/9439113), [`c8205e7`](https://github.com/JarvusInnovations/mack/commit/c8205e7))
- Add the `he` dependency used for entity decoding ([`d0a9d6c`](https://github.com/JarvusInnovations/mack/commit/d0a9d6c))

### Packaging

- Rename the package to `@jarvus/mack`
- Commit build output so the package can be installed from git ([`ccc4991`](https://github.com/JarvusInnovations/mack/commit/ccc4991))
- Remove the `prepare` script, which broke git installs because `tsc` is a dev dependency
- Publish only `build/src`, `LICENSE`, `README.md` and `CHANGELOG.md`
- Require Node.js 20 or newer

## 1.2.1 and earlier

Upstream [tryfabric/mack](https://github.com/tryfabric/mack); see its [releases](https://github.com/tryfabric/mack/releases).
