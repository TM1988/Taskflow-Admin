"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Plus, TrendingUp, Users, Activity, Settings, BarChart, Shield, Eye } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { LoadingSpinner } from "@/components/ui/loading";
import { CreateCollectionDialog } from "@/components/dashboard/CreateCollectionDialog";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Collection {
  name: string;
  count: number;
  size: number;
  schema: Record<string, any>;
}

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  const { user, organization, loading: authLoading } = useAuth();
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user role within the organization
  const userRole = organization?.members.find(m => m.userId === user?.uid)?.role;
  const isOwner = userRole === 'owner';
  const canEdit = isOwner || userRole === 'member'; // members can edit, viewers can only read

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (!organization) {
        router.push('/onboarding');
      } else if (organization.slug !== orgSlug) {
        router.push(`/${organization.slug}/dashboard`);
      } else {
        fetchCollections();
      }
    }
  }, [user, organization, authLoading, orgSlug, router]);

  const fetchCollections = async () => {
    if (!user || !organization) return;
    
    try {
      setLoading(true);
      const res = await fetch('/api/user-collections', {
        headers: {
          'x-org-id': organization.id,
          'x-user-id': user.uid
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch collections');
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  const totalDocuments = collections.reduce((sum, col) => sum + col.count, 0);
  const totalSize = collections.reduce((sum, col) => sum + col.size, 0);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={`${organization.name} - Dashboard`}
        description="Manage your MongoDB data with powerful visual tools"
        icon={<Database className="h-6 w-6" />}
        showBackButton={true}
        backHref={`/${orgSlug}`}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => router.push(`/${orgSlug}/demo`)}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              See Demo
            </Button>
            {canEdit && (
              <>
                <CreateCollectionDialog onCollectionCreated={fetchCollections} />
                <Button size="sm" onClick={() => router.push(`/${orgSlug}/builder`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Dashboard
                </Button>
              </>
            )}
            {isOwner && (
              <Button size="sm" variant="outline" onClick={() => router.push('/organizations/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            )}
          </div>
        }
      />

      <div className="container mx-auto p-6 space-y-8">
        {/* Role Badge */}
        <div className="flex items-center gap-2">
          {isOwner ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground">
              <Shield className="h-4 w-4 mr-1" />
              Owner - Full Access
            </div>
          ) : canEdit ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              <BarChart className="h-4 w-4 mr-1" />
              Member - Can Edit
            </div>
          ) : (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
              <Eye className="h-4 w-4 mr-1" />
              Viewer - Read Only
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Collections
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{collections.length}</div>
              <p className="text-xs text-muted-foreground">
                Discovered from your database
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Documents
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all collections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Database Size
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalSize / 1024 / 1024).toFixed(2)} MB
              </div>
              <p className="text-xs text-muted-foreground">
                Total storage used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organization.members.length}</div>
              <p className="text-xs text-muted-foreground">
                Active collaborators
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Collections List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Collections</CardTitle>
            <CardDescription>
              Browse and manage your MongoDB collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner message="Loading collections..." />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <p className="text-destructive">{error}</p>
                <Button onClick={fetchCollections} variant="outline">
                  Retry
                </Button>
              </div>
            ) : collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Database className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No collections found</p>
                <p className="text-sm text-muted-foreground">
                  {canEdit ? "Create your first collection in MongoDB to get started" : "No collections available yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {collections.map((collection) => (
                  <Link
                    key={collection.name}
                    href={`/${orgSlug}/collections/${collection.name}`}
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <Database className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{collection.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {collection.count.toLocaleString()} documents • {' '}
                            {(collection.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Role-based */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {canEdit ? "Common tasks to get you started" : "Available actions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {canEdit && (
                <Button variant="outline" className="h-auto py-4 flex flex-col items-start w-full" onClick={() => router.push(`/${orgSlug}/builder`)}>
                  <Database className="h-5 w-5 mb-2" />
                  <span className="font-medium">Create Dashboard</span>
                  <span className="text-xs text-muted-foreground mt-1 text-left">
                    Build a custom dashboard with drag-and-drop blocks
                  </span>
                </Button>
              )}
              
              {isOwner && (
                <Button variant="outline" className="h-auto py-4 flex flex-col items-start w-full" onClick={() => router.push(`/${orgSlug}/audit-logs`)}>
                  <Activity className="h-5 w-5 mb-2" />
                  <span className="font-medium">View Audit Logs</span>
                  <span className="text-xs text-muted-foreground mt-1 text-left">
                    Track all administrative actions and changes
                  </span>
                </Button>
              )}
              
              {isOwner && (
                <Button variant="outline" className="h-auto py-4 flex flex-col items-start w-full" onClick={() => router.push('/organizations/settings')}>
                  <Users className="h-5 w-5 mb-2" />
                  <span className="font-medium">Manage Team</span>
                  <span className="text-xs text-muted-foreground mt-1 text-left">
                    Invite members and configure permissions
                  </span>
                </Button>
              )}

              <Button variant="outline" className="h-auto py-4 flex flex-col items-start w-full" onClick={() => router.push(`/${orgSlug}/demo`)}>
                <TrendingUp className="h-5 w-5 mb-2" />
                <span className="font-medium">View Demo</span>
                <span className="text-xs text-muted-foreground mt-1 text-left">
                  See a preview of your dashboard
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
