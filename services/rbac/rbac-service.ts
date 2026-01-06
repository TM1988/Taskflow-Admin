import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where,
  serverTimestamp 
} from "firebase/firestore";
import { Role, Permission, UserRole, Action, DEFAULT_ROLES } from "@/types/rbac";

const ROLES_COLLECTION = "roles";
const USER_ROLES_COLLECTION = "userRoles";

/**
 * Initialize default roles in Firestore
 */
export async function initializeDefaultRoles() {
  try {
    const rolesRef = collection(db, ROLES_COLLECTION);
    const snapshot = await getDocs(rolesRef);
    
    if (snapshot.empty) {
      // Create default roles
      for (const role of DEFAULT_ROLES) {
        const roleDoc = doc(rolesRef);
        await setDoc(roleDoc, {
          ...role,
          id: roleDoc.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      console.log("Default roles initialized");
    }
  } catch (error) {
    console.error("Failed to initialize default roles:", error);
    throw error;
  }
}

/**
 * Get all roles
 */
export async function getAllRoles(): Promise<Role[]> {
  try {
    const rolesRef = collection(db, ROLES_COLLECTION);
    const snapshot = await getDocs(rolesRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Role));
  } catch (error) {
    console.error("Failed to get roles:", error);
    return [];
  }
}

/**
 * Get role by ID
 */
export async function getRoleById(roleId: string): Promise<Role | null> {
  try {
    const roleDoc = await getDoc(doc(db, ROLES_COLLECTION, roleId));
    if (roleDoc.exists()) {
      return { id: roleDoc.id, ...roleDoc.data() } as Role;
    }
    return null;
  } catch (error) {
    console.error("Failed to get role:", error);
    return null;
  }
}

/**
 * Create a new role
 */
export async function createRole(name: string, permissions: Permission[]): Promise<string> {
  try {
    const roleDoc = doc(collection(db, ROLES_COLLECTION));
    await setDoc(roleDoc, {
      name,
      permissions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return roleDoc.id;
  } catch (error) {
    console.error("Failed to create role:", error);
    throw error;
  }
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<void> {
  try {
    const userRoleDoc = doc(db, USER_ROLES_COLLECTION, `${userId}_${roleId}`);
    await setDoc(userRoleDoc, {
      userId,
      roleId,
      assignedAt: serverTimestamp(),
      assignedBy
    });
  } catch (error) {
    console.error("Failed to assign role:", error);
    throw error;
  }
}

/**
 * Get user roles
 */
export async function getUserRoles(userId: string): Promise<Role[]> {
  try {
    const userRolesQuery = query(
      collection(db, USER_ROLES_COLLECTION),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(userRolesQuery);
    
    const roleIds = snapshot.docs.map(doc => doc.data().roleId);
    const roles: Role[] = [];
    
    for (const roleId of roleIds) {
      const role = await getRoleById(roleId);
      if (role) roles.push(role);
    }
    
    return roles;
  } catch (error) {
    console.error("Failed to get user roles:", error);
    return [];
  }
}

/**
 * Check if user has permission
 */
export async function hasPermission(
  userId: string,
  resource: string,
  action: Action
): Promise<boolean> {
  try {
    const roles = await getUserRoles(userId);
    
    for (const role of roles) {
      for (const permission of role.permissions) {
        // Check wildcard permission
        if (permission.resource === "*" && permission.actions.includes(action)) {
          return true;
        }
        
        // Check specific resource permission
        if (permission.resource === resource && permission.actions.includes(action)) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error("Failed to check permission:", error);
    return false;
  }
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const roles = await getUserRoles(userId);
    const permissions: Permission[] = [];
    
    for (const role of roles) {
      permissions.push(...role.permissions);
    }
    
    return permissions;
  } catch (error) {
    console.error("Failed to get user permissions:", error);
    return [];
  }
}
