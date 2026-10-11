# Decisions & Deviations from the Brief

Every deviation from [BRIEF.md](BRIEF.md) is logged here. Status is one of
**Proposed** (awaiting owner approval — do not implement), **Approved**, or **Rejected**.
Only the project owner changes a status.

| ID  | Topic | Status |
| --- | ----- | ------ |
| D1  | Lock `users/{uid}/meta/**` against client writes | Approved (2026-09-24), implemented in Phase 3 |
| D2  | Species marker docs for race-free `speciesCount` | Proposed — implemented in Phase 5 |
| D3  | Drop Android `READ_MEDIA_IMAGES` | Proposed |
| D4  | Design canvas reference | Open — needs screenshots |
| D5  | Journal search = client-side filter on one live listener | Proposed — implemented in Phase 5 |
| D6  | Strict schema: all fields required, empty values when `isBird=false` | Proposed — implemented in Phase 3 (required by the API) |
| D7  | Uploads always set `contentType: 'image/jpeg'` | Proposed |
| D8  | iOS builds via EAS cloud (dev machine is Windows) | Proposed |
| D9  | `minInstances` for `identifyBird` | Open — decide in Phase 7 |
| D10 | Shared `IdentifyResult` type duplicated in app + functions | Proposed — functions side done in Phase 3; app side in Phase 4 |
| D11 | Libraries added beyond the brief's list | Proposed — installed in Phase 1 |
| D12 | Auth details the brief leaves open | Proposed — implemented in Phase 2 |
| D13 | Functions on Node 22, not Node 20 | Proposed — implemented in Phase 3 |
| D14 | identifyBird implementation details | Proposed — implemented in Phase 3 |
| D15 | identifyBird is a Firestore trigger, not a callable function | Approved (2026-09-24), implemented in Phase 3 |
| D16 | Explicit IAM roles for the default compute service account | Approved (2026-09-24), applied in Phase 3 |
| D17 | Storage rules split by operation | Proposed — deployed in Phase 3 (fixes owner reads) |
| D18 | Parallel upload + request; the function waits for the photo | Proposed — implemented in Phase 3 |
| D19 | Store the photo's download URL on each sighting | Proposed — implemented in Phase 5 |
| D20 | Contrast of the brief's `inkFaint` token | Proposed — not implemented |
| D21 | In-app account deletion (App Store requirement) | Proposed — implemented in Phase 7 |
| D22 | Rebrand Birdify → RockAndMushroom (rocks, minerals, mushrooms) | Proposed — implemented in Phase 8 |
| D23 | Collection features, redesigned Home/Detail, psychoactive verdict | Proposed — owner asked for it in chat; implemented in Phase 8 |
| D24 | Separate `rockmushroom/` data, functions and rules inside the shared Birdify project | Proposed — owner asked for it in chat; deployed 2026-10-11 |

---

### D1 — Lock `meta/**` against client writes
**Problem:** The brief's Firestore rule (`users/{uid}/{doc=**}` read/write) lets a client rewrite
`users/{uid}/meta/usage` and reset the 50/day rate limit, bypassing OpenAI cost control.
**Proposal:** Add a more specific match so clients can read but never write `meta/**`. Only the
function (Admin SDK, bypasses rules) writes it.
```
match /users/{uid}/meta/{doc=**} {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow write: if false;
}
```
Note: Firestore rules are OR-combined, so the broad `users/{uid}/{doc=**}` rule must be narrowed
to exclude `meta` (e.g. explicit matches for `users/{uid}`, `sightings/{id}`, `species/{id}`).

### D2 — Species marker docs
**Problem:** "speciesCount = distinct scientificName … client transaction" — client transactions
cannot run queries, so distinctness cannot be checked atomically.
**Proposal:** Add `users/{uid}/species/{slug(scientificName)}` `{ scientificName, firstSeenAt }`.
Save transaction: `get` marker → if missing, `set` marker and `increment(1)` on `speciesCount`;
always `set` the sighting doc. Race-free, one extra read per save.

### D3 — Drop `READ_MEDIA_IMAGES`
**Problem:** Google Play restricts `READ_MEDIA_IMAGES` to apps needing broad photo access;
`expo-image-picker` uses the system Photo Picker on Android 13+ with no permission.
**Proposal:** Do not request it; add it to `android.blockedPermissions`. Keep `CAMERA`.

### D4 — Design canvas
The canvas link in the PDF is not accessible to Claude. If screenshots are provided, place them in
`docs/design/` (one PNG per screen, named by route). Otherwise build from the token spec.

### D5 — Journal search
Firestore has no substring search. Use one shared `onSnapshot` listener on
`sightings` ordered by `seenAt desc`, filtered client-side (memoized, debounced input). The same
listener powers live Home/Journal updates (M3 "without restart").

### D6 — Strict Structured Outputs
OpenAI strict mode requires every property to be `required` and `additionalProperties: false` at
every level. When `isBird=false`, strings are `""`, `confidence` is `0`, `alternatives` is `[]`.
The function validates the parsed object before returning.

### D7 — Upload content type
Storage rules check `contentType.matches('image/.*')`; every client upload passes
`{ contentType: 'image/jpeg' }` explicitly.

### D8 — iOS builds
No local Xcode on Windows. iOS development and production builds run on EAS cloud builders.

### D9 — Cold start vs. 6 s target
Default `minInstances: 0`. `minInstances: 1` costs roughly $5–10/month and is the owner's call.

**Measured (end to end from the app's side in Pakistan, upload + trigger + OpenAI + result):**

| Run | Cold (first call after idle or deploy) | Warm |
| --- | -------------------------------------- | ---- |
| Phase 3 (2026-09-24) | 6.8 s | 5.1–5.5 s |
| Phase 7 (2026-09-25) | 7.7 s | 5.9–6.2 s |

About 1.3–1.5 s of each run is the upload from Pakistan to the US; users closer to
`us-central1` will see less. A warm instance removes the extra ~1.5–2 s on the first scan after
a quiet spell. It doesn't change warm times, which depend on the network and OpenAI.
**To enable:** add `minInstances: 1` to the `onDocumentCreated` options in
`functions/src/identifyBird.ts` and redeploy.

### D10 — Shared types
The `functions/` package deploys standalone, so `IdentifyResult` is defined in both
`lib/types.ts` (app) and `functions/src/identify/schema.ts`. Each file carries a comment pointing
to the other; keep them in sync.

### D11 — Libraries beyond the brief's list
Installed in Phase 1 because the brief's features need them. Each can be removed if rejected.

| Package | Why |
| ------- | --- |
| `@expo/vector-icons` (Ionicons only, via `@expo/vector-icons/Ionicons`) | Tab bar and control icons. The brief lists no icon set. `expo-symbols` on Android pulls in a 967 KB Material Symbols font that loads async, so icons flash. It's wrapped in `components/ui/Icon.tsx`, so swapping it touches one file. |
| `expo-dev-client` | Required for the brief's `eas build --profile development`. |
| `expo-font`, `expo-splash-screen`, `expo-status-bar`, `expo-system-ui` | Font loading, holding the splash until fonts load, status bar style, and the root background color (no white flash). |
| `react-native-worklets` | Required peer of Reanimated 4. |
| `expo-network` (Phase 4) | Offline check before uploading, for the brief's network error state. Without it, an offline upload would retry silently. |
| `expo-linking`, `expo-constants`, `react-native-screens`, `react-native-safe-area-context` | Required by Expo Router. |
| `react-dom` | Pinned to match `react` (19.2.3). Without it, npm pulls in an incompatible `react-dom` as a peer of expo-router. Not used on native. |
| Dev: `eslint`, `eslint-config-expo`, `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier` | Lint and format. |

### D12 — Auth details the brief leaves open
Implemented in Phase 2. Each is easy to change.

- **Password rule:** at least 8 characters on sign-up. Firebase's own minimum is 6. Sign-in doesn't
  check length, so older accounts still work.
- **Name on sign-up:** required, 1–40 characters. It's stored as the Auth `displayName` and in
  `users/{uid}.displayName`.
- **Profile doc self-heals:** `users/{uid}` is created after sign-up and checked again after every
  sign-in. If the first write fails (offline, or rules not deployed yet), the next sign-in creates
  it. Sign-in never fails because of it.
- **Password reset doesn't reveal accounts:** the reset screen shows the same "check your inbox"
  message whether or not the email has an account.
- **No flash on launch:** the splash screen stays up until both the fonts and the restored session
  are ready.
- **Console setup (done, verified 2026-09-23):** Authentication is set up with Email/Password
  enabled, and the Firestore `(default)` database exists. The Phase 3 rules were deployed on
  2026-09-24, so the database is no longer in test mode.

### D13 — Functions on Node 22, not Node 20
The brief says Node 20. Google deprecated the `nodejs20` runtime on 2026-04-30 and decommissions
it on **2026-10-30**. After that, Node 20 functions can't be deployed or updated. The current
`firebase-admin` (14) and `openai` (7) also require Node 22 or newer.

- `functions/package.json` sets `"engines": { "node": "22" }`. That runtime is supported until
  2027-04-30, and matches local development (Node 22.16).
- The Firebase emulators in firebase-tools 15 need **Java 21+**. This machine has Java 17, so
  install JDK 21 to run `npm run functions:test` or `npm run emulators`, for example with
  `winget install EclipseAdoptium.Temurin.21.JDK`.

### D14 — identifyBird implementation details
- **Default model:** `gpt-6-sol`, set in `functions/.env`. On 2026-09-24 the production key was
  confirmed to have access to `gpt-6-astra`, `gpt-6-sol` and `gpt-6-luna`. Reasoning effort is
  `low`, and image detail is `high`.
- **Path check** is stricter than a prefix match. The file name must match
  `^[A-Za-z0-9_-]{1,64}\.jpg$` directly under `users/{uid}/uploads/`, which blocks `..` and
  nested paths.
- **Every call counts toward the 50/day limit,** including failed ones, so failures can't be used
  to get around it. The counter resets on a new UTC day.
- **The image must be a JPEG** (checked by its first bytes) and under 5 MB, the same limit as the
  storage rule. Otherwise the call is rejected and the upload is deleted.
- **Timeouts:** 12 s per OpenAI attempt with one retry, so the worst case (about 24 s) stays inside
  the 30 s function timeout. The function runs with 1 CPU, 512 MiB, up to 20 requests per instance,
  and at most 10 instances as a cost guard.
- **Refusals:** if the model refuses to describe the image, the result is "no bird found".
- **Errors:** OpenAI key, model or schema problems are logged and return a generic `internal`
  error. OpenAI rate limits and 5xx errors return `unavailable`.

### D15 — identifyBird is a Firestore trigger, not a callable function
**Problem:** The brief specifies an HTTPS callable (`onCall`) function. Callable functions must be
publicly invokable (`allUsers` → `roles/run.invoker`). The project belongs to the `raytechlab.co`
Google Cloud organization, which enforces **Domain restricted sharing**
(`constraints/iam.allowedPolicyMemberDomains`), so Google refuses that binding. The deploy reports
success, but every call gets a 403 before reaching the function. The owner has no org-policy
rights, and chose not to ask the org admin for an exception.

**Decision (approved by the owner 2026-09-24):** `identifyBird` becomes an `onDocumentCreated`
trigger. Eventarc invokes it with the project's own service account, so no public access is
needed.

**Flow:**
1. The app uploads the photo to `users/{uid}/uploads/{id}.jpg`, as before.
2. The app creates `users/{uid}/identifications/{id}` with exactly
   `{ imagePath, status: 'pending', createdAt: serverTimestamp() }`. `{id}` is the upload's id.
3. The trigger claims the request and counts it against the daily limit in **one transaction**. A
   duplicate event delivery finds the request already claimed and does nothing, so nobody is
   charged twice. It then downloads, identifies and deletes the upload, like the callable did.
4. The trigger writes `status: 'done'` plus `result`, or `status: 'error'` plus
   `error: { code, message }`. The codes are the same as the callable's, for example
   `resource-exhausted`.
5. The app listens to the document with `onSnapshot` and shows the result. It gives up after a
   client-side timeout.

**Security:** Firestore rules allow `create` only by the owner. The keys must be exactly
`imagePath`, `status` and `createdAt`. `status` must be `'pending'`, `imagePath` must be the
owner's upload with the same id, and `createdAt` must be `request.time`. Clients can read and
delete their requests but never update them, so only the function writes a status or result.
Unknown collections are now denied (explicit allow-list).

**Cleanup:** the function sets `expireAt` (24 h). A Firestore TTL policy on
`identifications.expireAt` deletes old requests automatically (`firestore.indexes.json`).

**Trade-off:** event delivery adds roughly 0.5–1.5 s compared to a direct call. Latency is
measured after deploy.

### D16 — Explicit IAM roles for the default compute service account
**Problem:** New projects normally give the default compute service account
(`453943068927-compute@developer.gserviceaccount.com`) the Editor role. The `raytechlab.co`
organization disables that automatic grant, so the account started with no roles at all.
2nd-gen functions both build and run as this account, which caused two separate failures:

1. **Build:** Cloud Build couldn't fetch the function source (`gcs-fetcher` exit 3).
2. **Runtime:** the Admin SDK got `PERMISSION_DENIED` on every Firestore read and write.

**Applied (owner approved each grant, 2026-09-24).** These are project-level bindings, and none
of them is an admin role:

| Role | Why |
| ---- | --- |
| `roles/cloudbuild.builds.builder` | Build and deploy functions |
| `roles/datastore.user` | Claim requests, charge the quota, write results (Firestore documents only) |
| `roles/storage.objectAdmin` | Download and delete the temp upload (objects only, not bucket settings) |

The Firebase CLI added these itself during deploy: `roles/secretmanager.secretAccessor` (on the
`OPENAI_API_KEY` secret only), `roles/eventarc.eventReceiver` and `roles/run.invoker`. That last
one lets Eventarc invoke the trigger; the org policy allows it because the account belongs to
this project.

**If the project is recreated in this org,** grant the three roles above before the first
deploy. A cleaner long-term setup is a dedicated `identify-bird@` service account set through the
function's `serviceAccount` option. That's worth doing when an org admin is available.

### D17 — Storage rules split by operation
**Problem:** The brief's Storage rule grants `read, write` under one condition,
`request.resource == null || (size < 5 MB && contentType image/*)`. The emulator allows owner
reads with it. Production **denies** them: `getBytes`, `getDownloadURL` and `getMetadata` all
return `storage/unauthorized`, while uploads and deletes succeed. Journal photos couldn't be
displayed.

**Fix (deployed 2026-09-24):** same intent, split by operation. `read` and `delete` are allowed
for the owner. `create` and `update` are allowed for the owner when the file is under 5 MB and
has an `image/*` content type. After deploying, a live probe confirmed that owners can read
their own photos, and that a deleted file reports `object-not-found`.

### D18 — Parallel upload + request
The app uploads the photo and creates the identification request **at the same time**, rather
than one after the other. The trigger downloads the photo in parallel with its claim transaction,
and waits up to 10 s for the photo to appear. A Storage object only becomes visible once it's fully
written, so the function can't read a partial file. This overlaps the two slowest network steps.
Measured warm totals from Pakistan to `us-central1`: before, 5.0–6.7 s; after, **5.1–5.5 s**.
Reasoning effort also moved from `low` to `none` (configurable as `OPENAI_REASONING_EFFORT`), with
99% accuracy unchanged in benchmarks.

### D19 — Store the photo's download URL on each sighting
The brief's sighting fields include `photoPath` but no URL. Displaying a Storage photo needs a
download URL, which costs one network round trip per photo. That means a round trip for every card
in the journal grid, every time it loads. The save flow resolves the URL once, right after
uploading, and stores it as `photoUrl` alongside `photoPath`. The grid then renders straight
from the listener, and `expo-image` caches the images in memory and on disk.
`components/bird/BirdPhoto.tsx` still falls back to resolving `photoPath` if a sighting has no
URL. The URL carries an access token; it's stored only in the owner's own
`users/{uid}/sightings`, which no other user can read.

### D20 — Contrast of the brief's `inkFaint` token
The brief sets `inkFaint` (#8A9C92) for dates, placeholders and inactive tabs. On white it has a
**2.9:1** contrast ratio. WCAG AA asks for 4.5:1 for small text, such as the 12 pt date captions,
and 3:1 for large text and icons.
**Proposal (not implemented; it changes a brief token):** darken `inkFaint` to #677A70 (4.6:1 on
white, the lightest shade in this hue that passes AA) so it keeps its role as the lightest text,
or use `inkMuted` (#5A6F64, 5.4:1) for captions that carry information, such as dates. Placeholders and inactive tab
icons can stay as they are.

### D21 — In-app account deletion
**Why:** App Store Review Guideline 5.1.1(v) requires any app that supports account creation to
let users delete their account from inside the app. Google Play has the same requirement and also
asks for a web link. The brief doesn't include deletion, so without it the iOS submission would be
rejected.

**How it works:**
1. Home → avatar → **Delete account** opens `app/delete-account.tsx`, a modal that lists exactly
   what will be deleted and asks for the password.
2. `lib/account.ts` re-authenticates (Firebase requires a recent sign-in to delete a user, and it
   confirms intent), then deletes the Auth user. The session ends, and the auth guard returns to
   sign-in.
3. The `cleanupUser` function (`functions/src/cleanupUser.ts`, an Auth `onDelete` trigger, which
   only exists in the v1 API) deletes `users/{uid}` recursively (profile, sightings, species
   markers, usage counter, requests) and every Storage object under `users/{uid}/`. It also runs
   when a user is deleted from the Firebase console, and it's idempotent.

**IAM:** v1 functions run as the App Engine service account by default, which has no roles in
this org (D16). `cleanupUser` runs as `RUNTIME_SERVICE_ACCOUNT` (`functions/.env`), the compute
account that already has `datastore.user` and `storage.objectAdmin`.

**Tests:** `functions/test/cleanup.test.ts` checks that everything the user owns is deleted,
that another user's data is untouched, and that a repeat run succeeds.

### D22 — Rebrand Birdify → RockAndMushroom
**Problem:** The brief describes a bird-identification app. The owner wants the same codebase
rebuilt as **RockAndMushroom**, identifying rocks, minerals and mushrooms/fungi ("specimens"),
temporarily on the existing Firebase project.

**Proposal (touches brief areas: name, theme tokens, domain model, AI schema/prompt):**
1. **Identity:** name `RockAndMushroom`, slug/scheme `rock-and-mushroom`, bundle id/package
   `co.raytechlab.rockandmushroom`. Firebase config is unchanged (the JS SDK doesn't use the
   bundle id), so Auth, Firestore, Storage and the deployed functions keep working. No
   `google-services` files exist, so no native linkage breaks. EAS project must be re-linked.
2. **Theme:** earthy palette in `theme.ts` only (deep slate, terracotta, forest green, warm
   amber, stone neutrals), light and dark; contrast checked (supersedes D20 for the new tokens).
3. **Motion:** Reanimated only, 200–300 ms ease-out, Reduce Motion respected (existing rules).
4. **Terminology:** Bird → Specimen, Sighting → Find, Species → Specimen type; add `kind`
   (`rock` | `mineral` | `mushroom`). UI copy, tabs, empty states and onboarding updated.
5. **Data model (user-visible rename only where safe):** Firestore paths stay `sightings` /
   `species` / `identifications` and the `identifyBird` function name stays, so the deployed
   backend, rules and existing data keep working. Renaming them is a separate migration.
6. **AI:** new strict JSON schema + prompt: `kind`, common/scientific name, classification,
   `confidence`, alternatives, and kind-specific traits (rock type, Mohs hardness, luster,
   streak, composition; cap/stem/gills/spore print, habitat, season, **edibility + safety
   warning**). `isSpecimen=false` replaces `isBird=false`. A mandatory "never eat based on this
   app" warning is shown on every mushroom result.
7. **Backend deploy:** schema/prompt changes need `npm run deploy:backend` (owner-run).

**Trade-off:** extra schema fields raise tokens per call slightly. Mushroom edibility is a
safety-critical claim: the model output is advisory only and the UI says so.

### D23 — Collection features, redesigned Home and Detail
**Requested by the owner in chat (2026-10-02):** finish the one-pager and give the app a new look.
All of it is client-side except one schema value; nothing is deployed by this change.

1. **Finds filter:** All · Rocks · Minerals · Mushrooms, combined with the existing search.
2. **Home:** dark slate scan card, per-kind counters (derived from the live finds, no new data),
   horizontal carousel of recent finds, and a daily field tip (static, rotates by date).
3. **Detail:** Overview · Traits · Habitat tabs; a Mohs hardness scale for rocks and minerals.
4. **Scan loading:** rotating, kind-specific status lines while identifying.
5. **Schema:** `edibility` gains `psychoactive`. The function must be redeployed (owner) before the
   model can return it; the app already reads it, and unknown values fall back to `unknown`.
6. **Not included, needs approval:** GPS tag and origin map. They need `expo-location`, a map
   library, new permission strings, and privacy-policy and store-form changes.

### D24 — Separate RockAndMushroom data inside the shared Birdify project
**Requested by the owner in chat (2026-10-10):** both apps use one Firebase project (Auth, default
Firestore database, Storage bucket, `OPENAI_API_KEY`), but Birdify must not change. Supersedes
D22 item 5 (paths and the `identifyBird` name stay).

1. **Data:** everything this app owns moves from `users/{uid}/…` to `rockmushroom/{uid}/…` in
   Firestore (profile, `sightings`, `species`, `identifications`, `meta/usage`) and Storage.
   Finds saved earlier under `users/{uid}/sightings` are no longer read (no migration).
2. **Functions:** `identifyRockMushroom` (trigger on `rockmushroom/{uid}/identifications/{requestId}`)
   and `cleanupRockMushroomUser`, in their own codebase `rockandmushroom`, so deploying them cannot
   delete Birdify's `default` codebase. The old `identifyBird` stays live and unused by this app.
3. **Rules:** a project has one ruleset per service, so `firestore.rules` and `storage.rules`
   contain Birdify's `users/` blocks copied verbatim plus the `rockmushroom/` blocks. Deploy only
   from this repo (`npm run deploy:rules`); a rules deploy from the Birdify repo would remove the
   `rockmushroom/` blocks and every scan would fail with permission-denied.
4. **Known limits:** the Auth user pool is shared, so deleting an account in either app also fires
   Birdify's `cleanupUser`, which erases that person's Birdify data. Hard isolation needs a named
   Firestore database and a second Storage bucket, or a separate Firebase project (not done).
