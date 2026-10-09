# RockAndMushroom: what we are making

A rebrand of the Birdify codebase (Expo / React Native + Firebase + OpenAI vision) into
**RockAndMushroom**: take a photo of a rock, mineral or mushroom and get an identification with rich
traits, then save it to a personal journal of **finds**. Development temporarily uses the existing
Firebase project.

Governing docs: [docs/DECISIONS.md](docs/DECISIONS.md) (D22) and [docs/PHASES.md](docs/PHASES.md)
(Phase 8). This file is the overview; those hold the approval status.

> **Status note:** D22 and Phase 8 still show `Proposed` / `Not started` in the docs. Only the
> owner changes a status, so please set D22 to `Approved` and Phase 8 to `Awaiting review`.

## Product

| Old (Birdify) | New |
| ------------- | --- |
| Bird / Birds | Specimen / Specimens |
| Species | Specimen type (`kind`: `rock`, `mineral`, `mushroom`) |
| Sighting / Journal | Find / Finds journal |
| "No bird found" | "No specimen found" |
| Add to journal | Add to finds |

Core flow (unchanged): sign in → Identify (camera or gallery) → Result → Add to finds → Home,
Journal and Detail update live.

## Decisions

1. **Identity:** name `RockAndMushroom`, slug and scheme `rock-and-mushroom`, bundle id and package
   `co.raytechlab.rockandmushroom`. Firebase config is untouched (the JS SDK ignores the bundle id;
   there are no `google-services` files), so Auth, Firestore, Storage and the functions keep working.
   The EAS project must be re-linked (`npx eas-cli init`).
2. **Backend names stay:** Firestore paths (`sightings`, `species`, `identifications`) and the
   `identifyBird` function keep their names, so the deployed backend, rules and existing data keep
   working. Renaming is a separate migration. Old docs that use `species` for the name are still read.
3. **No new libraries.** Animation is Reanimated only.

## Theme (only in `theme.ts`)

Earthy palette: deep slate (ink and camera), terracotta (primary), forest green (secondary), warm
amber (accent), stone neutrals (surfaces). The app stays a light-theme app (`userInterfaceStyle:
'light'`) with dark-slate camera and photo surfaces. A full system dark theme means making every
token theme-aware and is not part of this phase; say so if you want it. Contrast is checked against WCAG AA
(4.5:1 for small text), which also settles D20 for the new tokens.

## Motion

Reanimated only, 200–300 ms, ease-out, Reduce Motion always respected. Covers screen transitions,
button press feedback, sheet and modal openings, the scan band and the staggered result reveal.
Lists stay memoized, with no inline styles and every animation cancelled on unmount.

## AI identification

Strict JSON schema and prompt in `functions/src/identify/{schema,prompt}.ts`, mirrored in `lib/types.ts`.

| Field | Meaning |
| ----- | ------- |
| `isSpecimen` | False for photos with no rock, mineral or fungus |
| `kind` | `rock`, `mineral` or `mushroom` |
| `name`, `scientificName`, `family` | Common name; binomial, mineral species or rock name; fungal family, mineral class or igneous/sedimentary/metamorphic |
| `confidence`, `alternatives` | 0–100 and up to 2 alternatives |
| `traits` | Rocks and minerals: `rockType`, `hardness` (Mohs), `luster`, `color`, `streak`, `composition`. Mushrooms: `cap`, `stem`, `gills`, `sporePrint`. All: `habitat`, `region` |
| `edibility` | `not_applicable`, `edible`, `edible_with_caution`, `inedible`, `poisonous`, `deadly`, `unknown` |
| `safetyWarning` | Mushroom danger and look-alikes; for rocks only a real hazard (asbestos, toxic or radioactive minerals) |

**Safety rules (enforced in the parser, not only the prompt):** a mushroom can never come back as
`not_applicable` (it becomes `unknown`), rocks and minerals never carry an edibility, and the app
shows a "never eat a wild mushroom based on this app" banner on every mushroom result.

## Steps

Each step ends with typecheck, lint and (for the backend) the function build.

| # | Step | State |
| - | ---- | ----- |
| 1 | Identity: `app.config.ts`, `package.json`, README, STORE.md (`eas.json` has no app name) | Done |
| 2 | Theme: palette, gradients, shadows in `theme.ts`; retired `leaf`, `mint`, `aqua`, `sky` tokens | Done |
| 3 | Terminology across screens; `components/bird` → `components/specimen`, `bird/[id]` → `specimen/[id]` | Done |
| 4 | Types and boundary validation (`lib/types.ts`, `lib/parse.ts`, `lib/identify.ts`, `lib/sightings.ts`) | Done |
| 5 | Backend schema, prompt, parser and tests | Done; builds, 15/15 unit tests pass (emulator tests need Java 21) |
| 6 | Result and Detail UI: kind badge, trait chips, edibility banner | Done |
| 7 | Motion pass: 300 ms navigation, fade into Result; press, sheet and stagger presets already in place | Done |
| 8 | Brand assets: gem logo, icon, adaptive icon, splash, favicon (no mushroom glyph yet) | Done |

## Collection features (D23)

| Feature | Where |
| ------- | ----- |
| Finds filter: All · Rocks · Minerals · Mushrooms, plus search | Finds tab |
| Home: slate scan card with breathing glow, per-kind counters, horizontal carousel, daily field tip | Home |
| Detail tabs: Overview · Properties or Anatomy · Habitat; Mohs hardness scale for rocks and minerals | Find detail |
| Rotating, kind-specific status lines while identifying | Result |
| `psychoactive` edibility verdict (needs a backend deploy before the model can return it) | Backend + app |
| **Not built, needs approval:** GPS tag and origin map (new packages, permissions, privacy changes) | |

## Verification

- `npm run typecheck`, `npm run lint`, `npm run format`
- `npm run functions:build`, `npm run functions:test` (needs `npm install` in `functions/` and Java 21)
- `expo export` for iOS and Android
- Owner: `npm run deploy:backend` (the new schema only takes effect after this), then test a
  rock, a mineral, a mushroom and a non-specimen photo on a device

## Risks

- **Mushroom edibility is safety-critical.** Output is advisory only and the UI says so. The prompt
  is conservative and the parser downgrades missing verdicts to `unknown`.
- **Old journal entries** stay readable through tolerant parsing but have no traits.
- **Prompt quality** can only be judged with real photos, after the backend is deployed.
