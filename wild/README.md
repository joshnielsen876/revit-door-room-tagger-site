# Wireframes v4

**Live URL:** [phloxengineering.com/wild/](https://phloxengineering.com/wild/) (served from this repo’s `wild/` folder on Netlify).

**Source copy:** `Other stuff/wireframes-v4/`. After editing there, sync into `wild/` before deploy.

**Date:** 2026-05-21. **Supersedes:** `wireframes-v3/`.
**Warrant:** `Support docs/research-brief-design-principles-v4.md`.
**Anti-patterns:** `Support docs/design-anti-patterns.md`.

## What this folder is

A visual and interaction rebuild of the prototype. The information architecture (zoo-map navigation, no adaptive engine, always-on Summary, one journal store) is inherited unchanged from `Support docs/session-arc.md`. The "bleh" critique of v3 was a visual-language problem, not an architecture problem, so v4 changes the visual language and leaves the architecture alone.

## Open the prototype

Open `index.html` in any modern browser. No build step, no server. All thirty-one scenarios, the glossary, and the library are real data files loaded as small JS modules; the app boots from `assets/app.js` and persists session state to `localStorage` under the key `living-link-v4:session`. To start over: open the Today screen (`07-today.html`) and use *Start fresh*, or run `localStorage.clear()` in the devtools console.

## The screens

| File | Purpose |
| --- | --- |
| `index.html` | Folder overview, changes vs v3, links to every screen. |
| `01-welcome.html` | Two-sentence promise. Trauma-informed safety cues sitting *inside* the design. The Begin CTA flips to *Pick up where you left off* if state exists. |
| `02-journey.html` | Ten stages of the donation process. |
| `03-map.html` | The exhibit-hall zoo map. Five zones; counts and the "suggested" treatment update from state. |
| `04-ecosystem.html` | Data-driven: lists every scenario tagged to the chosen ecosystem, with sub-area chip filters. |
| `05-scenario.html` | Data-driven scenario card. One statement at a time. Glossary footnotes pop over; the mandated-reading call-out opens a bottom-sheet drawer. The note pill opens a journal sheet pre-tagged to the story. Responses persist immediately. |
| `06-summary.html` | The two-voice document, computed live from your responses and notes. Toggle between *stage* axis and *stance* axis. Open ("not sure yet") responses become the warm agenda. Export buttons produce PDF (print), plain text, and a JSON dump. JSON import restores a session. |
| `07-today.html` | Returning-user surface. "Pick up" and "Try something new" suggestions computed from your last story and unvisited ecosystems. |
| `08-library.html` | Library index. Eleven articles grouped by topic, with review-status chips and a *read* chip after you've opened them. |
| `09-article.html` | Reader treatment of a single article. The mandated-reading drawer uses the same body. |
| `10-notes.html` | Every note you've written, free or per-story, with delete. The + button opens the same sheet the scenario card uses. |

## Data files

| File | What's in it |
| --- | --- |
| `data/ecosystems.js` | The five zones and ten donation-process stages. |
| `data/scenarios.js` | All 31 scenarios from `manual scenarios.md`, with statements, stance polarity, ecosystem and stage tags, and references into the glossary and library. |
| `data/glossary.js` | Mirror of `data files/glossary.json` (seven seed terms). |
| `data/library.js` | Mirror of `data files/library-content.json` (eleven articles). |

The JS modules are mirrors of the canonical JSON files in `data files/`; production would compile from the JSON. They live here as modules so the prototype runs on `file://` without a build step or a server.

## Design-system decisions, in one paragraph

Type pairing is Newsreader (humanist serif, for the quoted voices: scenario stems, summary statements, the user's own words) and Inter (neutral grotesque, for chrome, buttons, eyebrows). Colour is held to two confident moments: the slate-blue accent (`--accent`) for nav and primary actions, and the terracotta warm-secondary (`--warm`) used in exactly two semantic places — the map's "suggested" zone and the Summary's "Take into your next conversation" section. Motion is one easing curve, one duration, defined once as `--motion-ease` and `--motion-dur` (200ms `cubic-bezier(0.2, 0, 0, 1)`). Type, colour, and motion choices are explained at the top of `assets/styles.css`.

## What changed from v3, in one paragraph

The scenario card is rebuilt as a page from a small reader — serif stem, one statement at a time, calm reveal, easy change-of-mind by fading rather than removing unselected options, a single quiet "What's next?" footer instead of three competing action surfaces. The zoo map is rebuilt as an exhibit hall with hand-drawn-feeling SVG motifs and a confident "suggested" treatment that spans the full row instead of being a tile with a badge. The Summary is rebuilt against the session-arc spec, not the v3 file: two-voice provenance (system-authored statements and verbatim user notes, visibly attributable through a left-rule colour and inline byline); organised primarily by donation-process stage with a stance-axis toggle one tap away; the "Still working through" section reframed as "Take into your next conversation" with the warm-secondary colour earning its keep there. A Today surface is added for returning users. An always-visible "Leave for now" affordance lives in the header, per trauma-informed-design practice. The v3 design system (`wireframes-v2/assets/styles.css`) is treated as scaffolding, not as a starting palette; v4 has its own stylesheet.

## What is *deliberately* not here

- No adaptive engine, no "for you" curation. Shelved for the prototype (`Narrative draft.md`).
- No streaks, points, badges, levels, celebratory animation, countdown timers, surprise modals, or guilt-trip re-engagement. Itemised in `Support docs/design-anti-patterns.md` with citations.
- No literal cartography for the zoo map. The exhibit-hall version lands cleanly; a literal map remains a v5 backlog item.

## Decisions deferred to user testing

1. Self-hosted versus CDN fonts. The prototype uses Google Fonts for convenience; production should self-host and subset Newsreader + Inter for privacy and offline.
2. Whether the warm secondary stays a single hue across the product or splits into one hue per zoo zone.
3. Whether the Summary's stage-axis default is hard-coded or user-pickable on first view.
4. Whether the per-card journal pill coexists with a tab-bar Notes destination, or whether one is redundant.

## Files

```
wireframes-v4/
  README.md
  index.html
  01-welcome.html
  02-journey.html
  03-map.html
  04-ecosystem.html
  05-scenario.html
  06-summary.html
  07-today.html
  assets/
    styles.css     (design tokens + every component used in v4)
    app.js         (one-statement-at-a-time reveal, axis toggle, toast)
```
