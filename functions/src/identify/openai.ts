import { HttpsError } from 'firebase-functions/https';
import { logger } from 'firebase-functions/logger';
import OpenAI from 'openai';
import { type Response } from 'openai/resources/responses/responses';

import { SYSTEM_PROMPT, USER_PROMPT } from './prompt';
import {
  IDENTIFY_JSON_SCHEMA,
  type IdentifyResult,
  NO_SPECIMEN,
  parseIdentifyResult,
} from './schema';

export type IdentifyImage = (jpeg: Buffer) => Promise<IdentifyResult>;

const EFFORTS = ['none', 'low', 'medium', 'high'] as const;
type Effort = (typeof EFFORTS)[number];

/** Unknown values fall back to `low`, which every current vision model supports. */
export const toEffort = (value: string): Effort =>
  (EFFORTS as readonly string[]).includes(value) ? (value as Effort) : 'low';

// Per attempt. With one retry the worst case (~24 s) stays inside the 30 s function timeout.
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_OUTPUT_TOKENS = 2_000;

function toHttpsError(error: unknown): HttpsError {
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return new HttpsError('deadline-exceeded', 'Identification took too long. Please try again.');
  }
  if (error instanceof OpenAI.APIConnectionError) {
    return new HttpsError('unavailable', 'Specimen ID is unreachable right now. Please try again.');
  }
  if (error instanceof OpenAI.RateLimitError || error instanceof OpenAI.InternalServerError) {
    logger.warn('OpenAI temporarily unavailable', { status: error.status, code: error.code });
    return new HttpsError('unavailable', 'Specimen ID is busy right now. Please try again.');
  }
  if (error instanceof OpenAI.APIError) {
    // 400/401/403/404: a configuration problem (key, model name, schema), not the user's fault.
    logger.error('OpenAI request rejected', {
      status: error.status,
      code: error.code,
      detail: error.message,
    });
  } else {
    logger.error('OpenAI call failed', { error });
  }
  return new HttpsError(
    'internal',
    'Specimen ID is unavailable right now. Please try again later.',
  );
}

const hasRefusal = (response: Response) =>
  response.output.some(
    (item) => item.type === 'message' && item.content.some((part) => part.type === 'refusal'),
  );

function readResult(response: Response): IdentifyResult {
  if (response.status === 'incomplete') {
    logger.warn('OpenAI response incomplete', { reason: response.incomplete_details?.reason });
    throw new HttpsError('unavailable', 'Specimen ID could not finish. Please try again.');
  }
  // A refusal means the model won't describe the image; for the user that's "no specimen found".
  if (hasRefusal(response)) return NO_SPECIMEN;

  try {
    return parseIdentifyResult(JSON.parse(response.output_text));
  } catch (error) {
    logger.error('Unparseable OpenAI output', {
      error,
      output: response.output_text.slice(0, 500),
    });
    throw new HttpsError(
      'internal',
      'Specimen ID returned an unexpected answer. Please try again.',
    );
  }
}

/** Builds the identifier used by identifyBird. One client per instance keeps connections warm. */
export function createOpenAIIdentifier(
  apiKey: string,
  model: string,
  effort: Effort = 'none',
): IdentifyImage {
  const client = new OpenAI({ apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 });

  return async (jpeg) => {
    const started = Date.now();
    let response: Response;
    try {
      response = await client.responses.create({
        model,
        reasoning: { effort },
        max_output_tokens: MAX_OUTPUT_TOKENS,
        input: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'input_text', text: USER_PROMPT },
              {
                type: 'input_image',
                image_url: `data:image/jpeg;base64,${jpeg.toString('base64')}`,
                detail: 'high',
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'specimen_identification',
            schema: IDENTIFY_JSON_SCHEMA,
            strict: true,
          },
        },
      });
    } catch (error) {
      throw toHttpsError(error);
    }

    logger.info('OpenAI identified image', {
      model,
      effort,
      ms: Date.now() - started,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
    });
    return readResult(response);
  };
}
