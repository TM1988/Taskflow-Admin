"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ArrowLeft, Code, Copy, Check, Sparkles, Edit, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading";
import { TableBlock } from "@/components/blocks/TableBlock";
import { KPIBlock } from "@/components/blocks/KPIBlock";
import { ChartBlock } from "@/components/blocks/ChartBlock";
import { FormBlock } from "@/components/blocks/FormBlock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DemoPage() {
  const router = useRouter();
  const params = useParams();
  const { user, organization } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [hasBlocks, setHasBlocks] = useState(false);

  useEffect(() => {
    checkForBlocks();
  }, []);

  const checkForBlocks = async () => {
    if (!organization || !user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/dashboards', {
        headers: {
          'x-org-id': organization.id,
          'x-user-id': user.uid
        }
      });

      if (response.ok) {
        const data = await response.json();
        const demoDashboard = data.dashboards?.find((d: any) => d.name === 'Demo Dashboard');
        
        if (demoDashboard && demoDashboard.blocks && demoDashboard.blocks.length > 0) {
          setHasBlocks(true);
        }
      }
    } catch (error) {
      console.error('Failed to check for blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const integrationCode = `<!-- Embed this dashboard in your app -->
<iframe 
  src="${process.env.NEXT_PUBLIC_APP_URL}/${params.orgSlug}/dashboard/embed"
  width="100%"
  height="800px"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>

<!-- Or use our JavaScript SDK -->
<script src="https://cdn.taskflow-admin.com/sdk.js"></script>
<script>
  TaskflowAdmin.init({
    orgId: "${organization?.id}",
    apiKey: "YOUR_API_KEY"
  });
  
  TaskflowAdmin.renderDashboard({
    container: "#dashboard-container",
    theme: "light" // or "dark"
  });
</script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(integrationCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Integration code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading demo..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Dashboard Preview"
        description="This is how your dashboard will look when integrated into your application"
        icon={<Sparkles className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => router.push(`/${params.orgSlug}/builder`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Dashboard
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-tutorial="integration-code">
                  <Code className="h-4 w-4 mr-2" />
                  Integration Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Integration Code</DialogTitle>
                  <DialogDescription>
                    Copy and paste this code into your application to embed this dashboard
                  </DialogDescription>
                </DialogHeader>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{integrationCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      <div className="container mx-auto p-6">
        {!hasBlocks ? (
          // Empty state when no blocks have been added
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <Sparkles className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-semibold">No Dashboard Yet</h3>
                <p className="text-muted-foreground max-w-md">
                  You haven't added any blocks to your dashboard yet. Click "Edit Dashboard" to start building your custom dashboard with KPIs, charts, tables, and forms.
                </p>
              </div>
              <Button 
                size="lg"
                onClick={() => router.push(`/${params.orgSlug}/builder`)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Start Building
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Show demo dashboard when blocks exist
          <>
            {/* Demo Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* KPI Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">1,234</CardTitle>
                  <CardDescription>Total Users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    ↑ 12% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">$45,231</CardTitle>
                  <CardDescription>Revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    ↑ 8% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">89%</CardTitle>
                  <CardDescription>Satisfaction Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    ↑ 3% from last month
                  </div>
                </CardContent>
              </Card>

              {/* Chart */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Growth</CardTitle>
                  <CardDescription>User acquisition over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-around gap-2">
                    {[65, 78, 90, 81, 95, 110, 125].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary rounded-t transition-all hover:opacity-80"
                        style={{ height: `${(height / 125) * 100}%` }}
                        title={`${height} users`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-around mt-2 text-xs text-muted-foreground">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Table */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">User</th>
                          <th className="text-left py-2 px-4">Action</th>
                          <th className="text-left py-2 px-4">Time</th>
                          <th className="text-left py-2 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { user: "John Doe", action: "Created document", time: "2 min ago", status: "Success" },
                          { user: "Jane Smith", action: "Updated profile", time: "5 min ago", status: "Success" },
                          { user: "Bob Johnson", action: "Deleted item", time: "10 min ago", status: "Success" },
                          { user: "Alice Brown", action: "Uploaded file", time: "15 min ago", status: "Success" },
                          { user: "Charlie Wilson", action: "Shared link", time: "20 min ago", status: "Success" },
                        ].map((row, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{row.user}</td>
                            <td className="py-3 px-4 text-muted-foreground">{row.action}</td>
                            <td className="py-3 px-4 text-muted-foreground">{row.time}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integration Info */}
            <Card className="mt-6 border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Ready to Integrate?
                </CardTitle>
                <CardDescription>
                  This dashboard can be embedded directly into your application with just a few lines of code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Get API Key</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate an API key from your organization settings
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">2. Copy Code</h4>
                    <p className="text-sm text-muted-foreground">
                      Click "Integration Code" to get the embed snippet
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">3. Paste & Deploy</h4>
                    <p className="text-sm text-muted-foreground">
                      Add the code to your app and you're done!
                    </p>
                  </div>
                </div>
                <Button onClick={() => router.push(`/${params.orgSlug}/settings`)}>
                  Go to Settings
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
