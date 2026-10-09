import { setGlobalOptions } from 'firebase-functions/options';
import { defineSecret, defineString } from 'firebase-functions/params';

export const REGION = 'us-central1';

// Must run before any function is defined; every function module imports this file first.
setGlobalOptions({ region: REGION, maxInstances: 10 });

/** Secret Manager: `firebase functions:secrets:set OPENAI_API_KEY`. */
export const openaiApiKey = defineSecret('OPENAI_API_KEY');

/** functions/.env, so the model can change without a code edit. */
export const openaiModel = defineString('OPENAI_MODEL', {
  description: 'Vision-capable OpenAI model used by identifyBird',
});

/** functions/.env. `none` is fastest; gpt-6-astra needs `low` or higher. */
export const openaiReasoningEffort = defineString('OPENAI_REASONING_EFFORT', {
  description: 'Reasoning effort for identifyBird: none | low | medium | high',
  default: 'none',
});

/** functions/.env: the service account with Firestore + Storage roles (DECISIONS.md D16). */
export const runtimeServiceAccount = defineString('RUNTIME_SERVICE_ACCOUNT', {
  description: 'Service account for functions that need Firestore and Storage access',
});
