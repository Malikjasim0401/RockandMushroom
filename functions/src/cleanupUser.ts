import * as functionsV1 from 'firebase-functions/v1';

import { REGION, runtimeServiceAccount } from './config';
import { deleteUserData } from './account/cleanup';

/**
 * Runs when an Auth user is deleted (in-app "Delete account", or from the console) and removes
 * all of their data (DECISIONS.md D21). Auth deletion triggers only exist in the v1 API.
 *
 * The runtime account is set explicitly: v1 defaults to the App Engine service account, which
 * has no roles in this org (D16). RUNTIME_SERVICE_ACCOUNT names the one that does.
 */
export const cleanupUser = functionsV1
  .runWith({
    serviceAccount: runtimeServiceAccount,
    timeoutSeconds: 120,
    memory: '256MB',
  })
  .region(REGION)
  .auth.user()
  .onDelete((user) => deleteUserData(user.uid));
