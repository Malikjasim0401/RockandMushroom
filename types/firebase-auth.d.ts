import { type Persistence, type ReactNativeAsyncStorage } from 'firebase/auth';

// firebase/auth's typings resolve to the web build, which omits the React Native export.
// Metro resolves the RN build at runtime, where this function exists.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
