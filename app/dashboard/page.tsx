"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Plus, TrendingUp, Users, Activity } from "lucide-react";
import Link from "next/link";

interface Collection {
  name: string;
  count: number;
  size: number;
  schema: Record<string, any>;
}

export default function DashboardPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/collections');
      if (!res.ok) throw new Error('Failed to fetch collections');
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalDocuments = collections.reduce((sum, col) => sum + col.count, 0);
  const totalSize = collections.reduce((sum, col) => sum + col.size, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Database className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Taskflow Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => window.location.href = '/dashboard/builder'}>
              <Plus className="mr-2 h-4 w-4" />
              New Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome to Taskflow Admin</h2>
          <p className="text-muted-foreground mt-2">
            Manage your MongoDB data with powerful visual tools
          </p>
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
                Status
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Connected</div>
              <p className="text-xs text-muted-foreground">
                MongoDB is online
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
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading collections...</p>
              </div>
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
                  Create your first collection in MongoDB to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {collections.map((collection) => (
                  <Link
                    key={collection.name}
                    href={`/dashboard/collections/${collection.name}`}
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/dashboard/builder">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-start w-full">
                  <Database className="h-5 w-5 mb-2" />
                  <span className="font-medium">Create Dashboard</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Build a custom dashboard with drag-and-drop blocks
                  </span>
                </Button>
              </Link>
              
              <Link href="/dashboard/audit-logs">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-start w-full">
                  <Activity className="h-5 w-5 mb-2" />
                  <span className="font-medium">View Audit Logs</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Track all administrative actions and changes
                  </span>
                </Button>
              </Link>
              
              <Link href="/dashboard/settings">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-start w-full">
                  <Users className="h-5 w-5 mb-2" />
                  <span className="font-medium">Manage Access</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Configure roles and permissions
                  </span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
