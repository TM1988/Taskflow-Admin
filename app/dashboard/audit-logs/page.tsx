"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllAuditLogs, AuditLog } from "@/services/audit/audit-service";
import { Loader2, FileSearch, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const auditLogs = await getAllAuditLogs(100);
      setLogs(auditLogs);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      create: "default",
      update: "secondary",
      delete: "destructive",
      view: "outline",
      read: "outline"
    };
    return <Badge variant={variants[action] || "default"}>{action}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Audit Logs"
        description="Track all administrative actions and changes"
        icon={<FileSearch className="h-6 w-6" />}
        actions={
          <Button onClick={fetchLogs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              All actions performed in the system
            </CardDescription>
          </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No audit logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {log.timestamp?.toDate ? 
                          format(log.timestamp.toDate(), "MMM dd, yyyy HH:mm:ss") : 
                          "-"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{log.userEmail}</span>
                          <span className="text-xs text-muted-foreground">
                            {log.userId?.slice(0, 8)}...
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{log.resource}</span>
                          {log.resourceId && (
                            <span className="text-xs text-muted-foreground">
                              ID: {log.resourceId.slice(0, 12)}...
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.details ? (
                          <pre className="text-xs max-w-xs overflow-hidden">
                            {JSON.stringify(log.details, null, 2).slice(0, 100)}
                          </pre>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
