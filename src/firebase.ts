import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, doc, getDocFromServer, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a a time.
    console.warn("Firestore persistence failed: Multiple tabs open");
  } else if (err.code == 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
    console.warn("Firestore persistence failed: Unsupported browser");
  }
});
export const auth = getAuth();
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

let cachedAccessToken: string | null = null;

export const messaging = typeof window !== 'undefined' && 'Notification' in window ? getMessaging(app) : null;

// Call this to setup FCM for the user. We save their token in Firestore.
export const setupFCM = async (userId: string) => {
  if (!messaging) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // In a real app we need a vapid key. If missing, it uses default project key unless blocked.
      const token = await getToken(messaging, {
        // vapidKey: String(import.meta.env.VITE_VAPID_KEY) || undefined 
      });
      if (token) {
        console.log("FCM Token:", token);
        await setDoc(doc(db, 'fcmTokens', token), {
          token,
          userId,
          updatedAt: Date.now()
        }, { merge: true });
      }
    }
  } catch (error) {
    console.error("FCM Setup failed:", error);
  }
};

if (messaging) {
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    // You could show a toast or local notification here.
  });
}

export const handleAuthRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
      }
    }
  } catch (error) {
    console.error("Redirect auth error:", error);
  }
};

export const googleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return result;
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // Automatically try redirect if popup is blocked
    if (
      error.code === 'auth/popup-blocked' || 
      error.code === 'auth/invalid-action-code' || 
      (error.message && error.message.toLowerCase().includes('popup')) ||
      (error.message && error.message.toLowerCase().includes('requested action is invalid'))
    ) {
       console.log("Popup blocked or invalid action in wrapper. Attempting redirect...");
       await signInWithRedirect(auth, googleProvider);
       throw new Error("Redirecting to login...");
    }
    
    if (error.code === 'auth/unauthorized-domain') {
       throw new Error("Domain unauthorized. Please ensure this app URL is added to Firebase Auth Authorized Domains.");
    }
    
    // Check if it's the 403 disallowed_useragent from Webview
    if (error.code === 'auth/web-storage-unsupported' || String(error).includes('disallowed_useragent')) {
       throw new Error("Google Login is blocked inside this app wrapper. Please open this app in Chrome/Safari to log in.");
    }

    throw error;
  }
};

export const googleSignInWithToken = async () => {
  const result = await googleSignIn();
  return { user: result.user, accessToken: cachedAccessToken };
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const storage = getStorage(app);

// test connection removed

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
