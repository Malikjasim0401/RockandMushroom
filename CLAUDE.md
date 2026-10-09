# CLAUDE.md — Birdify

Birdify v1: Expo (React Native) + TypeScript app with a Firebase backend (Auth, Firestore, Storage,
Cloud Functions 2nd gen / Node 22) and OpenAI vision for bird identification.

## Read first

- [docs/BRIEF.md](docs/BRIEF.md): the requirements. Treat it as fixed.
- [docs/PHASES.md](docs/PHASES.md): the phase plan, deliverables, checklists and current status.
- [docs/DECISIONS.md](docs/DECISIONS.md): changes from the brief and their approval status.

## Phase gate (mandatory)

1. Check the status table in `docs/PHASES.md`. Work only on a phase whose status is `Approved` or
   `In progress`. Never write code for a later phase.
2. Implement only the decisions marked `Approved` in `docs/DECISIONS.md`. For anything still
   `Proposed`, follow the brief as written or ask the owner.
3. When you start a phase, set its status to `In progress`. When you finish, tick its checkboxes,
   set it to `Awaiting review`, and report what changed and how to verify it on a device. Then stop.
4. Only the owner sets `Approved` or `Done`. Only the owner changes a decision's status.
5. If something new changes the brief, add it to `DECISIONS.md` as `Proposed` and ask. Don't
   decide it silently.

## Engineering rules

- **TypeScript:** `strict`, and no `any`. Use `unknown` and narrow it. Validate data from
  Firestore and the callable at the boundary.
- **Structure:** route files in `app/` stay thin. All Firebase access goes through `lib/`.
  Reusable UI lives in `components/ui` and `components/bird`, and hooks live in `hooks/`.
- **Theme:** `theme.ts` is the only source of colors, fonts, sizes, radii, shadows and motion
  values. Never hard-code a hex value or pixel size in a component.
- **Performance:** memoize list rows and their callbacks, use no inline style objects in lists,
  and clean up every subscription. Unmount the camera when the screen loses focus. Use
  `expo-image` for every remote image.
- **Motion:** use `react-native-reanimated` only, with durations of 200–300 ms and ease-out.
  Always respect Reduce Motion.
- **Security:** the OpenAI key lives only in the Functions secret `OPENAI_API_KEY`. Never put it in
  the app, `.env`, the repo or logs. Every user path is scoped to `users/{uid}`.
- **Errors:** every async flow handles offline, timeout and function errors with user-facing
  states (see the error table in the brief).
- **Dependencies:** install app packages with `npx expo install` so they match the SDK. Add no
  libraries beyond the brief without a `DECISIONS.md` entry.
- **Style:** code stays small and DRY, and comments explain why, not what.

## SDK 57 notes (verified against the installed packages)

[AGENTS.md](AGENTS.md) applies too. Expo APIs change every SDK release, so check the versioned docs
before using one from memory.

- Tabs: `import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs'`. Importing `Tabs`
  from `expo-router` is deprecated. `Stack` still comes from `expo-router`.
- Reanimated 4: use `sv.get()` and `sv.set()`, not `.value`. The React Compiler lint rules reject
  `.value` writes.
- Google fonts: import each weight by subpath
  (`@expo-google-fonts/fraunces/600SemiBold`). Importing the package root bundles every weight.
- `getReactNativePersistence`: typed through `types/firebase-auth.d.ts`. `firebase/auth`'s
  typings point at the web build.
- Shadows: use the `boxShadow` style prop (new architecture, same on both platforms) with values
  from `theme.shadows`.
- Tab screens pad their bottom with `useTabBarInset()`, because the tab bar floats over the scene.
- Auth state: read it with `useAuth()` / `useUser()` from `hooks/useAuth.ts`, backed by the
  external store in `lib/session.ts`. Call `session.refresh()` after `updateProfile`, which fires
  no auth event. Route protection is `Stack.Protected` in `app/_layout.tsx`.
- Journal data: read it with `useJournal()` / `useSighting(id)` (`hooks/useJournal.ts`), backed by
  the app-wide listeners in `lib/journal.ts`. Don't add per-screen Firestore listeners for
  sightings. Save through `saveSighting` in `lib/sightings.ts`, which runs one transaction.
- Layout and entrance animations: use `enter(i)` and `transitions.*` from `theme.ts`. They already
  respect Reduce Motion.
- EAS cloud builds don't see the git-ignored `.env`. Define the `EXPO_PUBLIC_*` values as EAS
  environment variables (`eas env:create`) for each profile's `environment`.

## Commands

- App: `npm start` (dev client), `npm run android` / `npm run ios` (local native build),
  `npm run typecheck`, `npm run lint`, `npm run format`, `npm run doctor`
- Functions: `npm run functions:build`, `npm run functions:test` (unit, rules and handler tests on
  the emulators; needs Java 21), `npm run emulators`
- Deploy backend: `npm run deploy:backend`
  (`firebase deploy --only functions,firestore:rules,firestore:indexes,storage`)
- Functions runtime is Node 22 (D13). Import v2 APIs from `firebase-functions/firestore`,
  `/https`, `/params`, `/options` and `/logger`.
- `identifyBird` is a **Firestore trigger**, not a callable (D15). The org's Domain Restricted
  Sharing policy blocks public Cloud Run invokers, so don't add HTTP or callable functions without
  an org-policy exception. `processIdentification` in `functions/src/identify/handler.ts` takes the
  identifier as a parameter so tests can inject a fake.
- Builds: `eas build --profile development`, `eas build --platform all --profile production`, `eas submit`

## Environment

- Windows 11 dev machine, Node 22 locally. Functions target Node 22 through `engines` (D13).
- iOS builds run on EAS cloud builders.
- Installed tools: git, eas-cli 24, firebase-tools 15.
