"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTutorial } from "@/contexts/TutorialContext";
import { LoadingSpinner } from "@/components/ui/loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Plus, TrendingUp, Users, Activity, Settings, HelpCircle, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CreateCollectionDialog } from "@/components/dashboard/CreateCollectionDialog";
import Link from "next/link";
import { getAppUrl } from "@/lib/app-url";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Collection {
  name: string;
  count: number;
  size: number;
}

export default function OrganizationDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { user, organization, loading: authLoading } = useAuth();
  const orgSlug = params.orgSlug as string;

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { startTutorial } = useTutorial();
  const { toast } = useToast();

  const handleShowTutorial = () => {
    localStorage.removeItem('tutorialCompleted');
    startTutorial();
  };

  const handleDeleteClick = (collectionName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCollectionToDelete(collectionName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!collectionToDelete || !organization) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/collections/${collectionToDelete}`, {
        method: 'DELETE',
        headers: {
          'x-org-id': organization.id
        }
      });

      if (!res.ok) throw new Error('Failed to delete collection');

      toast({
        title: "Collection deleted",
        description: `Successfully deleted collection "${collectionToDelete}"`
      });

      // Refresh collections list
      fetchCollections();
    } catch (err: any) {
      toast({
        title: "Deletion failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (!organization) {
        router.push('/onboarding');
      } else if (organization.slug !== orgSlug) {
        // User trying to access different org
        router.push(`/${organization.slug}`);
      } else {
        fetchCollections();
      }
    }
  }, [user, organization, authLoading, orgSlug, router]);

  const fetchCollections = async () => {
    if (!organization) return;

    try {
      setLoading(true);
      const res = await fetch('/api/user-collections', {
        headers: {
          'x-org-id': organization.id
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

  if (authLoading || loading || !organization) {
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
        title={organization.name}
        description={`${getAppUrl().replace(/^https?:\/\//, '')}/${organization.slug}`}
        icon={<Database className="h-6 w-6" />}
        showBackButton={false}
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={handleShowTutorial} title="Show Tutorial">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => router.push(`/${organization.slug}/demo`)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              See Demo
            </Button>
            <Button size="sm" onClick={() => router.push(`/${orgSlug}/builder`)} data-tutorial="edit-dashboard">
              <Plus className="mr-2 h-4 w-4" />
              Edit Dashboard
            </Button>
          </>
        }
      />

      <div className="container mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome to {organization.name}</h2>
          <p className="text-muted-foreground mt-2">
            Manage your MongoDB data with powerful visual tools
          </p>
        </div>

        {/* Stats Overview */}
        <div className="dashboard-stats grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
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
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all collections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Size</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalSize / 1024 / 1024).toFixed(2)} MB
              </div>
              <p className="text-xs text-muted-foreground">Total storage used</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organization.members.length}</div>
              <p className="text-xs text-muted-foreground">Active collaborators</p>
            </CardContent>
          </Card>
        </div>

        {/* Collections List */}
        <Card className="collections-section">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Collections</CardTitle>
                <CardDescription>
                  Browse and manage your MongoDB collections
                </CardDescription>
              </div>
              <CreateCollectionDialog onCollectionCreated={fetchCollections} data-tutorial="create-collection" />
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
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
                  Create your first collection to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {collections.map((collection) => (
                  <div key={collection.name} className="relative">
                    <Link href={`/${orgSlug}/collections/${collection.name}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-center space-x-4">
                          <Database className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-medium">{collection.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {collection.count.toLocaleString()} documents •{' '}
                              {(collection.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" className="bg-primary/10 hover:bg-primary/20">
                            View
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={(e) => handleDeleteClick(collection.name, e)}
                            className="bg-destructive/20 text-destructive hover:bg-destructive/30 hover:text-destructive border border-destructive/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-start w-full" onClick={() => router.push(`/${orgSlug}/builder`)}>
                <Database className="h-5 w-5 mb-2" />
                <span className="font-medium">Create Dashboard</span>
                <span className="text-xs text-muted-foreground mt-1 text-left">
                  Build a custom dashboard with drag-and-drop blocks
                </span>
              </Button>

              <Button variant="outline" className="h-auto py-4 flex flex-col items-start w-full" onClick={() => router.push(`/${orgSlug}/audit-logs`)}>
                <Activity className="h-5 w-5 mb-2" />
                <span className="font-medium">View Audit Logs</span>
                <span className="text-xs text-muted-foreground mt-1 text-left">
                  Track all administrative actions and changes
                </span>
              </Button>

              <Button variant="outline" className="h-auto py-4 flex flex-col items-start w-full" onClick={() => router.push('/organizations/settings')}>
                <Users className="h-5 w-5 mb-2" />
                <span className="font-medium">Manage Team</span>
                <span className="text-xs text-muted-foreground mt-1 text-left">
                  Invite members and configure permissions
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the collection "{collectionToDelete}" and all its documents.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Collection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const dynamic = 'force-dynamic';
