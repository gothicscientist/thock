# How Thock works

Thock is a static browser application with an offline ingestion and staging pipeline. There is no application server or account database. The catalog is committed data; a local preview does not need retailer access.

## From store feed to a recommended build

1. [sync-catalog.mjs](../scripts/sync-catalog.mjs) requests public Shopify feeds with three concurrent stores and serial pagination per store. [catalog-network.mjs](../scripts/catalog-network.mjs) checks robots rules and retries requests. Required-source failures, empty feeds, repeated product IDs, incomplete pagination, fewer than 500 listings, or a shrink greater than 20% reject the refresh.
2. [catalog-lib.mjs](../scripts/catalog-lib.mjs) normalizes listings, variants and pack sizes and applies admission rules. The output includes sold-out parts and exclusion reasons; admission is not a promise that an item is purchasable. [supplemental-40s.mjs](../scripts/supplemental-40s.mjs) contributes manually reviewed snapshots, which have their own review date.
3. [photo-check.mjs](../scripts/photo-check.mjs) and [image-check.mjs](../scripts/image-check.mjs) choose checked product crops. Parts without an approved photo use drawn illustrations. [catalog-pack.mjs](../scripts/catalog-pack.mjs) writes builder packs; the directory uses an index and detail shards. Dependent data is written before the manifest.
4. [stage-site.mjs](../scripts/stage-site.mjs) copies browser assets, hashes asset references and emits separate HTML entry points for Finder, Builder, Saved and Directory. [boot-data.mjs](../scripts/boot-data.mjs) runs extracted recommendation functions in a Node VM and verifies that a reduced first-paint snapshot chooses the same boards as the complete catalog.
5. [index.html](../index.html) loads catalog packs after first paint, ranks builds in `evalAns`, and manages quiz, results, swaps and builder state. [directory.js](../assets/directory.js) fetches its index when opened. [share-code.js](../assets/share-code.js) encodes a versioned build into a URL; local saves use browser storage.

## Decisions and their costs

| Constraint | Implemented approach | Design rationale | Cost / boundary |
| --- | --- | --- | --- |
| A large catalog should not block the first Finder card | Generate a 21-board boot pool with the page's own engine; verify reduced and full catalog choices | Reusing the ranking logic avoids a separately maintained approximation | Build tooling extracts script sections by markers; moving those markers can break staging. Boot state covers the initial view, not arbitrary answers. |
| Store feeds vary in completeness and availability | Admission rules, explicit exclusion reasons, required-source gates and catalog shrink guard | Fail a questionable refresh rather than silently publish a depleted catalog | A legitimate large removal needs review. Optional feeds may remain stale or be skipped; scheduled refresh is not a freshness guarantee. |
| Share builds without a backend | Versioned stable IDs, base-36 retailer IDs, encoded answers and shuffle seed | URLs work on static hosting without accounts or server storage | Store letters must remain append-only; question order is versioned. Removed catalog parts cannot be made available by an old link. |

The rationale above describes the tradeoffs visible in the implementation, rather than claiming measured performance gains or reconstructing undocumented author history.

## Deployment gates

[pages.yml](../.github/workflows/pages.yml) runs unit tests, installs dependencies and Chromium, runs UI and delayed-catalog tests, validates the catalog, stages `dist/`, and deploys to GitHub Pages. [catalog.yml](../.github/workflows/catalog.yml) schedules a refresh at **09:17 UTC**, validates and tests generated data, then commits it. A successful workflow completion can trigger Pages deployment. A failed refresh retains the previous committed catalog.

Browser tests intercept external product images with fixtures to test behavior consistently. They prove layout and interaction behavior under controlled networking, not current retailer image availability. The first-paint browser suite separately exercises staged output with catalog requests delayed.

## Evidence map

| Behavior | Source of verification |
| --- | --- |
| Listing admission and rejection | [admission.test.mjs](../tests/admission.test.mjs), [catalog.test.mjs](../tests/catalog.test.mjs) |
| Recommendations and combinations | [quiz.test.mjs](../tests/quiz.test.mjs), [combos.test.mjs](../tests/combos.test.mjs) |
| Swap behavior and link round trips | [swap.test.mjs](../tests/swap.test.mjs), [share.test.mjs](../tests/share.test.mjs) |
| Retailer links and checked images | [product-links.test.mjs](../tests/product-links.test.mjs), [images.test.mjs](../tests/images.test.mjs) |
| Keyboard, modal, history and responsive behavior | [ui.browser.mjs](../tests/ui.browser.mjs) |
| Reduced snapshot and delayed catalog | [boot.test.mjs](../tests/boot.test.mjs), [boot.browser.mjs](../tests/boot.browser.mjs) |
