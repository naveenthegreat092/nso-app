/**
 * NSO FCM Push Notification Service
 * Uses Firebase Admin SDK to send push notifications to Android devices.
 * Falls back gracefully if Firebase credentials are not configured.
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let firebaseApp = null;
let messaging = null;
let fcmEnabled = false;

/**
 * Initialize Firebase Admin SDK.
 * Called once from server.js at startup.
 * Reads FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON from env.
 */
export function initFCM() {
  try {
    const require = createRequire(import.meta.url);
    let admin;
    try {
      admin = require('firebase-admin');
    } catch {
      console.warn('[FCM] firebase-admin not installed — push notifications disabled.');
      console.warn('[FCM] Run: npm install firebase-admin   then restart server.');
      return;
    }

    // Already initialized
    if (admin.apps.length > 0) {
      firebaseApp = admin.apps[0];
      messaging = admin.messaging(firebaseApp);
      fcmEnabled = true;
      console.log('[FCM] ✅ Firebase Admin already initialized.');
      return;
    }

    // Load credentials
    let credential;

    // Option 1: JSON file path
    const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (saPath && fs.existsSync(saPath)) {
      const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
      credential = admin.credential.cert(sa);
      console.log('[FCM] Using service account from file:', saPath);
    }

    // Option 2: Inline JSON string in env
    if (!credential) {
      const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (saJson) {
        try {
          const sa = JSON.parse(saJson);
          credential = admin.credential.cert(sa);
          console.log('[FCM] Using service account from FIREBASE_SERVICE_ACCOUNT_JSON env.');
        } catch {
          console.warn('[FCM] FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.');
        }
      }
    }

    // Option 3: Local file in server/ directory
    if (!credential) {
      const localPath = path.join(__dirname, 'firebase-service-account.json');
      if (fs.existsSync(localPath)) {
        const sa = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        credential = admin.credential.cert(sa);
        console.log('[FCM] Using local server/firebase-service-account.json.');
      }
    }

    if (!credential) {
      console.warn('[FCM] ⚠️  No Firebase credentials found. Push notifications disabled.');
      console.warn('[FCM]    Add FIREBASE_SERVICE_ACCOUNT_JSON to .env  OR');
      console.warn('[FCM]    Place server/firebase-service-account.json in the server folder.');
      return;
    }

    firebaseApp = admin.initializeApp({ credential });
    messaging = admin.messaging(firebaseApp);
    fcmEnabled = true;
    console.log('[FCM] ✅ Firebase Admin SDK initialized. Push notifications ENABLED.');
  } catch (err) {
    console.error('[FCM] Init error:', err.message);
  }
}

/**
 * Send a push notification to one or more FCM tokens.
 * @param {string|string[]} tokens - Device FCM token(s)
 * @param {string} title
 * @param {string} body
 * @param {object} data - Extra key-value payload (all strings)
 */
export async function sendPush(tokens, title, body, data = {}) {
  if (!fcmEnabled || !messaging) return;
  if (!tokens) return;

  const tokenList = Array.isArray(tokens) ? tokens.filter(Boolean) : [tokens].filter(Boolean);
  if (tokenList.length === 0) return;

  const stringData = {};
  for (const [k, v] of Object.entries(data)) {
    stringData[k] = String(v ?? '');
  }

  const message = {
    notification: { title, body },
    data: stringData,
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'nso_default',
        icon: 'ic_notification',
        color: '#6366f1',
      },
    },
  };

  try {
    if (tokenList.length === 1) {
      const result = await messaging.send({ ...message, token: tokenList[0] });
      console.log(`[FCM] ✅ Sent to 1 device: ${result}`);
    } else {
      const result = await messaging.sendEachForMulticast({ ...message, tokens: tokenList });
      console.log(`[FCM] ✅ Sent to ${result.successCount}/${tokenList.length} devices.`);
    }
  } catch (err) {
    console.error('[FCM] Send error:', err.message);
  }
}

export function isFCMEnabled() {
  return fcmEnabled;
}
