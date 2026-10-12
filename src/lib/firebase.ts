import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocFromServer,
  increment,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { PointsTransaction, SwapItem, EnvironmentalReport, UserProfile } from '../types/ecoapp';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is limited.');
    }
    return false;
  }
}

// User Profile persistence
export async function syncUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    const userDocRef = doc(db, 'users', profile.id);
    const existing = await getDoc(userDocRef);
    if (!existing.exists()) {
      await setDoc(userDocRef, {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        neighborhood: profile.neighborhood,
        points: 250, // Welcome points
        phone: profile.phone || '',
        avatar: profile.avatar || '',
        businessName: profile.businessName || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(userDocRef, {
        name: profile.name,
        neighborhood: profile.neighborhood,
        phone: profile.phone || '',
        avatar: profile.avatar || '',
        businessName: profile.businessName || '',
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Listen to User Profile changes
export function subscribeToUserProfile(
  userId: string,
  callback: (data: Partial<UserProfile> & { points?: number } | null) => void
) {
  const path = `users/${userId}`;
  return onSnapshot(
    doc(db, 'users', userId),
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as any);
      } else {
        callback(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Add Points Transaction
export async function recordPointsTransaction(
  userId: string,
  tx: Omit<PointsTransaction, 'id'>
): Promise<void> {
  const txId = `tx-${Date.now()}`;
  const path = `users/${userId}/transactions/${txId}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', txId);
    await setDoc(txRef, {
      ...tx,
      id: txId,
      userId,
      createdAt: new Date().toISOString(),
    });
    // Update total user points
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      points: increment(tx.type === 'earned' ? tx.amount : -tx.amount),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Subscribe to Community Donations (EcoTroca)
export function subscribeToDonations(
  callback: (donations: SwapItem[]) => void
) {
  const path = 'donations';
  const q = query(collection(db, 'donations'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: SwapItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title,
          category: data.category,
          type: data.type,
          condition: data.condition || 'Bom estado',
          description: data.description,
          authorName: data.authorName,
          authorNeighborhood: data.authorNeighborhood || 'Ipatinga',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
          publishedAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR') : 'Hoje',
          available: data.available !== false,
          distance: '0.8 km',
        });
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Create New Donation
export async function addDonation(
  donation: Omit<SwapItem, 'id' | 'distance'>,
  userId: string
): Promise<string> {
  const id = `don-${Date.now()}`;
  const path = `donations/${id}`;
  try {
    await setDoc(doc(db, 'donations', id), {
      id,
      title: donation.title,
      category: donation.category,
      type: donation.type,
      condition: donation.condition,
      description: donation.description,
      authorId: userId,
      authorName: donation.authorName,
      authorNeighborhood: donation.authorNeighborhood,
      imageUrl: donation.imageUrl,
      available: true,
      createdAt: new Date().toISOString(),
    });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Subscribe to Community Environmental Reports
export function subscribeToReports(
  callback: (reports: EnvironmentalReport[]) => void
) {
  const path = 'reports';
  const q = query(collection(db, 'reports'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const reports: EnvironmentalReport[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        reports.push({
          id: docSnap.id,
          protocol: data.protocol || `IP-${docSnap.id.slice(-6)}`,
          type: data.type || 'descarte_irregular',
          title: data.title,
          description: data.description,
          address: data.address,
          status: data.status || 'recebido',
          reportedAt: data.reportedAt || 'Hoje',
          imageUrl: data.imageUrl,
          upvotes: data.upvotes || 0,
          responseNote: data.responseNote,
        });
      });
      callback(reports);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Create Environmental Report
export async function addReport(
  report: Omit<EnvironmentalReport, 'id' | 'protocol'>,
  userId: string
): Promise<string> {
  const id = `rep-${Date.now()}`;
  const path = `reports/${id}`;
  const protocol = `SESUMA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  try {
    await setDoc(doc(db, 'reports', id), {
      id,
      protocol,
      type: report.type,
      title: report.title,
      description: report.description,
      address: report.address,
      status: 'recebido',
      authorId: userId,
      authorName: auth.currentUser?.displayName || 'Cidadão de Ipatinga',
      upvotes: 1,
      reportedAt: 'Hoje',
      imageUrl: report.imageUrl || '',
      createdAt: new Date().toISOString(),
    });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Upvote Report
export async function upvoteReportInDb(reportId: string): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    await updateDoc(doc(db, 'reports', reportId), {
      upvotes: increment(1),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export { signInWithPopup, firebaseSignOut, onAuthStateChanged };
export type { FirebaseUser };
