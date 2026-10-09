// Expo only inlines EXPO_PUBLIC_* vars accessed as literal `process.env.X`, so each is listed.
const raw = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

type FirebaseConfig = { [K in keyof typeof raw]: string };

function requireAll(values: typeof raw): FirebaseConfig {
  const missing = Object.entries(values)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase config: ${missing.join(', ')}. Copy .env.example to .env and fill it in.`,
    );
  }
  return values as FirebaseConfig;
}

export const env = {
  firebase: requireAll(raw),
  useEmulators: process.env.EXPO_PUBLIC_USE_EMULATORS === 'true',
  emulatorHost: process.env.EXPO_PUBLIC_EMULATOR_HOST || '127.0.0.1',
} as const;
