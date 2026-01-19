"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Building2, Users, Link as LinkIcon, Shield, Copy, Check, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading";
import { Organization } from "@/types/organization";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAppUrl } from "@/lib/app-url";

export default function OrganizationSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrganization();
    }
  }, [user]);

  const fetchOrganization = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/organizations', {
        headers: {
          'x-user-id': user.uid
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.organization) {
          setOrganization(data.organization);
          setNewSlug(data.organization.slug);
          setNewName(data.organization.name);
        } else {
          router.push('/onboarding');
        }
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (!organization) return;
    navigator.clipboard.writeText(organization.inviteCode);
    setCopiedCode(true);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard"
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRegenerateCode = async () => {
    if (!organization) return;

    try {
      const response = await fetch(`/api/organizations/${organization.id}/invite`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate invite code');
      }

      const data = await response.json();
      setOrganization({ ...organization, inviteCode: data.inviteCode });
      
      toast({
        title: "Code regenerated",
        description: "New invite code has been generated"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateOrganization = async () => {
    if (!organization || (!newName && !newSlug)) return;

    setUpdating(true);
    try {
      const updates: any = {};
      if (newName !== organization.name) updates.name = newName;
      if (newSlug !== organization.slug) updates.slug = newSlug;

      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update organization');
      }

      toast({
        title: "Updated successfully",
        description: "Organization settings have been updated"
      });

      await fetchOrganization();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!organization || !confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(`/api/organizations/${organization.id}/members?userId=${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      toast({
        title: "Member removed",
        description: "Member has been removed from the organization"
      });

      await fetchOrganization();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const isOwner = organization && user && organization.ownerId === user.uid;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading organization settings..." />
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Organization Settings"
        description={organization.name}
        icon={<Building2 className="h-6 w-6" />}
        backHref={`/${organization.slug}`}
      />

      <div className="container mx-auto max-w-4xl p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invite" data-value="invite">Invite</TabsTrigger>
            {isOwner && <TabsTrigger value="sso">SSO</TabsTrigger>}
            {isOwner && <TabsTrigger value="danger">Danger Zone</TabsTrigger>}
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Update your organization's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={!isOwner}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgSlug">Organization URL</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {getAppUrl().replace(/^https?:\/\//, '')}/
                    </span>
                    <Input
                      id="orgSlug"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
                      disabled={!isOwner}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isOwner ? "Changes will take effect immediately" : "Only the owner can change the URL"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Organization ID</Label>
                  <Input value={organization.id} disabled className="font-mono text-xs" />
                </div>

                {isOwner && (
                  <>
                    <Separator />
                    <Button 
                      onClick={handleUpdateOrganization}
                      disabled={updating || (newName === organization.name && newSlug === organization.slug)}
                    >
                      {updating ? "Updating..." : "Save Changes"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members ({organization.members.length})
                </CardTitle>
                <CardDescription>
                  Manage your organization members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {organization.members.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.email}</span>
                          <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {isOwner && member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.userId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invite Tab */}
          <TabsContent value="invite">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Invite Members
                </CardTitle>
                <CardDescription>
                  Share this code with people you want to invite
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Invite Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={organization.inviteCode}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyInviteCode}
                    >
                      {copiedCode ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this code with team members to invite them to join
                  </p>
                </div>

                <Alert>
                  <LinkIcon className="h-4 w-4" />
                  <AlertDescription>
                    Members can join by visiting the onboarding page and entering this code
                  </AlertDescription>
                </Alert>

                {isOwner && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Regenerate Code</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Generate a new invite code. The old code will be immediately invalidated.
                      </p>
                      <Button variant="outline" onClick={handleRegenerateCode}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate Code
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SSO Tab (Owner only) */}
          {isOwner && (
            <TabsContent value="sso">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    SSO Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure custom authentication for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      SSO configuration is coming soon. You'll be able to integrate with Google Workspace, Microsoft Azure AD, Okta, Auth0, and custom OIDC providers.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Danger Zone (Owner only) */}
          {isOwner && (
            <TabsContent value="danger">
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Delete Organization</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete this organization and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Organization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
