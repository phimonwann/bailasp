/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, LeaveRequest, StationConfig, AuditLog } from '../types/leave';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Connect to specific database instance from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
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
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot as requested by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connected to Cloud Firestore successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline, using local cached data.');
    } else {
      console.log('[Firebase] Initial connection probe completed.');
    }
    return false;
  }
}

// ==================== FIRESTORE SYNC & SEED UTILITIES ====================

const USERS_COL = 'users';
const LEAVES_COL = 'leaveRequests';
const CONFIG_COL = 'stationConfig';
const CONFIG_DOC = 'default';
const AUDIT_COL = 'auditLogs';

/**
 * Seed initial data to Firestore if collection is empty
 */
export async function seedInitialFirestoreData(
  initialUsers: User[], 
  initialLeaves: LeaveRequest[], 
  initialConfig: StationConfig
): Promise<void> {
  try {
    const usersSnapshot = await getDocs(collection(db, USERS_COL)).catch(err => {
      handleFirestoreError(err, OperationType.GET, USERS_COL);
    });

    if (usersSnapshot.empty) {
      console.log('[Firebase] Seeding initial police users to Firestore...');
      const batch = writeBatch(db);
      initialUsers.forEach(u => {
        batch.set(doc(db, USERS_COL, u.id), u);
      });
      await batch.commit();
    }

    const leavesSnapshot = await getDocs(collection(db, LEAVES_COL)).catch(err => {
      handleFirestoreError(err, OperationType.GET, LEAVES_COL);
    });

    if (leavesSnapshot.empty) {
      console.log('[Firebase] Seeding initial leave requests to Firestore...');
      const batch = writeBatch(db);
      initialLeaves.forEach(l => {
        batch.set(doc(db, LEAVES_COL, l.id), l);
      });
      await batch.commit();
    }

    const configDocRef = doc(db, CONFIG_COL, CONFIG_DOC);
    const configSnap = await getDoc(configDocRef).catch(err => {
      handleFirestoreError(err, OperationType.GET, `${CONFIG_COL}/${CONFIG_DOC}`);
    });

    if (!configSnap.exists()) {
      console.log('[Firebase] Seeding station configuration...');
      await setDoc(configDocRef, initialConfig).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `${CONFIG_COL}/${CONFIG_DOC}`);
      });
    }
  } catch (error) {
    console.warn('[Firebase] Seed warning (running offline fallback if needed):', error);
  }
}

/**
 * Real-time subscribers for AppContext
 */
export function subscribeToUsers(onUpdate: (users: User[]) => void, onError?: (err: unknown) => void) {
  return onSnapshot(
    collection(db, USERS_COL),
    (snapshot) => {
      const data = snapshot.docs.map(d => d.data() as User);
      if (data.length > 0) {
        onUpdate(data);
      }
    },
    (error) => {
      console.error('[Firebase] Error subscribing to users:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, USERS_COL);
    }
  );
}

export function subscribeToLeaves(onUpdate: (leaves: LeaveRequest[]) => void, onError?: (err: unknown) => void) {
  return onSnapshot(
    collection(db, LEAVES_COL),
    (snapshot) => {
      const data = snapshot.docs.map(d => d.data() as LeaveRequest);
      if (data.length > 0) {
        onUpdate(data);
      }
    },
    (error) => {
      console.error('[Firebase] Error subscribing to leaves:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, LEAVES_COL);
    }
  );
}

export function subscribeToStationConfig(onUpdate: (config: StationConfig) => void, onError?: (err: unknown) => void) {
  return onSnapshot(
    doc(db, CONFIG_COL, CONFIG_DOC),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as StationConfig);
      }
    },
    (error) => {
      console.error('[Firebase] Error subscribing to station config:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `${CONFIG_COL}/${CONFIG_DOC}`);
    }
  );
}

// Sync helpers for database mutation
export async function firestoreSaveLeave(leave: LeaveRequest): Promise<void> {
  try {
    await setDoc(doc(db, LEAVES_COL, leave.id), leave);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${LEAVES_COL}/${leave.id}`);
  }
}

export async function firestoreUpdateLeave(leaveId: string, partial: Partial<LeaveRequest>): Promise<void> {
  try {
    await updateDoc(doc(db, LEAVES_COL, leaveId), partial);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${LEAVES_COL}/${leaveId}`);
  }
}

export async function firestoreSaveUser(user: User): Promise<void> {
  try {
    await setDoc(doc(db, USERS_COL, user.id), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COL}/${user.id}`);
  }
}

export async function firestoreDeleteUser(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, USERS_COL, userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${USERS_COL}/${userId}`);
  }
}

export async function firestoreSaveStationConfig(config: StationConfig): Promise<void> {
  try {
    await setDoc(doc(db, CONFIG_COL, CONFIG_DOC), config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CONFIG_COL}/${CONFIG_DOC}`);
  }
}

export async function firestoreSaveAuditLog(log: AuditLog): Promise<void> {
  try {
    await setDoc(doc(db, AUDIT_COL, log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${AUDIT_COL}/${log.id}`);
  }
}
