export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  resource: string; // e.g., "collections", "dashboards", "users"
  actions: Action[]; // e.g., ["create", "read", "update", "delete"]
  conditions?: PermissionCondition[];
}

export type Action = "create" | "read" | "update" | "delete" | "execute";

export interface PermissionCondition {
  field: string;
  operator: "equals" | "contains" | "in";
  value: any;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
}

// Predefined roles
export const DEFAULT_ROLES: Omit<Role, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Admin",
    permissions: [
      {
        resource: "*",
        actions: ["create", "read", "update", "delete", "execute"]
      }
    ]
  },
  {
    name: "Editor",
    permissions: [
      {
        resource: "collections",
        actions: ["read", "update"]
      },
      {
        resource: "dashboards",
        actions: ["read", "update"]
      }
    ]
  },
  {
    name: "Viewer",
    permissions: [
      {
        resource: "collections",
        actions: ["read"]
      },
      {
        resource: "dashboards",
        actions: ["read"]
      }
    ]
  }
];
