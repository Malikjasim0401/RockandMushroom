# Birdify v1 — Phase Plan & Status

Execution order is strict. A phase may start **only** when its status is `Approved` (set by the
project owner). When a phase is finished, Claude sets it to `Awaiting review` and reports; the
owner marks it `Done` and approves the next one.

Status values: `Not started` · `Approved` · `In progress` · `Awaiting review` · `Done`

| Phase | Name | Brief milestone | Status |
| ----- | ---- | --------------- | ------ |
| 0 | Plan & docs | — | Done |
| 1 | Foundation | M1 (part) | Done |
| 2 | Authentication | M1 | Awaiting review |
| 3 | Backend: Functions + rules | M2 (part), M3 (rules) | Awaiting review |
| 4 | Identify flow | M2 | Awaiting review |
| 5 | Journal, Home, Detail | M3 | Awaiting review |
| 6 | Motion & polish | M4 (part) | Done |
| 7 | Ship | M4 | Awaiting review |
| 8 | Rebrand to RockAndMushroom (D22) | — | Not started (needs D22 + owner approval) |

## Target folder structure

```
birdify/
├─ app/                         # Expo Router routes (thin: compose components + hooks)
│  ├─ _layout.tsx               # providers, fonts, splash, auth guard, root Stack
│  ├─ (auth)/_layout.tsx
│  ├─ (auth)/sign-in.tsx
│  ├─ (tabs)/_layout.tsx        # custom tab bar + raised camera button
│  ├─ (tabs)/index.tsx          # Home
│  ├─ (tabs)/journal.tsx
│  ├─ identify.tsx              # fullScreenModal
│  ├─ result.tsx
│  └─ bird/[id].tsx
├─ components/
│  ├─ ui/                       # Button, Card, Sheet, GradientBg, TextField, Text, Skeleton, Toast
│  └─ bird/                     # BirdCard, FactChip, StatCard, ConfidenceBadge
├─ hooks/                       # useAuth, useSightings, useIdentify, useReducedMotionSafe
├─ lib/
│  ├─ firebase.ts               # app/auth(AsyncStorage)/db/storage/functions + emulator switch
│  ├─ auth.ts                   # signUp, signIn, signOut, resetPassword, error mapping
│  ├─ sightings.ts              # save (transaction), subscribe, get, search helpers
│  ├─ identify.ts               # resize → upload → callable
│  ├─ errors.ts                 # typed error → user message mapping
│  └─ types.ts                  # Sighting, IdentifyResult, UserProfile
├─ theme.ts                     # ONLY source of colors, type, radii, spacing, shadows, motion
├─ functions/
│  ├─ src/index.ts              # exports identifyBird (Firestore trigger, D15)
│  ├─ src/identify/{handler,claim,imagePath,rateLimit,request,openai,schema,prompt}.ts
│  ├─ test/                     # unit, rules and handler tests (vitest + emulators)
│  └─ package.json, tsconfig.json, .env (OPENAI_MODEL)
├─ docs/                        # BRIEF, PHASES, DECISIONS, design/
├─ firestore.rules  storage.rules  firestore.indexes.json  firebase.json  .firebaserc
└─ app.config.ts  eas.json  .env.example  tsconfig.json  eslint + prettier config
```

---

## Phase 1 — Foundation
**Deliverables**
- [x] Expo (latest stable SDK) + Expo Router + TypeScript `strict` (+ `noUncheckedIndexedAccess`); `@/` path alias
- [x] ESLint (no `any`, react-hooks rules) + Prettier; `npm run typecheck` / `lint` scripts
- [x] All brief libraries installed via `npx expo install` (SDK-matched versions)
- [x] `app.config.ts`: name, slug, scheme, bundle id/package `co.raytechlab.birdify`, iOS usage strings, Android `CAMERA`, plugins (expo-router, expo-camera, expo-image-picker, fonts), env typing
- [x] `eas.json`: `development` (dev client), `preview`, `production` profiles
- [x] `.env.example` with all `EXPO_PUBLIC_FIREBASE_*` keys; `.env` git-ignored
- [x] `theme.ts`: colors, typography scale, radii, spacing, shadows (iOS shadow + Android elevation), motion durations/springs, gradient-angle → start/end helper
- [x] Fonts: Fraunces 600, Hanken Grotesk 400/600/700 + 400 italic; splash held until loaded
- [x] `lib/firebase.ts`: single init; `initializeAuth` + `getReactNativePersistence(AsyncStorage)`; Firestore, Storage, Functions; emulator switch via `EXPO_PUBLIC_USE_EMULATORS`; Metro config for Firebase RN build
- [x] UI primitives: `GradientBg`, `Text`, `Button` (135° gradient, shadow, pressed state, loading), `Card`, `TextField`
- [x] `(tabs)/_layout.tsx` with custom tab bar + raised camera button; placeholder screens for all routes
- [x] `git init`, `.gitignore`

**Verify**
- [x] `npm run typecheck` and `npm run lint` pass with zero errors (also Prettier, `expo-doctor` 21/21, and `expo export` for iOS + Android)
- [ ] Dev build boots on a real Android device and on iOS (EAS)
- [ ] Fonts, gradients, tab bar, and camera button render per tokens; navigation works

## Phase 2 — Authentication
**Deliverables**
- [x] `useAuth` / `useUser` over an external session store (`lib/session.ts`, `useSyncExternalStore`: no provider, only subscribers re-render) (`onAuthStateChanged`, `initializing` flag — no flash of wrong screen)
- [x] Root guard: signed-out → `/(auth)/sign-in`; signed-in → `/(tabs)`
- [x] Sign-in screen: sign in / sign up toggle, display name on sign up, validation, show/hide password, keyboard-avoiding, forgot-password (reset email) with confirmation
- [x] `lib/auth.ts` with Firebase error-code → friendly message mapping
- [x] On sign up: create `users/{uid}` `{ displayName, email, createdAt: serverTimestamp(), speciesCount: 0 }`
- [x] Sign out entry point on Home

**Verify (= M1)**
- [ ] Sign up, log in, log out, forgot password work against Firebase Auth (all four verified against the Auth emulator; real project needs Email/Password enabled, see D12)
- [ ] Session survives app kill; signed-out users land on sign-in
- [x] Typecheck + lint pass (plus Prettier and iOS + Android `expo export`)

## Phase 3 — Backend: Functions + rules
**Prerequisites from owner:** Firebase project on Blaze, region choice, `OPENAI_API_KEY` set via
`firebase functions:secrets:set`, `OPENAI_MODEL` value, Firebase Storage set up in the console.

**Deliverables**
- [x] `firebase.json` (functions, rules, indexes, emulators: Auth, Firestore, Storage, Functions), `.firebaserc`
- [x] `functions/` package: Node 22 (D13), TypeScript strict, `firebase-functions` v7, `firebase-admin`, `openai`
- [x] `identifyBird` as a Firestore trigger on `users/{uid}/identifications/{requestId}` (D15: the org blocks the public invoker a callable needs); secret `OPENAI_API_KEY`; 60 s; 512 MiB; `us-central1` (Firestore `nam5`)
  1. [x] Validate `imagePath` is exactly `users/{uid}/uploads/{requestId}.jpg` (no `..`, no nesting); never delete a file that fails validation
  2. [x] Claim the request (`pending` → `processing`) and charge the 50/day quota on `users/{uid}/meta/usage` in **one transaction**, so duplicate event deliveries are free
  3. [x] Download, size and JPEG checks, base64 → OpenAI Structured Outputs (`json_schema`, strict), 12 s timeout, one retry
  4. [x] Validate the parsed result; write `status: done` + `result`, or `status: error` + `{ code, message }` (`resource-exhausted`, `unavailable`, `deadline-exceeded`, `not-found`, `invalid-argument`, `internal`)
  5. [x] Always delete the temp upload; structured logging, never log secrets
- [x] `firestore.rules`: owner-only allow-list; request create is exact-shape only, clients can never update a request; `meta` read-only (D1)
- [x] `storage.rules` (as in the brief)
- [x] TTL policy on `identifications.expireAt` (24 h) in `firestore.indexes.json`
- [x] Tests in `functions/test/`: unit, rules, and handler (vitest + emulators)

**Verify**
- [x] 39/39 backend tests pass on the emulators; mutation runs (no duplicate guard, loose request rules, the brief's original rules) each fail the right tests
- [x] End to end with the client SDK against the real trigger in the emulators: cross-user request refused, outcome written, temp upload deleted, call counted, client can't overwrite the outcome
- [x] Other users' paths and signed-out clients rejected (rules + function)
- [x] 51st call in a day returns `resource-exhausted`
- [x] Temp file deleted on success and failure
- [x] Real OpenAI call with the production key and model: strict schema accepted, output parsed; warm latency 2.0–4.3 s
- [x] Deployed: Firestore rules and TTL policy (database out of test mode)
- [x] Deployed: `identifyBird` trigger (Node 22, 2nd gen, `us-central1`), after granting the runtime service account its roles (D16)
- [x] Deployed: Storage rules, split by operation after a live probe showed the brief rule denies owner reads in production (D17)
- [x] Live smoke test without Storage (throwaway account, cleaned up): trigger fires, cross-user request refused, quota charged, limit reset blocked, TTL set, error written; round trip 1.7–1.8 s before OpenAI
- [x] Live photo test (CC0 iNaturalist goldfinch, throwaway accounts, cleaned up): American Goldfinch (Spinus tristis), 99%, facts + summary filled; no-bird photo → isBird false; warm total 5.1–5.5 s with parallel upload (D18; cold 6.8 s → D9)

## Phase 4 — Identify flow
**Deliverables**
- [x] `identify.tsx` as `fullScreenModal`: permission flow (asks on first open; retry or Settings if declined), `CameraView`, viewfinder + hint, shutter (scale 0.92 spring + light haptic, capture flash), flip, gallery pick, Photo / Sound ("Soon", disabled) toggle, `cameraBg` panel
- [x] Camera unmounted when screen unfocused (`useIsFocused`; only one preview at a time)
- [x] `lib/photo.ts`: resize to 1024 px on the long edge, JPEG 0.7, always re-encoded (HEIC/PNG → JPEG); native image memory released
- [x] `lib/identify.ts`: offline check (`expo-network`) → upload `uploads/{id}.jpg` (`contentType: image/jpeg`) **in parallel with** creating `identifications/{id}` (D15, D18) → `onSnapshot` until `done` / `error`, 30 s timeout → typed result / `IdentifyError` (`offline`, `timeout`, `limit`, `failed`, `aborted`); request doc deleted afterwards; result validated at the boundary
- [x] Storage retries capped at 20 s (the SDK default is 10 minutes), so failures surface quickly
- [x] `useIdentify`: state machine `preparing → uploading → identifying → success | noBird | limit | error`; the photo is prepared once and reused on retry; unmount cancels the listener and ignores late results
- [x] `result.tsx`: photo full-bleed, scan band sweeping the photo + skeleton shimmer card with live phase label while loading, result sheet springs up (damping 18) with staggered sections
- [x] Result content: confidence badge, species, italic scientific name, family, 2 × 2 fact chips, summary, Retake; "Add to journal" shown, wired in Phase 5
- [x] Error states: "No bird found" + Retake; `confidence < 60` → "Best guess" badge + alternatives with confidence bars; "Daily limit reached, try tomorrow" + Back to home; network/function error → toast + Try again (photo kept) + Retake
- [x] All motion respects Reduce Motion (shimmer, scan and flash are skipped; springs become instant)

**Verify (= M2)**
- [x] Typecheck, lint, Prettier, `expo-doctor` 21/21; iOS + Android bundles build
- [x] Backend flow the app uses, verified live in Phase 3: goldfinch → *Spinus tristis* 99%, no-bird → isBird false, warm 5.1–5.5 s
- [ ] Camera capture and gallery pick both reach Result (on device)
- [ ] Clear bird photo returns a result in < 6 s on Wi-Fi (on device)
- [ ] All four error states render correctly (on device: airplane mode for the network error)

## Phase 5 — Journal, Home, Detail
**Deliverables**
- [x] `lib/sightings.ts` save: pre-generated id → upload `sightings/{id}.jpg` + resolve its URL → **one transaction** for sighting doc + species marker + `speciesCount + 1` (D2; `merge`, so a missing profile doc is created) → the photo is deleted if the transaction fails; offline check first
- [x] Double-tap guard (`useSaveSighting`: a ref, so one result can only be saved once); Result button goes Add to journal → saving → "Saved to journal ✓" → Journal (brief flow R → J)
- [x] `lib/journal.ts` + `useJournal`: one app-wide pair of live listeners (sightings `seenAt desc` + profile `speciesCount`), attached and detached with the session (D5); Home, Journal and Detail update the moment a save lands
- [x] Home: greeting + account, Identify hero card, species count + this week (Monday start), 3 most recent rows, loading skeletons, empty state with a call to action
- [x] Journal: 2-column grid (exact half-width cells, virtualized, memoized cards), search on common + scientific name (`useDeferredValue`), cards fade + rise 8 px staggered 40 ms (first 12), warm accent dot, loading / error / empty / no-matches states
- [x] `bird/[id].tsx`: parallax hero photo (stretch on iOS overscroll; static under Reduce Motion), confidence badge, names, family, full seen date, fact chips, About summary, notes editor (saves on blur or Save; saving / saved / error feedback; 1000-character cap), not-found and loading states
- [x] Photo URL stored on the sighting (D19), so the grid needs no per-photo URL request; `expo-image` memory + disk cache, recycling keys in lists

**Verify (= M3)**
- [x] Typecheck, lint, Prettier; iOS + Android bundles build
- [x] Journal write pattern on the emulators with the client SDK (8/8): distinct species counted once (including two concurrent saves of a new species), profile created by `merge`, newest-first query, photo URL readable, notes update allowed, owner can read the photo, other users can't list the journal
- [x] Rules deployed (Phase 3); cross-user access denied (rules tests + live probe)
- [ ] Add to journal saves photo + doc; Home recent + stats update without restart (on device)
- [ ] Journal grid, search by both names, detail screen (on device)

## Phase 6 — Motion & polish
**Deliverables**
- [x] Journal cards fade + rise 8 px, 40 ms stagger (first 12 cards); all transitions 200–300 ms, ease-out (`theme.motion`, `enter()`, `transitions.*`)
- [x] Reduce Motion everywhere, audited file by file. Press springs become opacity dips; layout and entrance animations snap; shimmer, scan band and capture flash are skipped; the detail parallax is static; **native stack transitions become a fade** (Android doesn't do this on its own); tab switches become instant
- [x] Tab switch cross-fade, selection haptic on tab change, stat numbers pop when they change
- [x] Accessibility: every control has a role and a label (audited); decorative icons and images are hidden; headers carry the header role; live regions on toasts, notices and save status; 44 pt minimum targets (with hitSlop on small controls); font scale capped at 1.35× on all text and inputs
- [x] Performance: memoized list rows with stable callbacks; static StyleSheets in lists; one shared journal listener; photo URLs stored on sightings; `expo-image` memory + disk cache with recycling keys; camera unmounted when unfocused; native image memory released after resize; every animation cancelled on unmount; `removeClippedSubviews` off on the animated grid (it clashes with entering animations on Android)
- [x] UX polish: cross-platform clear button on search (`clearButtonMode` is iOS-only); camera error toasts dismiss themselves after 4 s
- [x] Code audit: no colors outside `theme.ts`; the flash timing moved into the theme
- [ ] Screen-by-screen comparison with the design canvas (D4: no canvas access; send screenshots and I'll match them)

**Verify**
- [x] Typecheck, lint, Prettier; iOS + Android bundles build
- [ ] 60 FPS on a mid-range Android device (on device: Settings → Developer options → Profile HWUI rendering)
- [ ] Reduce Motion on → no sliding or springing (on device)

## Phase 7 — Ship
**Prerequisites from owner:** Apple Developer, Google Play Console and Expo accounts.

**Deliverables (done in the repo)**
- [x] App icon (1024, opaque), Android adaptive icon (foreground within the 66% safe zone, gradient background, monochrome for themed icons), favicon: Birdify leaf + sun mark on the brand gradient
- [x] Splash: native splash (`splash-icon.png` on `bgTop`), verified in the generated Android resources (all densities, Android 12 splash API) and the iOS launch storyboard; then a React Native splash (`components/brand/AnimatedSplash.tsx`) with the identical image fades into the app
- [x] Android permissions trimmed: `SYSTEM_ALERT_WINDOW` and `WRITE_EXTERNAL_STORAGE` blocked (unused)
- [x] In-app account deletion (D21): account menu → Delete account (password confirm) → `cleanupUser` trigger removes all data and photos
- [x] Store listing, privacy answers, screenshot shot list and review notes: [docs/STORE.md](STORE.md)
- [x] `cleanupUser` deployed (Node 22, 1st gen, `us-central1`) and tested live: throwaway account with a profile, sighting, photo and usage counter → in-app-style re-auth + delete → profile gone, 0 subcollections, 0 files; function log "User data deleted" in 5.9 s, status ok
- [x] Cold-start latency measured (D9): cold 7.7 s, warm 5.9–6.2 s end to end from Pakistan (this run) · warm 5.1–5.5 s (Phase 3 run). Decision left to the owner; see D9

**Owner steps (need your accounts)**
- [ ] D3: keep or drop Android `READ_MEDIA_IMAGES` (Play policy risk)
- [ ] `npx eas-cli init` (links the EAS project and writes `extra.eas.projectId`)
- [ ] EAS environment variables for every `EXPO_PUBLIC_FIREBASE_*` value, `production` environment (`npx eas-cli env:create`)
- [ ] Host the privacy policy (draft in docs/STORE.md) and the account-deletion web page Play requires
- [ ] `npx eas-cli build --platform all --profile production`
- [ ] Store screenshots (shot list in docs/STORE.md)
- [ ] `npx eas-cli submit` to TestFlight and Play internal testing

**Verify (= M4)**
- [ ] Full M1–M4 checklist in BRIEF.md passes on a real iPhone and a real Android device

## Phase 8 — Rebrand to RockAndMushroom (D22)
Starts only when D22 is `Approved` and this phase is `Approved`. Steps run in order; typecheck,
lint and `functions:build` after each.

**Deliverables**
- [x] 1. Identity: `app.config.ts` (name, slug, scheme, bundle id/package, permission strings), `package.json` names, `eas.json`, README, STORE.md
- [x] 2. Theme: new earthy palette, light + dark tokens, gradients, shadows in `theme.ts` only; contrast audit
- [x] 3. Terminology: Bird/Sighting/Species → Specimen/Find/kind across screens, tabs, empty states, auth copy, a11y labels; rename `components/bird` → `components/specimen`, route `bird/[id]` → `specimen/[id]`
- [x] 4. Types + validation: `lib/types.ts` (`kind`, `rock`/`mineral`/`mushroom` traits), boundary validation in `lib/identify.ts`, `lib/sightings.ts`
- [x] 5. Backend: `functions/src/identify/{schema,prompt,openai,handler}.ts` strict schema + prompt, tests updated (D6, D10 kept in sync)
- [x] 6. UI for rich traits: kind badge, trait chips, mushroom edibility warning banner, Detail + Result screens
- [x] 7. Motion pass: screen transitions, button feedback, sheet/result reveal (Reanimated, 200–300 ms ease-out, Reduce Motion)
- [x] 8. Brand assets: logo, icon, splash recolored and redrawn (rock + mushroom mark)
- [x] 9. Collection features (D23): kind filter, redesigned Home, detail tabs, Mohs scale, rotating scan lines, psychoactive verdict

**Verify**
- [x] `npm run typecheck`, `npm run lint`, `npm run functions:build` pass; backend unit tests 15/15 (`functions:test` needs Java 21)
- [ ] `expo export` iOS + Android bundles build
- [ ] Owner: `npm run deploy:backend`; on device: rock, mineral, mushroom and non-specimen photos
