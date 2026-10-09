# RockAndMushroom

Snap a photo of a rock, mineral or mushroom, learn what it is in seconds, and save it to your
personal collection of finds. RockAndMushroom (rebranded from Birdify, see
[PLAN.md](PLAN.md) and D22) is an iOS and Android app built with Expo (React Native) and TypeScript, with Firebase on
the backend. Photo ID ships in v1; sound ID comes in v2.

> **Status:** All 7 phases are built. Store builds and submission are the owner's remaining
> steps; see [docs/PHASES.md](docs/PHASES.md) Phase 7 and [docs/STORE.md](docs/STORE.md). See [docs/PHASES.md](docs/PHASES.md) for live progress.

## Tech stack

| Layer    | Choice                                                   |
| -------- | -------------------------------------------------------- |
| App      | Expo SDK 57, Expo Router, TypeScript (strict)            |
| UI       | Reanimated 4, expo-linear-gradient, Fraunces + Hanken Grotesk fonts |
| Auth     | Firebase Authentication (email/password)                 |
| Data     | Cloud Firestore, Firebase Storage                        |
| Server   | Cloud Functions, 2nd gen, Node 22                        |
| Specimen ID | OpenAI vision model (`gpt-6-sol`), called only from the `identifyBird` Firestore trigger |
| Builds   | EAS Build + EAS Submit                                   |

## Prerequisites

- Node.js 22 or newer
- Java 21 or newer, for the Firebase emulators (`winget install EclipseAdoptium.Temurin.21.JDK`)
- The Firebase CLI (`npm install -g firebase-tools`), logged in with `firebase login`
- An [Expo account](https://expo.dev/signup) (for EAS builds)
- Access to the Firebase project `birdify-57707` (the existing project, reused for development)
- For iOS devices: an Apple Developer account. iOS builds run on EAS in the cloud, so no Mac is
  needed.

The app uses native modules that Expo Go doesn't include, so it runs in a **development build**,
not in Expo Go.

## Getting started

### 1. Install dependencies

```sh
npm install
```

### 2. Configure environment variables

```sh
cp .env.example .env
```

Fill in the `EXPO_PUBLIC_FIREBASE_*` values from **Firebase console → Project settings → Your
apps → Web app**. These are public identifiers and safe to ship in the app. `.env` is
git-ignored.

| Variable | Purpose |
| -------- | ------- |
| `EXPO_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID` | Firebase web app config (required) |
| `EXPO_PUBLIC_USE_EMULATORS` | `true` to use local Firebase emulators |
| `EXPO_PUBLIC_EMULATOR_HOST` | Your computer's LAN IP when testing emulators on a physical phone |

The OpenAI key never goes in `.env` or the app. It lives only as a Cloud Functions secret.

### 3. Build and install a development build

```sh
npx eas-cli login
npx eas-cli init                                            # links the project to EAS (first time only)
npx eas-cli build --profile development --platform android
npx eas-cli device:create                                   # iOS only: register your iPhone
npx eas-cli build --profile development --platform ios
```

Install the build on your phone from the link EAS prints. You only need a new build when native
dependencies or `app.config.ts` change.

EAS cloud builds don't upload the git-ignored `.env`. Add the same `EXPO_PUBLIC_*` values as EAS
environment variables (`npx eas-cli env:create`, or the Expo dashboard) for each build profile.

### 4. Start the dev server

```sh
npm start
```

Open the RockAndMushroom development build on your phone and connect to the server.

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm start` | Start the Metro dev server for the development build |
| `npm run android` / `npm run ios` | Build and run natively on a local device or emulator |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint and Prettier checks (`expo lint`) |
| `npm run format` | Format the codebase with Prettier |
| `npm run doctor` | Diagnose dependency and config issues (`expo-doctor`) |
| `npm run functions:build` | Compile the Cloud Functions (`functions/lib`) |
| `npm run functions:test` | Run the backend tests (unit, security rules, `identifyBird`) on the emulators |
| `npm run emulators` | Start the Auth, Firestore, Storage and Functions emulators |
| `npm run deploy:backend` | Deploy the functions, Firestore rules and indexes (TTL), and Storage rules |

Run `npm run typecheck` and `npm run lint` before every commit.

## Project structure

```
app/                   Expo Router routes (screens stay thin)
  _layout.tsx          fonts, splash screen, auth guard, root stack
  (auth)/sign-in.tsx   sign in, sign up, password reset
  (tabs)/index.tsx     Home: greeting, Identify card, stats, recent finds
  (tabs)/journal.tsx   Finds: 2-column grid with search
  identify.tsx         camera modal: preview, shutter, gallery, flip, Photo / Sound (Soon)
  result.tsx           photo + result sheet, loading, and every error state
  specimen/[id].tsx    find detail: parallax photo, traits, safety banner, notes
  delete-account.tsx   permanent account deletion (App Store requirement)
components/
  ui/                  design-system primitives (Button, Card, TextField, SegmentedControl, …)
  auth/                sign-in screen sections
  identify/            shutter, viewfinder, permission card, capture flash, scan overlay
  result/              result sheet content, loading card, status messages
  specimen/            find card and row, photo, kind badge, trait grid, safety banner, notes editor
  home/                scan hero, field tip card, daily tips
  navigation/          custom tab bar with the raised camera button
  brand/               logo, in-app splash
  account/             account menu (sign out, delete account)
hooks/                 useAuth, useUser, useIdentify, useJournal, useSaveSighting, useErrorShake
lib/                   Firebase setup, auth, session + journal stores, photo prep, identify, sightings
theme.ts               the only source of colors, fonts, spacing, shadows and motion
functions/             Cloud Functions (identifyBird, cleanupUser), with its own package.json and tests
firestore.rules        Firestore security rules (owner-only; the rate-limit counter is server-only)
storage.rules          Storage security rules (owner-only images under 5 MB)
docs/                  brief, phase plan, decisions
```

## Backend

`identifyBird` is a Firestore trigger. The app uploads a photo to `users/{uid}/uploads/{id}.jpg`,
then creates `users/{uid}/identifications/{id}` with `{ imagePath, status: 'pending', createdAt }`.
The trigger claims the request and counts it against the 50-per-day limit, sends the photo to
OpenAI with a strict JSON schema, and deletes the temp photo. It writes `status: 'done'` with a
`result`, or `status: 'error'` with an `error`, back to the request, which the app is listening to.
It's a trigger rather than a callable function because the `raytechlab.co` organization blocks
public access to Cloud Run (see [docs/DECISIONS.md](docs/DECISIONS.md), D15). Requests delete
themselves after 24 hours through a Firestore TTL policy.

### First-time deploy

```sh
firebase login --reauth                           # if your CLI session has expired
firebase functions:secrets:set OPENAI_API_KEY     # paste the key when prompted
npm run deploy:backend
```

- Paste the key at the prompt; never put it on the command line, where it stays in your shell
  history.
- The first deploy enables the Google Cloud APIs 2nd-gen functions need and can take a few minutes.
  If it asks about a cleanup policy for container images, accept the default.
- If deploy fails with "User code failed to load … Timeout after 10000", the code is fine; the
  CLI just started slowly. Retry with a longer limit:
  `FUNCTIONS_DISCOVERY_TIMEOUT=60 npm run deploy:backend`.
- Firebase Storage must be set up in the console (Build → Storage → Get started) before the
  storage rules can deploy.

### Configuration

| Setting | Where | Notes |
| ------- | ----- | ----- |
| `OPENAI_API_KEY` | Secret Manager | `firebase functions:secrets:set OPENAI_API_KEY` |
| `OPENAI_MODEL` | `functions/.env` | Committed; change the model here and redeploy |
| Region | `functions/src/config.ts` | `us-central1`, the region paired with Firestore's `nam5` location |

To run the function locally with a real key, put `OPENAI_API_KEY=...` in
`functions/.secret.local`. That file is git-ignored; never commit it.

## Releasing

```sh
npx eas-cli init                                            # first time: link the EAS project
npx eas-cli env:create                                      # add each EXPO_PUBLIC_FIREBASE_* value (production)
npx eas-cli build --platform all --profile production
npx eas-cli submit --platform all
```

The store listing, privacy answers and review notes are in [docs/STORE.md](docs/STORE.md).

## Conventions

- **Design tokens:** every color, size, radius, shadow and animation value comes from
  [theme.ts](theme.ts). Never hard-code them in a component.
- **Firebase access** goes through `lib/`. Screens and components don't call the SDK directly.
- **Types:** strict TypeScript, no `any`.
- **Motion:** animations run 200–300 ms with ease-out, using the presets in `theme.ts`. They all
  respect Reduce Motion.
- **Dependencies:** install app packages with `npx expo install` so versions match the SDK.

## Documentation

- [docs/BRIEF.md](docs/BRIEF.md): product requirements, data model and design spec
- [docs/PHASES.md](docs/PHASES.md): phase plan, checklists and current status
- [docs/DECISIONS.md](docs/DECISIONS.md): decisions and deviations from the brief
- [docs/STORE.md](docs/STORE.md): store listing, privacy answers, screenshots and review notes
- [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md): guidelines for AI coding agents working in
  this repo

## Security

- The Firestore rules restrict each user to their own data, allow-list every collection, and only
  let the function write identification results and the daily usage counter.
- The OpenAI API key is stored only as a Cloud Functions secret
  (`firebase functions:secrets:set OPENAI_API_KEY`). Never commit it or put it in the app.
#   R o c k a n d M u s h r o o m  
 