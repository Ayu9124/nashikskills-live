import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;

export function initializeFirebase() {
  if (db) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT_JSON not set.');
    console.warn('   Copy backend/.env.example to backend/.env and fill it in.');
    return;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    const databaseId = process.env.FIREBASE_DATABASE_ID || '(default)';

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    // Initialize Firestore with the correct named database
    const firestoreSettings: admin.firestore.Settings = {};
    if (databaseId !== '(default)') {
      firestoreSettings.databaseId = databaseId;
    }

    db = admin.firestore();
    db.settings(firestoreSettings);

    console.log('✅ Firebase Admin SDK initialized');
    console.log(`📦 Firestore Database ID: ${databaseId}`);
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

export function getFirestore(): admin.firestore.Firestore {
  if (!db) {
    throw new Error('Firebase not initialized. Check FIREBASE_SERVICE_ACCOUNT_JSON in backend/.env');
  }
  return db;
}

export { admin };
