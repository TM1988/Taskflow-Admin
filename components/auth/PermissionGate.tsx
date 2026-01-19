"use client";

import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/services/rbac/rbac-service";
import { Action } from "@/types/rbac";
import { useEffect, useState } from "react";

interface PermissionGateProps {
  resource: string;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ 
  resource, 
  action, 
  children, 
  fallback = null 
}: PermissionGateProps) {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      hasPermission(user.uid, resource, action).then(result => {
        setAllowed(result);
        setLoading(false);
      });
    } else {
      setAllowed(false);
      setLoading(false);
    }
  }, [user, resource, action]);

  if (loading) return null;
  if (!allowed) return <>{fallback}</>;
  
  return <>{children}</>;
}

/**
 * Hook to check permissions
 */
export function usePermission(resource: string, action: Action) {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      hasPermission(user.uid, resource, action).then(result => {
        setAllowed(result);
        setLoading(false);
      });
    } else {
      setAllowed(false);
      setLoading(false);
    }
  }, [user, resource, action]);

  return { allowed, loading };
}

