# RockAndMushroom — Store Submission Notes

Copy these into App Store Connect and the Google Play Console. Replace anything in
`[brackets]` before submitting.

## Listing

| Field | Value |
| ----- | ----- |
| App name | RockAndMushroom |
| Subtitle (iOS, ≤ 30 chars) | Identify rocks and mushrooms |
| Short description (Play, ≤ 80 chars) | Snap a rock, mineral or mushroom, learn what it is, and keep every find. |
| Promotional text (iOS, ≤ 170 chars) | Point your camera at a rock, mineral or mushroom and RockAndMushroom tells you what it is, with traits and a friendly summary, then saves it to your collection. |
| Keywords (iOS, ≤ 100 chars) | rock,mineral,mushroom,fungi,gem,geology,foraging,identify,nature,crystal |
| Category | iOS: Education (secondary: Reference) · Play: Education |
| Age rating | 4+ (iOS) · Everyone (Play). No objectionable content. |
| Support URL | [your support page] |
| Marketing URL (optional) | [your website] |
| Privacy policy URL | [where you host the policy below] |
| Copyright | © 2026 RayTech Labs |

### Description

> Snap a photo of a rock, mineral or mushroom and RockAndMushroom tells you what it is in seconds.
>
> **Identify** — Take a photo or pick one from your library. RockAndMushroom names it, gives the
> scientific name and family, and shows how confident it is. When it's not sure, it shows its best
> guess and the likely alternatives.
>
> **Learn** — See Mohs hardness, luster, streak and composition for rocks and minerals, or cap,
> stem, gills and habitat for mushrooms, plus a short, friendly summary.
>
> **Stay safe** — Every mushroom result carries a safety warning. Never eat a wild mushroom based on
> this app; always have a local expert confirm it.
>
> **Keep your finds** — Save every find with its photo. Search by name or kind, add your own
> notes, and watch your collection grow.
>
> Private by design: your finds belong to your account only, and you can delete your account
> and all of its data at any time from inside the app.
>
> Sound identification is coming soon.

## App Review notes (Apple)

- **Demo account:** create one before submitting and save a few finds in it, so the reviewer
  sees a filled collection.
  - Email: `[demo email]`
  - Password: `[demo password]`
- **How to test:** sign in, tap the camera button in the tab bar, and photograph a rock, mineral or mushroom (or pick
  one from the library). The result appears in about 5 seconds. Tap **Add to finds** to
  save it.
- **Camera and photos:** used only to photograph or pick a specimen for identification.
- **AI identification:** the photo is sent to our server, which asks OpenAI's vision model to
  identify the specimen. The photo is deleted from the server as soon as the result is returned.
  Each account can make 50 identifications per day.
- **Account deletion (Guideline 5.1.1(v)):** Home → the avatar in the top right →
  **Delete account**. After a password confirmation, it permanently deletes the account and all of
  its data.
- **Mushroom safety:** every mushroom result shows an edibility verdict, the main look-alike
  danger, and the fixed notice "Never eat a wild mushroom based on this app." The app never
  presents edibility as confirmed.
- **Sound tab:** shown as "Soon" and disabled on purpose; it's a planned feature.

## Export compliance (iOS)

The app only uses standard HTTPS. `ITSAppUsesNonExemptEncryption` is `false` in `app.config.ts`,
so App Store Connect won't ask about encryption on each build.

## App Privacy (Apple "nutrition label")

**Tracking:** No. There are no ads, no analytics SDKs and no cross-app tracking.

| Data type | Collected | Linked to the user | Used for tracking | Purpose |
| --------- | --------- | ------------------ | ----------------- | ------- |
| Contact info → Email address | Yes | Yes | No | App functionality (sign-in, password reset) |
| Identifiers → User ID | Yes | Yes | No | App functionality |
| User content → Photos | Yes | Yes | No | App functionality (identification, finds) |
| User content → Other (notes, finds) | Yes | Yes | No | App functionality |

Not collected: location, contacts, browsing history, purchases, diagnostics, usage data.

## Data safety (Google Play)

| Question | Answer |
| -------- | ------ |
| Does the app collect or share user data? | Collects: yes. Shares: no. OpenAI processes photos on our behalf as a service provider, which Play doesn't count as sharing. |
| Data collected | Personal info → Email address · Photos and videos → Photos · App activity → Other user-generated content (finds, notes) · App info → none · Device IDs → none |
| Required or optional | Email: required (account). Photos: required to identify a specimen. Notes: optional. |
| Purpose | App functionality, Account management |
| Encrypted in transit | Yes (HTTPS/TLS for all traffic) |
| Users can request deletion | Yes. In the app (Home → avatar → Delete account), plus the web page below. |
| Account deletion web URL (required) | [page explaining how to delete, e.g. yoursite.com/rock-and-mushroom/delete-account] |

## Privacy policy (draft)

Host this, for example on your website or a Notion page, and put its URL in both stores. Have it
reviewed before publishing; this draft describes how the app works today.

> **RockAndMushroom Privacy Policy** — Last updated [date]
>
> RockAndMushroom ("we") is made by RayTech Labs. This policy explains what we collect and why.
>
> **What we collect**
> - **Account:** your email address and display name, used to sign you in and reset your password.
> - **Photos:** photos you take or choose so we can identify the specimen. Photos you save stay in
>   your finds; photos used only for identification are deleted from our servers as soon as the
>   result is returned.
> - **Finds:** the finds you save, the identification details, and any notes you add.
> - **Usage limit:** a daily count of identifications, to enforce the fair-use limit.
>
> **How we use it** — Only to run RockAndMushroom: identify specimens, keep your finds, and keep your account
> secure. We don't sell your data, show ads, or track you across other apps or websites.
>
> **Who processes it**
> - **Google Firebase** (authentication, database, file storage, servers in the United States).
> - **OpenAI**, which receives the photo to identify the specimen and returns the result. Under
>   OpenAI's API terms, API data isn't used to train their models.
>
> **Your choices** — You can edit your notes at any time, and delete your account in the app
> (Home → avatar → Delete account). Deleting your account permanently removes your account,
> finds, notes and photos.
>
> **Children** — RockAndMushroom isn't directed at children under 13, and we don't knowingly collect
> their data.
>
> **Contact** — [support email]

## Screenshots

| Store | Size | Required |
| ----- | ---- | -------- |
| App Store | 6.9" iPhone: 1320 × 2868 (or 1290 × 2796) | Yes, 3–10 |
| App Store | 6.5" iPhone: 1284 × 2778 | Optional (scaled from 6.9" if missing) |
| Google Play | Phone, portrait, at least 1080 px wide (e.g. 1080 × 2400) | Yes, 2–8 |
| Google Play | Feature graphic: 1024 × 500 | Yes |

`supportsTablet` is `false`, so no iPad screenshots are needed.

**Shot list** (use the demo account with a few real finds; light mode):

1. **Result**: a clear mineral or mushroom with the result sheet up (name, 90%+ match, trait chips,
   safety banner). *"Know any rock or mushroom in seconds"*
2. **Camera**: the viewfinder framing a specimen, with the shutter and Photo / Sound switch visible.
   *"Just point and shoot"*
3. **Finds**: the grid with 6+ finds. *"Everything you've found, in one place"*
4. **Find detail**: photo, traits, summary and a note. *"Learn about each find"*
5. **Home**: greeting, specimen count, this week, recent finds. *"Watch your collection grow"*
6. **Best guess** (optional): a tricky specimen with alternatives. *"Honest when it's unsure"*

Tips: take them on the largest iPhone and on a 1080p Android phone. Hide the debug banner by using
a production or preview build. Keep the status bar clean: full battery, no notifications.
