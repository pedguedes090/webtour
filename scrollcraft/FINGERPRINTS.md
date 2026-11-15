# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| `vietnam-atlas` | Atlas Expedition Surface | 7-pillar sticky sunlit header (`Hotels & Homes`, `Map`, `Flights`, `eSIM`, `Tours`, `Giftcards`, `Supports`) + `explore.html`/`admin.html` links + `VI/EN` & `VNĐ/USD` toggles + `Lập hành trình` CTA | 5-plane sunlit `parallax` + stationary Expedition Search Launcher | 8 acts (`pin > flow > pin[silence] > scrub[peak] > pan > flow[reveal] > pin[count] > flow[spotlight]`), 14.29vh (`12863px` @ `1440x900`) | Resolved Working Trip Dossier & Booking Submission Desk syncing via `VietnamAtlasStore` (`explore.html` & `admin.html`) above `.va-colophon` | Persistent S-Curve Vietnam Route Ledger (`stroke-dashoffset` + GPS waypoints) & Weather-Sync Cross-Tab Trip Dossier | Sunlit coastal editorial & documentary photography (`#FAF8F4` alabaster, `#0B7A69` jade) | 4512 |

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- **Grammar (`vietnam-atlas`):** `Atlas Expedition Surface` (7-pillar booking & dossier surface linked across `index.html`, `explore.html`, `admin.html`).
- **Nav treatment (`vietnam-atlas`):** 7-pillar sticky sunlit bar with `VI/EN`, `VNĐ/USD`, multi-page portal/CMS links, and `Lập hành trình` primary CTA.
- **Hero device (`vietnam-atlas`):** 5-plane sunlit coastal `parallax` (`plate`, `mid`, `subject`, `fore`, `mobile`) + stationary Expedition Search Launcher.
- **Act-sequence shape (`vietnam-atlas`):** 8 acts (`pin > flow > pin[silence] > scrub[peak] > pan > flow[reveal] > pin[count] > flow[spotlight]`) at `14.29vh` (`12863px` @ `1440x900`).
- **Close pattern (`vietnam-atlas`):** Resolved `flow` + `spotlight` Trip Dossier & Booking Submission Desk backed by `VietnamAtlasStore` above `.va-colophon`.
- **Signature move (`vietnam-atlas`):** Persistent S-Curve Vietnam Route Ledger (`stroke-dashoffset` + GPS waypoints) & Weather-Sync Cross-Tab Trip Dossier.
- **World (`vietnam-atlas`):** Sunlit coastal editorial & documentary photography (`#FAF8F4` warm alabaster ground, `#132623` pine ink, `#0B7A69` tropical jade accent). Shares nothing with prior rows (first shipped build in this workspace).

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
