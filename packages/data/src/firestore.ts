import { cert, getApps, initializeApp, type Credential } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { z } from "zod";

const CREDENTIAL_VARIABLE = "FIREBASE_SERVICE_ACCOUNT";

/**
 * The three service account fields the Admin SDK needs, parsed rather than
 * trusted: an empty or half-pasted credential otherwise surfaces much later,
 * inside an unrelated Firestore call, with nothing pointing back at the
 * environment variable that caused it.
 *
 * Declared above `FIRESTORE`, because that connects as this module loads and a
 * `const` below it would still be in its temporal dead zone — a crash only a
 * *configured* process ever reaches, which is to say only a deployed one.
 */
const serviceAccountSchema = z.object({
  project_id: z.string().min(1),
  client_email: z.string().min(1),
  private_key: z.string().min(1),
});

/**
 * The Firestore connection this process uses, or `undefined` when no service
 * account is configured.
 *
 * Resolved once at module scope. That is the singleton guard the Admin SDK
 * needs: a serverless invocation reuses its module scope, and a second
 * `initializeApp` for the same app throws.
 *
 * **An unconfigured process reads no Content rather than failing.** Every
 * Section then renders the empty state it shows for a Tenant nobody has seeded
 * yet, and the reason is in the build log. Throwing instead would make a
 * production service account a prerequisite for building this repo at all,
 * which puts Tenant credentials on every contributor's machine to render a
 * page. A *malformed* credential still throws, because that one is never
 * deliberate.
 */
export const FIRESTORE = connect();

function connect(): Firestore | undefined {
  const encoded = process.env[CREDENTIAL_VARIABLE];
  if (encoded === undefined || encoded === "") {
    console.warn(
      `[@salon/data] ${CREDENTIAL_VARIABLE} is not set — no Tenant Content will be read, ` +
        `and every Section renders its empty state.`,
    );
    return undefined;
  }
  return getFirestore(getApps()[0] ?? initializeApp({ credential: credentialFrom(encoded) }));
}

/**
 * The credential travels base64-encoded because a service account's private key
 * is a PEM key, and its newlines do not survive being pasted through a dashboard
 * field, a shell or an env file intact.
 */
function credentialFrom(encoded: string): Credential {
  const account = serviceAccountSchema.safeParse(jsonFrom(decodeBase64(encoded)));
  if (!account.success) {
    throw new Error(
      `${CREDENTIAL_VARIABLE} is not a base64-encoded Firebase service account.\n` +
        z.prettifyError(account.error),
    );
  }
  return cert({
    projectId: account.data.project_id,
    clientEmail: account.data.client_email,
    privateKey: account.data.private_key,
  });
}

function decodeBase64(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf8");
}

function jsonFrom(decoded: string): unknown {
  try {
    return JSON.parse(decoded);
  } catch (cause) {
    throw new Error(`${CREDENTIAL_VARIABLE} does not decode to JSON.`, { cause });
  }
}
