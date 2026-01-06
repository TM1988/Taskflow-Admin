import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export interface AuditLog {
  id?: string;
  userId: string;
  userEmail: string;
  action: string; // e.g., "create", "update", "delete"
  resource: string; // e.g., "collections.users"
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: any;
}

const AUDIT_LOGS_COLLECTION = "auditLogs";

/**
 * Log an admin action
 */
export async function logAuditAction(
  userId: string,
  userEmail: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const auditLog: Omit<AuditLog, "id"> = {
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
      timestamp: serverTimestamp()
    };

    await addDoc(collection(db, AUDIT_LOGS_COLLECTION), auditLog);
  } catch (error) {
    console.error("Failed to log audit action:", error);
    // Don't throw - we don't want audit logging to break the main flow
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limitCount: number = 100
): Promise<AuditLog[]> {
  try {
    const q = query(
      collection(db, AUDIT_LOGS_COLLECTION),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AuditLog));
  } catch (error) {
    console.error("Failed to get user audit logs:", error);
    return [];
  }
}

/**
 * Get audit logs for a resource
 */
export async function getResourceAuditLogs(
  resource: string,
  limitCount: number = 100
): Promise<AuditLog[]> {
  try {
    const q = query(
      collection(db, AUDIT_LOGS_COLLECTION),
      where("resource", "==", resource),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AuditLog));
  } catch (error) {
    console.error("Failed to get resource audit logs:", error);
    return [];
  }
}

/**
 * Get all audit logs
 */
export async function getAllAuditLogs(
  limitCount: number = 100
): Promise<AuditLog[]> {
  try {
    const q = query(
      collection(db, AUDIT_LOGS_COLLECTION),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AuditLog));
  } catch (error) {
    console.error("Failed to get all audit logs:", error);
    return [];
  }
}

/**
 * Helper to log collection operations
 */
export async function logCollectionOperation(
  userId: string,
  userEmail: string,
  action: "create" | "update" | "delete",
  collectionName: string,
  documentId?: string,
  data?: any
) {
  await logAuditAction(
    userId,
    userEmail,
    action,
    `collections.${collectionName}`,
    documentId,
    { data }
  );
}

/**
 * Helper to log dashboard operations
 */
export async function logDashboardOperation(
  userId: string,
  userEmail: string,
  action: "create" | "update" | "delete" | "view",
  dashboardId?: string,
  details?: any
) {
  await logAuditAction(
    userId,
    userEmail,
    action,
    "dashboards",
    dashboardId,
    details
  );
}
