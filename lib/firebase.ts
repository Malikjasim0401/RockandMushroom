import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  type Auth,
  connectAuthEmulator,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

import { env } from './env';

const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(env.firebase) : getApp();

// initializeAuth may run only once per app; Fast Refresh re-evaluates this module.
const auth: Auth = isFirstInit
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);

const db = getFirestore(app);
const storage = getStorage(app);
// The SDK's defaults retry for up to 10 minutes; fail fast so the UI can offer a retry.
storage.maxUploadRetryTime = 20_000;
storage.maxOperationRetryTime = 20_000;

if (env.useEmulators && isFirstInit) {
  const host = env.emulatorHost;
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  connectStorageEmulator(storage, host, 9199);
}

export { app, auth, db, storage };
