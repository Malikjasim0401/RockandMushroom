import { onDocumentCreated } from 'firebase-functions/firestore';

import { openaiApiKey, openaiModel, openaiReasoningEffort } from './config';
import { processIdentification } from './identify/handler';
import { createOpenAIIdentifier, type IdentifyImage, toEffort } from './identify/openai';

// Secrets are only readable at run time, so the client is built on first use and reused.
// Lazy on purpose: nothing touches OpenAI (or the key) until the handler has passed its
// validation and quota checks.
let identifier: IdentifyImage | undefined;
const identify: IdentifyImage = (jpeg) =>
  (identifier ??= createOpenAIIdentifier(
    openaiApiKey.value(),
    openaiModel.value(),
    toEffort(openaiReasoningEffort.value()),
  ))(jpeg);

/**
 * A Firestore trigger rather than a callable: the org's Domain Restricted Sharing policy blocks
 * the public invoker a callable needs (docs/DECISIONS.md D15). Eventarc invokes this with the
 * project's own service account.
 */
export const identifyRockMushroom = onDocumentCreated(
  {
    document: 'rockmushroom/{uid}/identifications/{requestId}',
    secrets: [openaiApiKey],
    timeoutSeconds: 60,
    memory: '512MiB',
    cpu: 1,
    // Requests spend most of their time waiting on OpenAI, so one instance can serve many.
    concurrency: 20,
    // Every outcome is written to the request doc; a retry would only repeat a failure.
    retry: false,
  },
  (event) =>
    processIdentification(
      { uid: event.params.uid, requestId: event.params.requestId, data: event.data?.data() },
      identify,
    ),
);
