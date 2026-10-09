import { getNetworkStateAsync } from 'expo-network';

export const OFFLINE_MESSAGE = "You're offline. Check your connection and try again.";

/** True only when the device is definitely offline (unknown reachability counts as online). */
export async function isOffline(): Promise<boolean> {
  const state = await getNetworkStateAsync();
  // iOS reports reachability as connectivity, so `false` (not null/undefined) is the only signal.
  return state.isConnected === false || state.isInternetReachable === false;
}
