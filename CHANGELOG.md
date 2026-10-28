# Changelog

## Unreleased — 2026-10-28

Make Thock easier to evaluate from its repository and reproduce locally. This entry describes the presentation pass, not a tagged product release.

| Area | Change | Outcome |
| --- | --- | --- |
| Product proof | Real Finder and Builder captures with a repeatable capture script | Review the actual application without installing it |
| Engineering | Source-linked architecture, tradeoffs and verification map | Trace claims to implementation and tests |
| Local setup | Staged-site HTTP preview | Open clean view routes with one documented command |

### Added

- **Tooling:** `npm run preview`, `npm run docs:check`, a documentation workflow and a real-browser screenshot script.
- **Configuration:** optional-variable documentation with empty placeholders and environment-file ignore rules.

### Fixed

- **Windows verification:** normalize CRLF in the sound-test source harness and SEO text reader so marker extraction and text assertions work with Windows checkouts.

### Documentation and presentation

- Replace stale catalog counts with a link to the generated manifest.
- Add a product walkthrough, Mermaid architecture, module evidence, setup commands and honest data and licensing limits.
- Record screenshot provenance, exact capture settings and suggested GitHub metadata.

### Verification

- `npm ci`: dependency installation completed; npm reported zero vulnerabilities.
- `npm test`: all 136 tests passed locally on Node.js 24.21.0 after the line-ending fixes.
- `npm run catalog:check`: validated 9,581 listings and product links across 24 retailers.
- `npm run site:stage`: staged the checked-in catalog and browser assets.
- `npm run test:boot`: all six delayed-catalog checks passed using installed Chrome.
- `npm run test:ui`: keyboard, focus, clipboard, directory, history, responsive, reduced-motion and touch checks passed using installed Chrome.
- Product captures completed with no page errors at a 1600 × 1000 viewport and 2× scale.

The project's declared minimum runtime is Node.js 22; this local run used Node.js 24. Browser tooling used the optional existing-Chromium override. No live retailer recrawl or optional API-key discovery was performed.

The supplied portable README validator was also run in strict mode. Its npm-command parser truncates colon-delimited script names and treats `npm ci` as a custom script, producing six false warnings. The repository's `docs:check` validates full script names against `package.json`, local links and anchors, heading order, code fences and media sizes without those parser errors. Remote link availability is outside that check.
