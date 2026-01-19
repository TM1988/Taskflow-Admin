"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Database, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MongoDBConnectionSettings() {
  const { organization, refreshOrganization } = useAuth();
  const { toast } = useToast();
  const [connectionString, setConnectionString] = useState(
    organization?.mongodbConfig?.connectionString || ""
  );
  const [databaseName, setDatabaseName] = useState(
    organization?.mongodbConfig?.databaseName || ""
  );
  const [enabled, setEnabled] = useState(
    organization?.mongodbConfig?.enabled || false
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleTestConnection = async () => {
    if (!connectionString || !databaseName) {
      toast({
        title: "Missing Information",
        description: "Please provide both connection string and database name",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/organizations/mongodb/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": organization!.id,
        },
        body: JSON.stringify({
          connectionString,
          databaseName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: `Connected successfully! Found ${data.collectionsCount} collections.`,
        });
        toast({
          title: "Connection Successful",
          description: data.message,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Connection failed",
        });
        toast({
          title: "Connection Failed",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || "Failed to test connection",
      });
      toast({
        title: "Error",
        description: "Failed to test connection",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!organization) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/organizations/${organization.id}/mongodb`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": organization.id,
        },
        body: JSON.stringify({
          connectionString,
          databaseName,
          enabled,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save MongoDB configuration");
      }

      toast({
        title: "Settings Saved",
        description: "MongoDB connection settings have been updated",
      });

      // Refresh organization data
      await refreshOrganization();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Custom MongoDB Connection
        </CardTitle>
        <CardDescription>
          Connect your own MongoDB database to use your organization's data in dashboards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>Note:</strong> Your MongoDB connection string will be encrypted and stored securely. 
            Only your organization can access this data.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connectionString">MongoDB Connection String</Label>
            <Input
              id="connectionString"
              type="password"
              placeholder="mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"
              value={connectionString}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConnectionString(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your MongoDB Atlas connection string or self-hosted MongoDB URI
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="databaseName">Database Name</Label>
            <Input
              id="databaseName"
              placeholder="my-database"
              value={databaseName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDatabaseName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Custom Connection</Label>
              <p className="text-sm text-muted-foreground">
                Use this connection for all dashboard queries
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 mt-0.5" />
                )}
                <AlertDescription>{testResult.message}</AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={testing || !connectionString || !databaseName}
          >
            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Connection
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !connectionString || !databaseName}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
