"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  getAllRoles, 
  createRole, 
  initializeDefaultRoles,
  getUserRoles 
} from "@/services/rbac/rbac-service";
import { Role } from "@/types/rbac";
import { Loader2, Shield, Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
    if (user) {
      loadUserRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadRoles = async () => {
    try {
      // Initialize default roles if needed
      await initializeDefaultRoles();
      
      const allRoles = await getAllRoles();
      setRoles(allRoles);
    } catch (error) {
      console.error("Failed to load roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRoles = async () => {
    if (!user) return;
    try {
      const roles = await getUserRoles(user.uid);
      setUserRoles(roles);
    } catch (error) {
      console.error("Failed to load user roles:", error);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a role name",
        variant: "destructive"
      });
      return;
    }

    try {
      await createRole(newRoleName, [
        {
          resource: "collections",
          actions: ["read"]
        }
      ]);
      
      toast({
        title: "Role created",
        description: `Successfully created role: ${newRoleName}`
      });
      
      setNewRoleName("");
      setShowCreateDialog(false);
      loadRoles();
    } catch (error) {
      toast({
        title: "Failed to create role",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Settings & Access Control
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage roles, permissions, and access control
          </p>
        </div>

        {/* User Info */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">User ID</Label>
                  <p className="font-mono text-sm">{user.uid}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Your Roles</Label>
                  <div className="flex gap-2 mt-2">
                    {userRoles.length === 0 ? (
                      <Badge variant="outline">No roles assigned</Badge>
                    ) : (
                      userRoles.map(role => (
                        <Badge key={role.id}>{role.name}</Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roles Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Configure access control with role-based permissions
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Define a new role with custom permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Role Name</Label>
                    <Input
                      placeholder="e.g., Data Analyst"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRole}>
                    Create Role
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {roles.map((role) => (
                  <Card key={role.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Permissions</Label>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map((perm, idx) => (
                            <Badge key={idx} variant="secondary">
                              {perm.resource}: {perm.actions.join(", ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Status */}
        <Card>
          <CardHeader>
            <CardTitle>Features Status</CardTitle>
            <CardDescription>
              Overview of implemented features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>MongoDB Auto-Discovery</span>
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>CRUD Operations</span>
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Dashboard Builder</span>
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Role-Based Access Control</span>
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Real-Time Updates</span>
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Audit Logging</span>
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Firebase Authentication</span>
                <Badge>Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
