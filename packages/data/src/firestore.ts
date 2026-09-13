import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { z } from "zod";

const CREDENTIAL_VARIABLE = "FIREBASE_SERVICE_ACCOUNT";

/**
 * The Firestore connection this process uses, or `undefined` when no service
 * account is configured.
 *
 * Resolved once at module scope. That is the singleton guard the Admin SDK
 * needs: a serverless invocation reuses its module scope, and calling
 * `initializeApp` a second time on the same app name throws.
 *
 * **An unconfigured deployment reads no Content rather than failing.** Every
 * Section then renders the empty state it would show for a Tenant nobody has
 * seeded yet, and the build logs why. The alternative — throw — would make a
 * service account a prerequisite for building this repo at all, which would put
 * production credentials on every contributor's machine to render a page. A
 * misconfigured Site is visibly wordless and says so in its build log; a
 * *malformed* credential still throws, because that one is never intentional.
 */
export const FIRESTORE = connect();

function connect(): Firestore | undefined {
  const encoded = process.env[CREDENTIAL_VARIABLE];
  if (encoded === undefined || encoded === "") {
    console.warn(
      `[@salon/data] ${CREDENTIAL_VARIABLE} is not set — no Tenant Content will be read. ` +
        `Every Section renders its empty state.`,
    );
    return undefined;
  }
  return getFirestore(getApps()[0] ?? initializeApp({ credential: credentialFrom(encoded) }));
}

/**
 * The three service account fields the Admin SDK needs, parsed rather than
 * trusted: an empty or half-pasted credential otherwise surfaces much later,
 * inside an unrelated Firestore call, with nothing pointing back at the
 * environment variable that caused it.
 */
const serviceAccountSchema = z.object({
  project_id: z.string().min(1),
  client_email: z.string().min(1),
  private_key: z.string().min(1),
});

/**
 * The credential travels base64-encoded because a service account's private key
 * is a PEM block, and its newlines do not survive being pasted through a
 * dashboard field, a shell or a `.env` file intact.
 */
function credentialFrom(encoded: string) {
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const account = serviceAccountSchema.safeParse(parseJson(decoded));
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

function parseJson(decoded: string): unknown {
  try {
    return JSON.parse(decoded);
  } catch (cause) {
    throw new Error(`${CREDENTIAL_VARIABLE} does not decode to JSON.`, { cause });
  }
}
